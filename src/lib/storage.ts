import {
  createInitialState,
  normalizeStep,
  type LedgerState,
  type Player,
  type RecordItem,
  type SessionSnapshot,
  type StageId,
  type ThemeId,
} from "./ledger";

const STORAGE_KEY = "mahjong-ledger-state-v3";

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function normalizePlayers(value: unknown, basePlayers: Player[]) {
  if (!Array.isArray(value)) {
    return basePlayers;
  }

  return basePlayers.map((player, index) => {
    const incoming = value[index];
    if (!isObject(incoming)) {
      return player;
    }

    return {
      ...player,
      name: typeof incoming.name === "string" && incoming.name.trim() ? incoming.name : player.name,
      balance: typeof incoming.balance === "number" ? incoming.balance : 0,
    };
  });
}

function normalizeRecords(value: unknown): RecordItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isObject)
    .map((record, index) => ({
      id: typeof record.id === "string" ? record.id : `record-${index}`,
      opponentId: typeof record.opponentId === "number" ? record.opponentId : 1,
      amount: typeof record.amount === "number" ? record.amount : 0,
      direction: (record.direction === "lose" ? "lose" : "win") as RecordItem["direction"],
      mode: (record.mode === "precision" ? "precision" : "rapid") as RecordItem["mode"],
      createdAt: typeof record.createdAt === "number" ? record.createdAt : Date.now(),
      reverted: Boolean(record.reverted),
    }))
    .filter((record) => record.amount > 0 && record.opponentId > 0);
}

function normalizeSnapshots(value: unknown): SessionSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isObject)
    .map((snapshot, index) => ({
      id: typeof snapshot.id === "string" ? snapshot.id : `snapshot-${index}`,
      roundIndex: typeof snapshot.roundIndex === "number" ? snapshot.roundIndex : index + 1,
      endedAt: typeof snapshot.endedAt === "number" ? snapshot.endedAt : Date.now(),
      leaderName:
        typeof snapshot.leaderName === "string" && snapshot.leaderName.trim()
          ? snapshot.leaderName
          : "玩家",
      spread: typeof snapshot.spread === "number" ? snapshot.spread : 0,
      balances: Array.isArray(snapshot.balances)
        ? snapshot.balances.filter((balance): balance is number => typeof balance === "number")
        : [],
      records: normalizeRecords(snapshot.records),
      stage: (snapshot.stage === "south" ? "south" : "east") as StageId,
      theme:
        snapshot.theme === "jade" || snapshot.theme === "brass" || snapshot.theme === "ink"
          ? (snapshot.theme as ThemeId)
          : "ink",
    }));
}

function normalizeState(value: unknown) {
  const baseState = createInitialState();
  if (!isObject(value)) {
    return baseState;
  }

  const session = isObject(value.session) ? value.session : {};

  return {
    players: normalizePlayers(value.players, baseState.players),
    session: {
      sessionId:
        typeof session.sessionId === "string" && session.sessionId.trim()
          ? session.sessionId
          : baseState.session.sessionId,
      roundIndex:
        typeof session.roundIndex === "number" && session.roundIndex > 0
          ? session.roundIndex
          : baseState.session.roundIndex,
      stepValue:
        typeof session.stepValue === "number" && session.stepValue > 0
          ? normalizeStep(session.stepValue)
          : baseState.session.stepValue,
      createdAt:
        typeof session.createdAt === "number" ? session.createdAt : baseState.session.createdAt,
      stage: session.stage === "south" ? "south" : baseState.session.stage,
      theme:
        session.theme === "jade" || session.theme === "brass" || session.theme === "ink"
          ? session.theme
          : baseState.session.theme,
    },
    records: normalizeRecords(value.records),
    archivedSessions: normalizeSnapshots(value.archivedSessions),
  };
}

function loadLegacyState(baseState: LedgerState) {
  try {
    const savedNames = JSON.parse(localStorage.getItem("mahjong-player-names") || "null");
    const savedStep = Number(localStorage.getItem("mahjong-step-value"));

    return {
      ...baseState,
      players: Array.isArray(savedNames)
        ? baseState.players.map((player, index) => ({
            ...player,
            name: typeof savedNames[index] === "string" && savedNames[index].trim()
              ? savedNames[index]
              : player.name,
          }))
        : baseState.players,
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
    return saved ? normalizeState(saved) : loadLegacyState(baseState);
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
