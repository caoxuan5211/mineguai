export type Direction = "win" | "lose";

export type Player = {
  id: string;
  name: string;
};

export type RecordItem = {
  id: string;
  opponentId: string;
  direction: Direction;
  amount: number;
  note: string;
  createdAt: number;
  changes: Record<string, number>;
};

export type LedgerState = {
  step: number;
  players: Player[];
  records: RecordItem[];
};

export const STORAGE_KEY = "mineguai-table-ledger-v1";

export const initialState: LedgerState = {
  step: 1,
  players: [
    { id: "p0", name: "我" },
    { id: "p1", name: "东风" },
    { id: "p2", name: "南山" },
    { id: "p3", name: "北海" },
  ],
  records: [],
};

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

export function getBalances(state: LedgerState) {
  const balances = Object.fromEntries(state.players.map((player) => [player.id, 0]));
  state.records.forEach((record) => {
    Object.entries(record.changes).forEach(([playerId, value]) => {
      balances[playerId] = roundAmount((balances[playerId] ?? 0) + value);
    });
  });
  return balances;
}

export function buildChanges(state: LedgerState, opponentId: string, direction: Direction, amount: number) {
  const changes = Object.fromEntries(state.players.map((player) => [player.id, 0]));
  const delta = direction === "win" ? amount : -amount;
  changes.p0 += delta;
  changes[opponentId] -= delta;
  return changes;
}

export function normalizeState(value: unknown): LedgerState {
  if (!value || typeof value !== "object") return structuredClone(initialState);
  const source = value as Partial<LedgerState>;
  const players = Array.isArray(source.players) && source.players.length === 4
    ? source.players.map((player, index) => ({
        id: typeof player.id === "string" ? player.id : `p${index}`,
        name: typeof player.name === "string" && player.name.trim()
          ? player.name.trim()
          : initialState.players[index].name,
      }))
    : structuredClone(initialState.players);
  const ids = new Set(players.map((player) => player.id));
  const records = Array.isArray(source.records) ? source.records
    .filter((record) => record && Number(record.amount) > 0)
    .map((record) => normalizeRecord(record, ids, players))
    .filter((record): record is RecordItem => Boolean(record)) : [];
  return {
    step: normalizeStep(Number(source.step) || initialState.step),
    players,
    records,
  };
}

export function formatAmount(value: number) {
  const rounded = roundAmount(value);
  const text = rounded.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  return rounded > 0 ? `+${text}` : text;
}

export function normalizeStep(value: number) {
  if (!Number.isFinite(value)) return initialState.step;
  return Math.max(0.1, roundAmount(value));
}

function normalizeRecord(record: RecordItem, ids: Set<string>, players: Player[]) {
  const legacyWinner = "winnerId" in record ? (record as RecordItem & { winnerId?: string }).winnerId : "";
  const legacyLoser = "loserId" in record ? (record as RecordItem & { loserId?: string }).loserId : "";
  const fallbackOpponent = players[1]?.id ?? "p1";
  const opponentId: string = ids.has(record.opponentId) && record.opponentId !== "p0"
    ? record.opponentId
    : legacyWinner === "p0" && ids.has(legacyLoser || "") ? legacyLoser || fallbackOpponent
      : legacyLoser === "p0" && ids.has(legacyWinner || "") ? legacyWinner || fallbackOpponent
        : fallbackOpponent;
  const direction = record.direction === "lose" || legacyLoser === "p0" ? "lose" : "win";
  const amount = roundAmount(Number(record.amount));
  return {
    id: typeof record.id === "string" ? record.id : createId(),
    opponentId,
    direction,
    amount,
    note: typeof record.note === "string" ? record.note : "",
    createdAt: typeof record.createdAt === "number" ? record.createdAt : Date.now(),
    changes: buildChanges({ step: 1, players, records: [] }, opponentId, direction, amount),
  };
}
