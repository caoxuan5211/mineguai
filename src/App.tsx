import { useState, useEffect, useCallback, useRef } from "react";
import { useLedger } from "./hooks/useLedger";
import { getAmounts, formatMoney } from "./lib/ledger";

/* ===== 轻触音效 ===== */
function useTap() {
  const ctx = useRef<AudioContext | null>(null);
  return useCallback((tone: "soft" | "win" | "lose" = "soft") => {
    try {
      const c = ctx.current ?? new (window.AudioContext || (window as any).webkitAudioContext)();
      ctx.current = c;
      const now = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      const f = { soft: 520, win: 700, lose: 280 }[tone];
      o.type = "sine";
      o.frequency.setValueAtTime(f, now);
      o.frequency.exponentialRampToValueAtTime(f * 0.7, now + 0.07);
      g.gain.setValueAtTime(0.04, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      o.connect(g);
      g.connect(c.destination);
      o.start(now);
      o.stop(now + 0.11);
    } catch { /* noop */ }
  }, []);
}

/* ===== 手势左右滑动切换对手 ===== */
function useSwipe(onSwipe: (dir: -1 | 1) => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  const start = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => { start.current = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - start.current;
      if (Math.abs(dx) > 40) onSwipe(dx > 0 ? -1 : 1);
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => { el.removeEventListener("touchstart", onStart); el.removeEventListener("touchend", onEnd); };
  }, [onSwipe]);
  return ref;
}

export default function App() {
  const { state, record, undo, next, rename, changeStep } = useLedger();
  const play = useTap();
  const [opponent, setOpponent] = useState(1);
  const [direction, setDirection] = useState<"win" | "lose">("win");
  const [editing, setEditing] = useState(false);
  const [showStep, setShowStep] = useState(false);
  const [names, setNames] = useState(state.players.map(p => p.name));

  const amounts = getAmounts(state.step);
  const opponents = state.players.filter(p => p.id !== 0);
  const hasRecords = state.records.length > 0;
  const opp = opponents.find(p => p.id === opponent) ?? opponents[0];
  const swipeRef = useSwipe((dir) => {
    const idx = opponents.findIndex(p => p.id === opponent);
    const next = (idx + dir + opponents.length) % opponents.length;
    setOpponent(opponents[next].id);
  });

  useEffect(() => { setNames(state.players.map(p => p.name)); }, [state.players]);

  function commit(amount: number) {
    record(opponent, amount, direction);
    play(direction === "win" ? "win" : "lose");
  }

  function handleUndo() { undo(); play("soft"); }
  function handleNext() { next(); play("soft"); }

  function saveNames() {
    rename(names);
    setEditing(false);
  }

  return (
    <div className="app" ref={swipeRef}>
      {/* ===== 顶部栏 ===== */}
      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo">Mineguai</span>
          <span className="topbar__session">第 {state.session} 局</span>
        </div>
        <div className="topbar__actions">
          <button
            className={`btn-ghost ${showStep ? "btn-ghost--active" : ""}`}
            onClick={() => setShowStep(v => !v)}
          >
            步长 {state.step}
          </button>
          <button
            className={`btn-ghost ${editing ? "btn-ghost--active" : ""}`}
            onClick={() => setEditing(v => !v)}
          >
            改名
          </button>
        </div>
      </header>

      {/* ===== 步长调节 ===== */}
      {showStep && (
        <div className="drawer">
          <div className="drawer__row">
            {[0.5, 1, 2, 5].map(v => (
              <button
                key={v}
                className={`chip ${state.step === v ? "chip--active" : ""}`}
                onClick={() => changeStep(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== 改名面板 ===== */}
      {editing && (
        <div className="drawer">
          <div className="drawer__grid">
            {names.map((n, i) => (
              <label key={i} className="name-field">
                <span>{i === 0 ? "我" : `对手 ${i}`}</span>
                <input
                  value={n}
                  onChange={e => { const nx = [...names]; nx[i] = e.target.value; setNames(nx); }}
                  placeholder={state.players[i].name}
                />
              </label>
            ))}
          </div>
          <button className="chip chip--accent" onClick={saveNames}>保存</button>
        </div>
      )}

      {/* ===== 记分牌 ===== */}
      <section className="scoreboard">
        {state.players.map(p => (
          <div key={p.id} className={`score-card ${p.id === 0 ? "score-card--me" : ""} ${p.balance > 0 ? "score-card--up" : p.balance < 0 ? "score-card--down" : ""}`}>
            <span className="score-card__name">{p.name}</span>
            <span className="score-card__balance">{formatMoney(p.balance)}</span>
          </div>
        ))}
      </section>

      {/* ===== 对手选择 ===== */}
      <section className="opponent-bar">
        <span className="label">选择对手</span>
        <div className="opponent-row">
          {opponents.map(p => (
            <button
              key={p.id}
              className={`opp-btn ${opponent === p.id ? "opp-btn--active" : ""}`}
              onClick={() => setOpponent(p.id)}
            >
              <span className="opp-btn__name">{p.name}</span>
              <span className="opp-btn__bal">{formatMoney(p.balance)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ===== 方向切换 ===== */}
      <section className="dir-bar">
        <button
          className={`dir-btn dir-btn--win ${direction === "win" ? "dir-btn--active" : ""}`}
          onClick={() => setDirection("win")}
        >
          我赢 {opp?.name}
        </button>
        <button
          className={`dir-btn dir-btn--lose ${direction === "lose" ? "dir-btn--active" : ""}`}
          onClick={() => setDirection("lose")}
        >
          我输 {opp?.name}
        </button>
      </section>

      {/* ===== 金额按钮 ===== */}
      <section className="amount-bar">
        {amounts.map(a => (
          <button
            key={a}
            className={`amt-btn ${direction === "win" ? "amt-btn--win" : "amt-btn--lose"}`}
            onClick={() => commit(a)}
          >
            <span className="amt-btn__sign">{direction === "win" ? "+" : "−"}</span>
            {a}
          </button>
        ))}
      </section>

      {/* ===== 操作栏 ===== */}
      <section className="action-bar">
        <button className="btn-action" onClick={handleUndo} disabled={!hasRecords}>
          撤销
        </button>
        <button className="btn-action btn-action--primary" onClick={handleNext}>
          新一局
        </button>
      </section>

      {/* ===== 历史记录 ===== */}
      <section className="history">
        <div className="history__header">
          <span className="label">最近记录</span>
          <span className="history__count">{state.records.length} 笔</span>
        </div>
        {state.records.length === 0 ? (
          <p className="history__empty">还没有记录，上方选择对手和金额开始记账。</p>
        ) : (
          <div className="history__list">
            {[...state.records].reverse().slice(0, 20).map(r => {
              const name = state.players.find(p => p.id === r.opponentId)?.name ?? "?";
              const time = new Date(r.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={r.id} className={`history-item ${r.direction === "win" ? "history-item--win" : "history-item--lose"}`}>
                  <span className="history-item__desc">
                    我{r.direction === "win" ? "赢了" : "输给"}{name} {r.amount}
                  </span>
                  <span className="history-item__time">{time}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== 底部 ===== */}
      <footer className="footer">
        <p>Mineguai · 数据仅保存在本地浏览器</p>
      </footer>
    </div>
  );
}