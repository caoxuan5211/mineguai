import { useEffect, useMemo, useState } from "react";
import {
  buildChanges,
  createId,
  getBalances,
  initialState,
  normalizeStep,
  normalizeState,
  roundAmount,
  STORAGE_KEY,
  type LedgerState,
  type Direction,
} from "../lib/tableLedger";

export function useTableLedger() {
  const [state, setState] = useState<LedgerState>(() => {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
    } catch {
      return structuredClone(initialState);
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const balances = useMemo(() => getBalances(state), [state]);

  function renamePlayer(id: string, name: string) {
    setState((current) => ({
      ...current,
      players: current.players.map((player) => player.id === id ? { ...player, name } : player),
    }));
  }

  function setStep(step: number) {
    setState((current) => ({ ...current, step: normalizeStep(step) }));
  }

  function addRecord(opponentId: string, direction: Direction, amount: number, note: string) {
    setState((current) => ({
      ...current,
      records: [
        ...current.records,
        {
          id: createId(),
          opponentId,
          direction,
          amount: roundAmount(amount),
          note: note.trim(),
          createdAt: Date.now(),
          changes: buildChanges(current, opponentId, direction, roundAmount(amount)),
        },
      ],
    }));
  }

  function removeRecord(id: string) {
    setState((current) => ({ ...current, records: current.records.filter((record) => record.id !== id) }));
  }

  function undoLast() {
    setState((current) => ({ ...current, records: current.records.slice(0, -1) }));
  }

  function reset() {
    setState(structuredClone(initialState));
  }

  function importState(nextState: unknown) {
    setState(normalizeState(nextState));
  }

  return { state, balances, renamePlayer, setStep, addRecord, removeRecord, undoLast, reset, importState };
}
