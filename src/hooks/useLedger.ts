import { useEffect, useState } from "react";
import {
  applyRecord,
  createInitialState,
  endCurrentSession,
  getCurrentLeader,
  getLargestSpread,
  getNetResultByPlayer,
  setPlayerNames,
  setStepValue,
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
    netResults: getNetResultByPlayer(state),
    applyRecord: (opponentId: number, amount: number, direction: "win" | "lose", mode: "rapid" | "precision") =>
      setState((current) => applyRecord(current, opponentId, amount, direction, mode)),
    undoLast: () => setState((current) => undoLastRecord(current)),
    undoRecord: (recordId: string) => setState((current) => undoRecordById(current, recordId)),
    endSession: () => setState((current) => endCurrentSession(current)),
    nextSession: () => setState((current) => startNextSession(current)),
    setPlayerNames: (names: string[]) => setState((current) => setPlayerNames(current, names)),
    setStepValue: (value: number) => setState((current) => setStepValue(current, value)),
  };
}
