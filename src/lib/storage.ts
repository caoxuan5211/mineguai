import { createInitialState, normalizeStep, type LedgerState } from "./ledger";

const STORAGE_KEY = "mahjong-ledger-state-v2";

function isLedgerState(value: unknown): value is LedgerState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as LedgerState;
  return Array.isArray(candidate.players) && Array.isArray(candidate.records) && !!candidate.session;
}

function loadLegacyState(baseState: LedgerState) {
  try {
    const savedNames = JSON.parse(localStorage.getItem("mahjong-player-names") || "null");
    const savedStep = Number(localStorage.getItem("mahjong-step-value"));

    const players = Array.isArray(savedNames)
      ? baseState.players.map((player, index) => ({
          ...player,
          name: index === 0 ? player.name : savedNames[index - 1] || player.name,
        }))
      : baseState.players;

    return {
      ...baseState,
      players,
      session: {
        ...baseState.session,
        stepValue:
          Number.isFinite(savedStep) && savedStep > 0
            ? normalizeStep(savedStep)
            : baseState.session.stepValue,
      },
    };
  } catch {
    return baseState;
  }
}

export function loadState() {
  const baseState = createInitialState();

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return isLedgerState(saved) ? saved : loadLegacyState(baseState);
  } catch {
    return loadLegacyState(baseState);
  }
}

export function saveState(state: LedgerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 本地持久化失败时保持界面可用，不阻断交互。
  }
}
