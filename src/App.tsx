import { useEffect, useMemo, useState } from "react";
import { ArrowClockwise, Trash } from "@phosphor-icons/react";
import { useTableLedger } from "./hooks/useTableLedger";
import { formatAmount, type Direction } from "./lib/tableLedger";

const FIXED_AMOUNTS = [1, 2, 5, 10] as const;

function toneClass(value: number) {
  if (value > 0) return "is-positive";
  if (value < 0) return "is-negative";
  return "is-even";
}

export default function App() {
  const ledger = useTableLedger();
  const balances = ledger.balances;
  const opponents = ledger.state.players.filter((player) => player.id !== "p0");
  const [opponentId, setOpponentId] = useState(opponents[0]?.id ?? "p1");
  const [direction, setDirection] = useState<Direction>("win");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (opponents.length && !opponents.some((player) => player.id === opponentId)) {
      setOpponentId(opponents[0].id);
    }
  }, [opponentId, opponents]);

  const leaderId = useMemo(() => {
    const scores = ledger.state.players.map((player) => ({
      id: player.id,
      balance: balances[player.id] ?? 0,
    }));
    const highScore = Math.max(...scores.map((item) => item.balance));
    const leaders = scores.filter((item) => item.balance === highScore);
    return highScore > 0 && leaders.length === 1 ? leaders[0].id : "";
  }, [balances, ledger.state.players]);

  function recordAmount(amount: number, clearDraft = false) {
    setError("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("请输入大于 0 的金额。");
      return;
    }
    if (!opponentId || opponentId === "p0") {
      setError("请选择一个对手。");
      return;
    }
    ledger.addRecord(opponentId, direction, value, "");
    if (clearDraft) setCustomAmount("");
  }

  function submitCustomAmount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    recordAmount(Number(customAmount), true);
  }

  function resetAll() {
    if (confirm("确认清空所有记账数据？")) ledger.reset();
  }

  return (
    <main className="app-shell">
      <a href="#ledger" className="skip-link">跳到记账区</a>

      <header className="topbar">
        <div>
          <p className="eyebrow">Mineguai</p>
          <h1>麻将记账器</h1>
        </div>
        <div className="top-actions" aria-label="账本操作">
          <button type="button" onClick={ledger.undoLast} disabled={!ledger.state.records.length}>
            <ArrowClockwise size={18} aria-hidden="true" />
            撤销
          </button>
          <button type="button" className="danger-button" onClick={resetAll}>
            <Trash size={18} aria-hidden="true" />
            清空
          </button>
        </div>
      </header>

      <section className="balance-summary" aria-label="我的总盈亏">
        <span>我的总盈亏</span>
        <strong className={toneClass(balances.p0 ?? 0)}>{formatAmount(balances.p0 ?? 0)}</strong>
      </section>

      <section className="score-wall" aria-label="玩家分数">
        {ledger.state.players.map((player, index) => {
          const balance = balances[player.id] ?? 0;
          const label = index === 0 ? "自己" : `对手 ${index}`;
          return (
            <article
              className={`player-card ${leaderId === player.id ? "leader" : ""} ${toneClass(balance)}`}
              key={player.id}
            >
              <label className="player-name-field">
                <span>{label}</span>
                <input
                  aria-label={`编辑${label}名称`}
                  value={player.name}
                  spellCheck={false}
                  onBlur={(event) => {
                    if (!event.target.value.trim()) ledger.renamePlayer(player.id, index === 0 ? "我" : `玩家${index}`);
                  }}
                  onChange={(event) => ledger.renamePlayer(player.id, event.target.value)}
                />
              </label>
              <strong>{formatAmount(balance)}</strong>
              {leaderId === player.id ? <em>领先</em> : null}
            </article>
          );
        })}
      </section>

      <section className="workbench" id="ledger">
        <section className="panel record-panel" aria-labelledby="record-title">
          <div className="panel-head">
            <h2 id="record-title">记一笔</h2>
          </div>

          <div className="field-group">
            <span className="field-label">对手</span>
            <div className="opponent-strip" aria-label="选择对手">
              {opponents.map((player) => (
                <button
                  className={opponentId === player.id ? "active" : ""}
                  type="button"
                  key={player.id}
                  aria-pressed={opponentId === player.id}
                  onClick={() => setOpponentId(player.id)}
                >
                  <span>{player.name || "未命名"}</span>
                  <strong>{formatAmount(balances[player.id] ?? 0)}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <span className="field-label">方向</span>
            <div className="direction-switch" role="tablist" aria-label="输赢方向">
              <button
                className={direction === "win" ? "active win" : "win"}
                type="button"
                aria-pressed={direction === "win"}
                onClick={() => setDirection("win")}
              >
                我赢
              </button>
              <button
                className={direction === "lose" ? "active lose" : "lose"}
                type="button"
                aria-pressed={direction === "lose"}
                onClick={() => setDirection("lose")}
              >
                我输
              </button>
            </div>
          </div>

          <div className="field-group">
            <span className="field-label">金额</span>
            <div className="quick-amounts" aria-label="固定金额">
              {FIXED_AMOUNTS.map((amount) => (
                <button type="button" key={amount} onClick={() => recordAmount(amount)}>
                  {amount}
                </button>
              ))}
            </div>
          </div>

          <form className="custom-amount" onSubmit={submitCustomAmount}>
            <label>
              <span>自定义金额</span>
              <input
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.1"
                value={customAmount}
                placeholder="输入金额"
                onChange={(event) => setCustomAmount(event.target.value)}
              />
            </label>
            <button type="submit">记账</button>
          </form>

          {error ? <p className="form-error">{error}</p> : null}
        </section>
      </section>
    </main>
  );
}
