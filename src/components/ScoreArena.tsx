import { useEffect, useState } from "react";
import {
  ChartLineUp,
  CrownSimple,
  DotsThreeOutlineVertical,
  Sparkle,
} from "@phosphor-icons/react";
import { RapidPad } from "./RapidPad";
import { PrecisionBoard } from "./PrecisionBoard";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { formatAmount, formatMoney, type LedgerState, type NetResult, type Player } from "../lib/ledger";

type ScoreArenaProps = {
  state: LedgerState;
  currentLeader: Player;
  largestSpread: number;
  momentumSummary: string;
  netResults: NetResult[];
  onApplyRecord: (
    opponentId: number,
    amount: number,
    direction: "win" | "lose",
    mode: "rapid" | "precision",
  ) => void;
  onEndSession: () => void;
  onNextSession: () => void;
  onSetDealer: (playerId: number) => void;
  onSetPlayerNames: (names: string[]) => void;
  onSetStage: (stage: "east" | "south") => void;
  onSetStepValue: (value: number) => void;
  onSetTheme: (theme: "jade" | "ink" | "brass") => void;
};

const stageOptions = [
  { id: "east", label: "东风" },
  { id: "south", label: "南风" },
] as const;

const stepPresets = [0.5, 1, 2];

export function ScoreArena({
  state,
  currentLeader,
  largestSpread,
  momentumSummary,
  netResults,
  onApplyRecord,
  onEndSession,
  onNextSession,
  onSetDealer,
  onSetPlayerNames,
  onSetStage,
  onSetStepValue,
  onSetTheme,
}: ScoreArenaProps) {
  const [draftNames, setDraftNames] = useState(state.players.map((player) => player.name));

  useEffect(() => {
    setDraftNames(state.players.map((player) => player.name));
  }, [state.players]);

  return (
    <section id="score-arena" className="section-space">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm tracking-[0.2em] text-white/45">现在上桌</p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl">
            现在开始记，把这局打成能回看的样子。
          </h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <section className="arena-shell space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="summary-card">
                <Sparkle size={20} weight="duotone" />
                <small>当前领先</small>
                <strong>{currentLeader.name}</strong>
                <span>{formatMoney(currentLeader.balance)}</span>
              </article>
              <article className="summary-card">
                <ChartLineUp size={20} weight="duotone" />
                <small>最大分差</small>
                <strong>{formatAmount(largestSpread)}</strong>
                <span>round {state.session.roundIndex}</span>
              </article>
              <article className="summary-card">
                <DotsThreeOutlineVertical size={20} weight="duotone" />
                <small>当前步长</small>
                <strong>{formatAmount(state.session.stepValue)}</strong>
                <span>{momentumSummary}</span>
              </article>
            </div>

            <div className="arena-card space-y-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="eyebrow">圈风与步长</p>
                    <div className="flex flex-wrap gap-3">
                      {stageOptions.map((stage) => (
                        <button
                          key={stage.id}
                          type="button"
                          className={`segment-button ${state.session.stage === stage.id ? "segment-button--active" : ""}`}
                          onClick={() => onSetStage(stage.id)}
                        >
                          {stage.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="eyebrow">步长</p>
                    <div className="flex flex-wrap gap-3">
                      {stepPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={`segment-button ${state.session.stepValue === preset ? "segment-button--active" : ""}`}
                          onClick={() => onSetStepValue(preset)}
                        >
                          {formatAmount(preset)}
                        </button>
                      ))}
                      <label className="step-field">
                        <span>自定义</span>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={state.session.stepValue}
                          onChange={(event) => onSetStepValue(Number(event.target.value))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="eyebrow">谁在坐庄</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {state.players.map((player) => (
                        <button
                          key={player.id}
                          type="button"
                          className={`dealer-chip ${player.isDealer ? "dealer-chip--active" : ""}`}
                          onClick={() => onSetDealer(player.id)}
                        >
                          <CrownSimple size={18} weight="duotone" />
                          {player.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" className="soft-button soft-button--ghost" onClick={onEndSession}>
                      结束本局
                    </button>
                    <button type="button" className="soft-button soft-button--primary" onClick={onNextSession}>
                      开新一局
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <RapidPad players={state.players} stepValue={state.session.stepValue} onApplyRecord={onApplyRecord} />
            <PrecisionBoard
              players={state.players}
              netResults={netResults}
              stepValue={state.session.stepValue}
              onApplyRecord={onApplyRecord}
            />
          </section>

          <aside className="space-y-4">
            <section className="arena-card space-y-4">
              <div className="space-y-2">
                <p className="eyebrow">桌上的人</p>
                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  先把桌上的人叫对。
                </h3>
              </div>
              <div className="grid gap-3">
                {draftNames.map((name, index) => (
                  <label key={state.players[index].id} className="name-field">
                    <span>{index === 0 ? "主位" : `${index}号`}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => {
                        const next = [...draftNames];
                        next[index] = event.target.value;
                        setDraftNames(next);
                      }}
                    />
                  </label>
                ))}
              </div>
              <button type="button" className="soft-button soft-button--light" onClick={() => onSetPlayerNames(draftNames)}>
                保存称呼
              </button>
            </section>

            <ThemeSwitcher currentTheme={state.session.theme} onChange={onSetTheme} />
          </aside>
        </div>
      </div>
    </section>
  );
}
