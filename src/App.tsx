import { FloatingNav } from "./components/FloatingNav";
import { FeatureGrid } from "./components/FeatureGrid";
import { FinalCta } from "./components/FinalCta";
import { HeroSection } from "./components/HeroSection";
import { PinnedStory } from "./components/PinnedStory";
import { ScoreArena } from "./components/ScoreArena";
import { SessionReplay } from "./components/SessionReplay";
import { useLedger } from "./hooks/useLedger";

export default function App() {
  const ledger = useLedger();

  return (
    <main className="site-shell overflow-x-hidden" data-theme={ledger.state.session.theme}>
      <a href="#main-content" className="skip-link">
        跳到内容
      </a>
      <div className="page-noise" aria-hidden="true" />
      <FloatingNav />
      <div id="main-content">
        <HeroSection />
        <FeatureGrid />
        <PinnedStory />
        <ScoreArena
          state={ledger.state}
          currentLeader={ledger.currentLeader}
          largestSpread={ledger.largestSpread}
          momentumSummary={ledger.momentumSummary}
          netResults={ledger.netResults}
          onApplyRecord={ledger.applyRecord}
          onEndSession={ledger.endSession}
          onNextSession={ledger.nextSession}
          onSetDealer={ledger.setDealer}
          onSetPlayerNames={ledger.setPlayerNames}
          onSetStage={ledger.setStage}
          onSetStepValue={ledger.setStepValue}
          onSetTheme={ledger.setTheme}
        />
        <SessionReplay
          state={ledger.state}
          currentLeader={ledger.currentLeader}
          onUndoLast={ledger.undoLast}
          onUndoRecord={ledger.undoRecord}
        />
        <FinalCta />
      </div>
    </main>
  );
}
