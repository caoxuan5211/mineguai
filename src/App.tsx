import { useEffect, useMemo, useState } from "react";
import { ArrowClockwise, DownloadSimple, Trash, UploadSimple } from "@phosphor-icons/react";
import { useTableLedger } from "./hooks/useTableLedger";
import { formatAmount, type Direction, type RecordItem } from "./lib/tableLedger";

function playerName(players: { id: string; name: string }[], id: string) {
  return players.find((player) => player.id === id)?.name || "未知玩家";
}

function recordLine(record: RecordItem, players: { id: string; name: string }[]) {
  const name = playerName(players, record.opponentId);
  return record.direction === "win"
    ? `我赢了 ${name} ${record.amount}`
    : `我输给 ${name} ${record.amount}`;
}

export default function App() {
  const ledger = useTableLedger();
  const opponents = ledger.state.players.filter((player) => player.id !== "p0");
  const [opponentId, setOpponentId] = useState(opponents[0]?.id ?? "p1");
  const [direction, setDirection] = useState<Direction>("win");
  const [stepDraft, setStepDraft] = useState(String(ledger.state.step));
  const [error, setError] = useState("");
  const [impact, setImpact] = useState(false);
  const [lastAction, setLastAction] = useState("点一个金额，账面马上变化。");
  const balances = ledger.balances;

  useEffect(() => {
    setStepDraft(String(ledger.state.step));
  }, [ledger.state.step]);

  const rankedPlayers = useMemo(() => {
    return [...ledger.state.players].sort((a, b) => balances[b.id] - balances[a.id]);
  }, [balances, ledger.state.players]);

  const settlements = useMemo(() => {
    const debtors = ledger.state.players.map((player) => ({ player, value: balances[player.id] })).filter((item) => item.value < 0).sort((a, b) => a.value - b.value);
    const creditors = ledger.state.players.map((player) => ({ player, value: balances[player.id] })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
    const lines: string[] = [];
    debtors.forEach((debtor) => {
      let debt = Math.abs(debtor.value);
      creditors.forEach((creditor) => {
        if (debt <= 0 || creditor.value <= 0) return;
        const pay = Math.min(debt, creditor.value);
        lines.push(`${debtor.player.name} 给 ${creditor.player.name} ${formatAmount(pay).replace("+", "")}`);
        debt -= pay;
        creditor.value -= pay;
      });
    });
    return lines;
  }, [balances, ledger.state.players]);

  function recordAmount(multiplier: number) {
    setError("");
    const value = ledger.state.step * multiplier;
    if (!Number.isFinite(value) || value <= 0) return setError("步长必须大于 0。");
    if (!opponentId || opponentId === "p0") return setError("请选择一个对手。");
    const opponent = playerName(ledger.state.players, opponentId);
    ledger.addRecord(opponentId, direction, value, "");
    setLastAction(`${direction === "win" ? "赢了" : "输了"} ${opponent} ${formatAmount(value).replace("+", "")}`);
    setImpact(false);
    window.setTimeout(() => setImpact(true), 0);
    window.setTimeout(() => setImpact(false), 360);
  }

  function changeStep(value: string) {
    setStepDraft(value);
    const nextStep = Number(value);
    if (Number.isFinite(nextStep) && nextStep > 0) ledger.setStep(nextStep);
  }

  function exportLedger() {
    const blob = new Blob([JSON.stringify(ledger.state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mineguai-ledger-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importLedger(file?: File) {
    if (!file) return;
    file.text()
      .then((text) => ledger.importState(JSON.parse(text)))
      .catch(() => setError("导入失败，请选择有效的 JSON 账本文件。"));
  }

  function resetAll() {
    if (confirm("确认清空所有记账数据？")) ledger.reset();
  }

  return (
    <main className="app-shell">
      <a href="#ledger" className="skip-link">跳到记账区</a>
      <div className="grain" aria-hidden="true" />

      <nav className="nav">
        <strong>麻将记账器</strong>
        <div>
          <button type="button" onClick={exportLedger}><DownloadSimple size={18} />导出</button>
          <label><UploadSimple size={18} />导入<input type="file" accept="application/json" onChange={(e) => importLedger(e.target.files?.[0])} /></label>
        </div>
      </nav>

      <section className="hero">
        <div>
          <p className="kicker">one-tap personal ledger</p>
          <h1>麻将记账器 麻将记账器 麻将记账器</h1>
        </div>
        <aside className="hero-ticket">
          <span>我的总盈亏</span>
          <strong className={impact ? "is-impacting" : ""}>{formatAmount(balances.p0)}</strong>
          <small>{lastAction}</small>
        </aside>
      </section>

      <section className="score-wall">
        {rankedPlayers.map((player, index) => (
          <article className={`player-card ${index === 0 ? "leader" : ""} ${player.id === "p0" ? "self" : ""} ${balances[player.id] > 0 ? "positive" : ""} ${balances[player.id] < 0 ? "negative" : ""}`} key={player.id}>
            <input value={player.name} onChange={(event) => ledger.renamePlayer(player.id, event.target.value)} />
            <strong>{formatAmount(balances[player.id])}</strong>
            <span>{player.id === "p0" ? "我自己" : `排名 ${index + 1}`}</span>
          </article>
        ))}
      </section>

      <section className="workbench" id="ledger">
        <section className="panel record-panel">
          <div className="panel-head">
            <p className="kicker">press to count</p>
            <h2>点金额即入账</h2>
          </div>

          <div className="opponent-strip" aria-label="选择对手">
            {opponents.map((player) => (
              <button className={opponentId === player.id ? "active" : ""} type="button" key={player.id} onClick={() => setOpponentId(player.id)}>
                <span>{player.name}</span>
                <strong>{formatAmount(balances[player.id])}</strong>
              </button>
            ))}
          </div>

          <div className="direction-switch" role="tablist" aria-label="输赢方向">
            <button className={direction === "win" ? "active win" : "win"} type="button" onClick={() => setDirection("win")}>我赢</button>
            <button className={direction === "lose" ? "active lose" : "lose"} type="button" onClick={() => setDirection("lose")}>我输</button>
          </div>

          <div className="quick-amounts">
            {[1, 2, 5, 10].map((multiplier) => (
              <button type="button" key={multiplier} onClick={() => recordAmount(multiplier)}>
                <span>x{multiplier}</span>
                <strong>{formatAmount(ledger.state.step * multiplier).replace("+", "")}</strong>
              </button>
            ))}
          </div>

          <label className="step-editor">默认步长
            <input type="number" min="0.1" step="0.1" value={stepDraft} onChange={(e) => changeStep(e.target.value)} />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
        </section>

        <aside className="panel settlement-panel">
          <div className="panel-head">
            <p className="kicker">settlement</p>
            <h2>结账建议</h2>
          </div>
          <div className="settlement-list">
            {settlements.length ? settlements.map((line) => <p key={line}>{line}</p>) : <p>现在没有人需要结算。</p>}
          </div>
          <div className="tool-row">
            <button type="button" onClick={ledger.undoLast}><ArrowClockwise size={18} />撤销上一笔</button>
            <button type="button" onClick={resetAll}><Trash size={18} />清空重开</button>
          </div>
        </aside>
      </section>

      <section className="history">
        <div className="history-head">
          <p className="kicker">history</p>
          <h2>流水别藏起来。</h2>
        </div>
        <div className="history-list">
          {[...ledger.state.records].reverse().map((record) => (
            <article key={record.id} className="history-item">
              <div><strong>{recordLine(record, ledger.state.players)}</strong><small>{new Date(record.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</small></div>
              <button type="button" onClick={() => ledger.removeRecord(record.id)}>删除</button>
            </article>
          ))}
          {!ledger.state.records.length ? <div className="empty">还没有流水。选一个人，选我赢/我输，再点金额。</div> : null}
        </div>
      </section>
    </main>
  );
}
