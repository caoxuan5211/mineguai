import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowCounterClockwise, CaretDown, CaretLeft, CaretRight, Plus } from "@phosphor-icons/react";
import {
  formatAmount,
  formatMoney,
  getStepAmounts,
  type LedgerState,
  type NetResult,
  type Player,
} from "../lib/ledger";

gsap.registerPlugin(useGSAP);

type RoundTableLedgerProps = {
  state: LedgerState;
  currentLeader: Player;
  largestSpread: number;
  netResults: NetResult[];
  onApplyRecord: (
    opponentId: number,
    amount: number,
    direction: "win" | "lose",
    mode: "rapid" | "precision",
  ) => void;
  onUndoLast: () => void;
  onNextSession: () => void;
  onSetPlayerNames: (names: string[]) => void;
  onSetStepValue: (value: number) => void;
};

const STEP_PRESETS = [0.5, 1, 2];

export function RoundTableLedger({
  state,
  currentLeader,
  largestSpread,
  netResults,
  onApplyRecord,
  onUndoLast,
  onNextSession,
  onSetPlayerNames,
  onSetStepValue,
}: RoundTableLedgerProps) {
  const opponents = state.players.filter((player) => player.id !== 0);
  const [selectedOpponentId, setSelectedOpponentId] = useState(opponents[0]?.id ?? 1);
  const [direction, setDirection] = useState<"win" | "lose">("win");
  const [isNamesOpen, setIsNamesOpen] = useState(false);
  const [isStepOpen, setIsStepOpen] = useState(false);
  const [draftNames, setDraftNames] = useState(state.players.map((player) => player.name));
  const stageRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setDraftNames(state.players.map((player) => player.name));
  }, [state.players]);

  useEffect(() => {
    if (!opponents.some((player) => player.id === selectedOpponentId)) {
      setSelectedOpponentId(opponents[0]?.id ?? 1);
    }
  }, [opponents, selectedOpponentId]);

  useGSAP(
    () => {
      gsap.from(".table-core", {
        scale: 0.86,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
      });

      gsap.from(".table-node", {
        y: 32,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        delay: 0.12,
        ease: "power3.out",
      });

      gsap.from(".ledger-rail", {
        y: 70,
        opacity: 0,
        duration: 0.75,
        delay: 0.22,
        ease: "power3.out",
      });
    },
    { scope: stageRef },
  );

  const selectedOpponent = opponents.find((player) => player.id === selectedOpponentId) ?? opponents[0];
  const amounts = getStepAmounts(state.session.stepValue);
  const railTitle =
    direction === "win"
      ? `我赢 ${selectedOpponent?.name ?? "对手"}`
      : `我输给 ${selectedOpponent?.name ?? "对手"}`;

  const opponentTotals = useMemo(() => {
    return new Map(netResults.map((item) => [item.player.id, item.total]));
  }, [netResults]);

  function cycleOpponent(step: number) {
    if (opponents.length === 0) {
      return;
    }

    const currentIndex = opponents.findIndex((player) => player.id === selectedOpponentId);
    const nextIndex = (currentIndex + step + opponents.length) % opponents.length;
    setSelectedOpponentId(opponents[nextIndex].id);
  }

  function commitAmount(amount: number) {
    if (!selectedOpponent) {
      return;
    }

    onApplyRecord(selectedOpponent.id, amount, direction, "rapid");
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX ?? null;

    if (startX === null || endX === null) {
      return;
    }

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 36) {
      return;
    }

    cycleOpponent(deltaX > 0 ? -1 : 1);
  }

  return (
    <section className="round-shell" ref={stageRef}>
      <div className="round-shell__summary">
        <div>
          <span className="round-shell__label">第 {state.session.roundIndex} 局</span>
          <strong className="round-shell__value">{currentLeader.name}</strong>
          <span className="round-shell__sub">领先 {formatMoney(currentLeader.balance)}</span>
        </div>
        <div>
          <span className="round-shell__label">当前分差</span>
          <strong className="round-shell__value">{formatAmount(largestSpread)}</strong>
          <span className="round-shell__sub">步长 {formatAmount(state.session.stepValue)}</span>
        </div>
      </div>

      <section
        className="table-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="table-stage__header">
          <div>
            <span className="round-shell__label">round table control ring</span>
            <p className="table-stage__copy">点三家之一，再在下方完成记分。</p>
          </div>
          <div className="table-stage__chevrons">
            <button type="button" className="icon-button" onClick={() => cycleOpponent(-1)} aria-label="上一个对手">
              <CaretLeft size={18} weight="bold" />
            </button>
            <button type="button" className="icon-button" onClick={() => cycleOpponent(1)} aria-label="下一个对手">
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </div>

        <div className="table-stage__surface">
          <div className="table-core" />

          {opponents.map((player, index) => {
            const position = ["top", "left", "right"][index] ?? "top";
            const isActive = player.id === selectedOpponentId;
            return (
              <button
                key={player.id}
                type="button"
                className={`table-node table-node--${position} ${isActive ? "table-node--active" : ""}`}
                onClick={() => setSelectedOpponentId(player.id)}
              >
                <span className="table-node__name">{player.name}</span>
                <span className="table-node__score">{formatMoney(opponentTotals.get(player.id) ?? 0)}</span>
              </button>
            );
          })}

          <div className="table-stage__me">
            <span>我</span>
            <strong>{formatMoney(state.players[0]?.balance ?? 0)}</strong>
          </div>
        </div>

        <div className="ledger-rail">
          <div className="ledger-rail__top">
            <div>
              <span className="round-shell__label">当前目标</span>
              <strong className="ledger-rail__title">{railTitle}</strong>
            </div>
            <div className="ledger-rail__actions">
              <button type="button" className="icon-button" onClick={onUndoLast} aria-label="撤销上一笔">
                <ArrowCounterClockwise size={18} weight="bold" />
              </button>
              <button type="button" className="icon-button icon-button--accent" onClick={onNextSession} aria-label="开新一局">
                <Plus size={18} weight="bold" />
              </button>
            </div>
          </div>

          <div className="direction-toggle" role="tablist" aria-label="输赢方向">
            <button
              type="button"
              className={direction === "win" ? "direction-toggle__button direction-toggle__button--active" : "direction-toggle__button"}
              onClick={() => setDirection("win")}
            >
              我赢
            </button>
            <button
              type="button"
              className={direction === "lose" ? "direction-toggle__button direction-toggle__button--active" : "direction-toggle__button"}
              onClick={() => setDirection("lose")}
            >
              我输
            </button>
          </div>

          <div className="amount-strip">
            {amounts.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`amount-strip__button ${direction === "win" ? "amount-strip__button--win" : "amount-strip__button--lose"}`}
                onClick={() => commitAmount(amount)}
              >
                <span>{direction === "win" ? "+" : "-"}</span>
                <strong>{formatAmount(amount)}</strong>
              </button>
            ))}
          </div>

          <div className="mini-tools">
            <button
              type="button"
              className={`mini-tools__trigger ${isStepOpen ? "mini-tools__trigger--open" : ""}`}
              onClick={() => setIsStepOpen((current) => !current)}
            >
              步长
              <CaretDown size={16} weight="bold" />
            </button>
            <button
              type="button"
              className={`mini-tools__trigger ${isNamesOpen ? "mini-tools__trigger--open" : ""}`}
              onClick={() => setIsNamesOpen((current) => !current)}
            >
              改名
              <CaretDown size={16} weight="bold" />
            </button>
          </div>

          {isStepOpen ? (
            <div className="drawer-panel">
              <div className="preset-row">
                {STEP_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`preset-pill ${state.session.stepValue === preset ? "preset-pill--active" : ""}`}
                    onClick={() => onSetStepValue(preset)}
                  >
                    {formatAmount(preset)}
                  </button>
                ))}
                <input
                  className="step-input"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={state.session.stepValue}
                  onChange={(event) => onSetStepValue(Number(event.target.value))}
                />
              </div>
            </div>
          ) : null}

          {isNamesOpen ? (
            <div className="drawer-panel drawer-panel--names">
              {draftNames.map((name, index) => (
                <label key={state.players[index].id} className="name-row">
                  <span>{index === 0 ? "我" : `对手 ${index}`}</span>
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
              <button type="button" className="save-pill" onClick={() => onSetPlayerNames(draftNames)}>
                保存称呼
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
