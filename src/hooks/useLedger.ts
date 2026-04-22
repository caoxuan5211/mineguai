import { useEffect, useState } from "react";
import {
  applyRecord,
  createInitialState,
  endCurrentSession,
  getCurrentLeader,
  getLargestSpread,
  getMomentumSummary,
  getNetResultByPlayer,
  getRecentActions,
  setDealer,
  setPlayerNames,
  setStage,
  setStepValue,
  setTheme,
  startNextSession,
  undoLastRecord,
  undoRecordById,
} from "../lib/ledger";
import { loadState, saveState } from "../lib/storage";

export function useLedger() {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") {
      return createInitialState();
    }

    return loadState();
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  return {
    state,
    currentLeader: getCurrentLeader(state),
    largestSpread: getLargestSpread(state),
    recentActions: getRecentActions(state, 5),
    netResults: getNetResultByPlayer(state),
    momentumSummary: getMomentumSummary(state),
    applyRecord: (opponentId: number, amount: number, direction: "win" | "lose", mode: "rapid" | "precision") =>
      setState((current) => applyRecord(current, opponentId, amount, direction, mode)),
    undoLast: () => setState((current) => undoLastRecord(current)),
    undoRecord: (recordId: string) => setState((current) => undoRecordById(current, recordId)),
    endSession: () => setState((current) => endCurrentSession(current)),
    nextSession: () => setState((current) => startNextSession(current)),
    setDealer: (playerId: number) => setState((current) => setDealer(current, playerId)),
    setPlayerNames: (names: string[]) => setState((current) => setPlayerNames(current, names)),
    setStage: (stage: "east" | "south") => setState((current) => setStage(current, stage)),
    setStepValue: (value: number) => setState((current) => setStepValue(current, value)),
    setTheme: (theme: "jade" | "ink" | "brass") => setState((current) => setTheme(current, theme)),
  };
}
