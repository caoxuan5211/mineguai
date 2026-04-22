import { useEffect, useState } from "react";
import type { DirectionId, Player } from "../lib/ledger";
import { formatAmount, getStepAmounts } from "../lib/ledger";

type RapidPadProps = {
  players: Player[];
  stepValue: number;
  onApplyRecord: (
    opponentId: number,
    amount: number,
    direction: DirectionId,
    mode: "rapid",
  ) => void;
};

export function RapidPad({ players, stepValue, onApplyRecord }: RapidPadProps) {
  const opponents = players.filter((player) => player.id !== 0);
  const [selectedOpponentId, setSelectedOpponentId] = useState<number>(opponents[0]?.id ?? 1);
  const amounts = getStepAmounts(stepValue);

  useEffect(() => {
    setSelectedOpponentId(opponents[0]?.id ?? 1);
  }, [players]);

  function commit(direction: DirectionId, amount: number) {
    onApplyRecord(selectedOpponentId, amount, direction, "rapid");
  }

  return (
    <section className="arena-card space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">快记</p>
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
          先点人，再点输赢。
        </h3>
        <p className="text-white/62">
          手机端优先，把一次记分压缩成最短路径，减少误触和停顿。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {opponents.map((opponent) => (
          <button
            key={opponent.id}
            type="button"
            className={`player-chip ${selectedOpponentId === opponent.id ? "player-chip--active" : ""}`}
            onClick={() => setSelectedOpponentId(opponent.id)}
          >
            <span className="player-chip__tone">{opponent.accentToken}</span>
            <strong>{opponent.name}</strong>
            <small>锁定对象</small>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-[2rem] border border-rose-100/10 bg-rose-300/5 p-5">
          <div className="flex items-center justify-between">
            <strong className="text-lg text-white">我输给 {players[selectedOpponentId]?.name}</strong>
            <span className="text-sm text-rose-200/70">lose</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amounts.map((amount) => (
              <button
                key={`lose-${amount}`}
                type="button"
                className="score-button score-button--lose"
                onClick={() => commit("lose", amount)}
              >
                -{formatAmount(amount)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-[2rem] border border-emerald-100/10 bg-emerald-300/5 p-5">
          <div className="flex items-center justify-between">
            <strong className="text-lg text-white">我赢了 {players[selectedOpponentId]?.name}</strong>
            <span className="text-sm text-emerald-200/70">win</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amounts.map((amount) => (
              <button
                key={`win-${amount}`}
                type="button"
                className="score-button score-button--win"
                onClick={() => commit("win", amount)}
              >
                +{formatAmount(amount)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
