/* ===== 核心逻辑：四人麻将记账，最简实现 ===== */

export type Player = {
  id: number;       // 0=我, 1-3=对手
  name: string;
  balance: number;  // 累计输赢
};

export type RecordItem = {
  id: string;
  opponentId: number;
  amount: number;
  direction: "win" | "lose";
  createdAt: number;
};

export type LedgerState = {
  players: Player[];
  records: RecordItem[];
  step: number;      // 步长基数
  session: number;   // 第几局
};

const DEFAULT_NAMES = ["我", "阿泽", "明叔", "小棠"] as const;
const AMOUNT_MULTIPLIERS = [1, 2, 3, 5, 10] as const;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fixed(n: number) {
  return Math.round(n * 100) / 100;
}

function createPlayers(names?: string[]): Player[] {
  return DEFAULT_NAMES.map((d, i) => ({
    id: i,
    name: names?.[i]?.trim() || d,
    balance: 0,
  }));
}

function rebuildBalances(records: RecordItem[], names?: string[]): Player[] {
  const players = createPlayers(names);
  for (const r of records) {
    const d = r.direction === "win" ? r.amount : -r.amount;
    players[0].balance = fixed(players[0].balance + d);
    const opp = players.find(p => p.id === r.opponentId);
    if (opp) opp.balance = fixed(opp.balance - d);
  }
  return players;
}

export function init(): LedgerState {
  return { players: createPlayers(), records: [], step: 1, session: 1 };
}

export function getAmounts(step: number): number[] {
  return AMOUNT_MULTIPLIERS.map(m => fixed(m * step));
}

export function formatMoney(n: number): string {
  const s = fixed(n).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  return n > 0 ? `+${s}` : s;
}

export function addRecord(
  state: LedgerState,
  opponentId: number,
  amount: number,
  direction: "win" | "lose",
): LedgerState {
  if (opponentId === 0 || !Number.isFinite(amount) || amount <= 0) return state;
  const r: RecordItem = {
    id: uid(),
    opponentId,
    amount: fixed(amount),
    direction,
    createdAt: Date.now(),
  };
  const records = [...state.records, r];
  return { ...state, records, players: rebuildBalances(records, state.players.map(p => p.name)) };
}

export function undoLast(state: LedgerState): LedgerState {
  if (state.records.length === 0) return state;
  const records = state.records.slice(0, -1);
  return { ...state, records, players: rebuildBalances(records, state.players.map(p => p.name)) };
}

export function newSession(state: LedgerState): LedgerState {
  return { players: createPlayers(state.players.map(p => p.name)), records: [], step: state.step, session: state.session + 1 };
}

export function setPlayerNames(state: LedgerState, names: string[]): LedgerState {
  const players = state.players.map((p, i) => ({
    ...p,
    name: names[i]?.trim() || DEFAULT_NAMES[i],
  }));
  return { ...state, players };
}

export function setStep(state: LedgerState, step: number): LedgerState {
  return { ...state, step: Math.max(0.5, fixed(step)) };
}

/* ===== 本地存储 ===== */
const KEY = "mj-ledger-v5";

export function load(): LedgerState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return init();
    const data = JSON.parse(raw);
    if (!data.players || !Array.isArray(data.records)) return init();
    return { ...init(), ...data, players: rebuildBalances(data.records, data.players?.map((p: Player) => p.name)) };
  } catch {
    return init();
  }
}

export function save(state: LedgerState): void {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* noop */ }
}