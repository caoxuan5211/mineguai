import { useEffect, useState } from "react";
import {
  addRecord,
  undoLast,
  newSession,
  setPlayerNames,
  setStep,
  load,
  save,
  type LedgerState,
} from "../lib/ledger";

export function useLedger() {
  const [state, setState] = useState<LedgerState>(() => load());

  useEffect(() => {
    save(state);
  }, [state]);

  return {
    state,
    record: (opponentId: number, amount: number, direction: "win" | "lose") =>
      setState(s => addRecord(s, opponentId, amount, direction)),
    undo: () => setState(s => undoLast(s)),
    next: () => setState(s => newSession(s)),
    rename: (names: string[]) => setState(s => setPlayerNames(s, names)),
    changeStep: (v: number) => setState(s => setStep(s, v)),
  };
}