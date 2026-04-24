import { HistorySheet } from "./components/HistorySheet";
import { RoundTableLedger } from "./components/RoundTableLedger";
import { useLedger } from "./hooks/useLedger";

export default function App() {
  const ledger = useLedger();

  return (
    <main className="site-shell overflow-x-hidden w-full max-w-full">
      <a href="#main-content" className="skip-link">
        跳到内容
      </a>
      <div className="page-noise" aria-hidden="true" />

      <div className="site-frame" id="main-content">
        <header className="top-nav">
          <span className="top-nav__brand">Mahjong Ledger</span>
          <span className="top-nav__status">mobile-first scoring table</span>
        </header>

        <section className="hero-shell">
          <p className="hero-shell__eyebrow">桌边快记，不再像旧式工具页</p>
          <h1 className="hero-shell__title">
            把一桌输赢
            <span className="hero-inline-pill" aria-hidden="true" />
            收进一张更顺手的掌上圆桌。
          </h1>
          <p className="hero-shell__copy">
            这一版只留下核心动作：改名、步长、记分、撤销、开新局、历史记录。其它低价值逻辑全部退出主舞台。
          </p>
        </section>

        <RoundTableLedger
          state={ledger.state}
          currentLeader={ledger.currentLeader}
          largestSpread={ledger.largestSpread}
          netResults={ledger.netResults}
          onApplyRecord={ledger.applyRecord}
          onUndoLast={ledger.undoLast}
          onNextSession={ledger.nextSession}
          onSetPlayerNames={ledger.setPlayerNames}
          onSetStepValue={ledger.setStepValue}
        />

        <HistorySheet
          state={ledger.state}
          currentLeader={ledger.currentLeader}
          onEndSession={ledger.endSession}
          onUndoRecord={ledger.undoRecord}
        />
      </div>
    </main>
  );
}
