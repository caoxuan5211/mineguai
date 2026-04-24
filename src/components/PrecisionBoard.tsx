import type { DirectionId, Player } from "../lib/ledger";
import { formatAmount, formatMoney, getStepAmounts, type NetResult } from "../lib/ledger";

type PrecisionBoardProps = {
  players: Player[];
  netResults: NetResult[];
  stepValue: number;
  onApplyRecord: (
    opponentId: number,
    amount: number,
    direction: DirectionId,
    mode: "precision",
  ) => void;
};

export function PrecisionBoard({
  players,
  netResults,
  stepValue,
  onApplyRecord,
}: PrecisionBoardProps) {
  const amounts = getStepAmounts(stepValue);

  return (
    <section className="arena-card space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">逐笔控制</p>
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
          保留旧心智，但把它做得更像一块控制台。
        </h3>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {players
          .filter((player) => player.id !== 0)
          .map((player) => {
            const net = netResults.find((result) => result.player.id === player.id)?.total ?? 0;
            return (
              <article key={player.id} className="precision-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/46">与 {player.name} 结算</p>
                    <h4 className="text-xl font-semibold text-white">{player.name}</h4>
                  </div>
                  <div className="text-right">
                    <small className="text-white/42">净胜负</small>
                    <div className="text-xl font-semibold text-white">{formatMoney(net)}</div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-5 gap-2">
                  {amounts.map((amount) => (
                    <button
                      key={`loss-${player.id}-${amount}`}
                      type="button"
                      className="score-button score-button--lose score-button--compact"
                      onClick={() => onApplyRecord(player.id, amount, "lose", "precision")}
                    >
                      -{formatAmount(amount)}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {amounts.map((amount) => (
                    <button
                      key={`gain-${player.id}-${amount}`}
                      type="button"
                      className="score-button score-button--win score-button--compact"
                      onClick={() => onApplyRecord(player.id, amount, "win", "precision")}
                    >
                      +{formatAmount(amount)}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}
