import { useCallback, useEffect, useRef } from "react";
import { FloatingNav } from "./components/FloatingNav";
import { HeroSection } from "./components/HeroSection";
import { FeatureGrid } from "./components/FeatureGrid";
import { PinnedStory } from "./components/PinnedStory";
import { RoundTableLedger } from "./components/RoundTableLedger";
import { HistorySheet } from "./components/HistorySheet";
import { FinalCta } from "./components/FinalCta";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { useLedger } from "./hooks/useLedger";

function useTapSound() {
  const audioRef = useRef<AudioContext | null>(null);

  return useCallback((variant: "soft" | "win" | "lose" | "reset" = "soft") => {
    if (typeof window === "undefined") return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioRef.current ?? new AudioContextClass();
    audioRef.current = context;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const frequency = {
      soft: 520,
      win: 690,
      lose: 260,
      reset: 180,
    }[variant];

    oscillator.type = variant === "reset" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.78, now + 0.08);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.12);
  }, []);
}

export default function App() {
  const ledger = useLedger();
  const playTap = useTapSound();

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", ledger.state.session.theme);
  }, [ledger.state.session.theme]);

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    const interactive = target.closest("button, a");
    if (!interactive) return;

    const className = interactive.getAttribute("class") ?? "";
    if (className.includes("lose") || interactive.textContent?.includes("我输")) {
      playTap("lose");
      return;
    }
    if (className.includes("win") || interactive.textContent?.includes("我赢")) {
      playTap("win");
      return;
    }
    if (interactive.textContent?.includes("结束") || interactive.textContent?.includes("新一局")) {
      playTap("reset");
      return;
    }
    playTap("soft");
  }

  function handleResetAll() {
    if (window.confirm("确定清空所有数据？包括玩家称呼、余额和历史记录，操作不可恢复。")) {
      ledger.resetAllData();
      playTap("reset");
    }
  }

  return (
    <main className="site-shell" onPointerDown={handlePointerDown}>
      <a href="#score-arena" className="skip-link">
        跳到记账区
      </a>
      <FloatingNav />
      <HeroSection />
      <FeatureGrid />
      <PinnedStory />
      <section id="score-arena" className="section-block section-block--tool" aria-label="麻将记账区">
        <div className="section-heading">
          <p className="section-kicker">现在上桌</p>
          <h2>点人，定输赢，马上落账。</h2>
          <p>
            手机端优先的圆桌记分台。当前目标、金额、撤销和开新局都固定在同一条操作路径里。
          </p>
        </div>
        <div className="tool-toolbar">
          <ThemeSwitcher currentTheme={ledger.state.session.theme} onChange={ledger.setTheme} />
          <button type="button" className="reset-all-button" onClick={handleResetAll}>
            清空数据
          </button>
        </div>
        <RoundTableLedger
          state={ledger.state}
          currentLeader={ledger.currentLeader}
          largestSpread={ledger.largestSpread}
          onApplyRecord={ledger.applyRecord}
          onUndoLast={ledger.undoLast}
          onNextSession={ledger.nextSession}
          onSetPlayerNames={ledger.setPlayerNames}
          onSetStepValue={ledger.setStepValue}
        />
      </section>
      <section id="session-replay" className="section-block" aria-label="对局回放">
        <HistorySheet
          state={ledger.state}
          currentLeader={ledger.currentLeader}
          onEndSession={ledger.endSession}
          onUndoRecord={ledger.undoRecord}
        />
      </section>
      <FinalCta />
    </main>
  );
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}