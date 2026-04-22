export type ThemeId = "jade" | "ink" | "brass";
export type StageId = "east" | "south";
export type ModeId = "rapid" | "precision";
export type DirectionId = "win" | "lose";

export type Player = {
  id: number;
  name: string;
  balance: number;
  isDealer: boolean;
  accentToken: "jade" | "gold" | "mist" | "ember";
};

export type RecordItem = {
  id: string;
  opponentId: number;
  amount: number;
  direction: DirectionId;
  mode: ModeId;
  createdAt: number;
  reverted: boolean;
};

export type SessionSnapshot = {
  id: string;
  roundIndex: number;
  stage: StageId;
  endedAt: number;
  leaderName: string;
  spread: number;
  theme: ThemeId;
  balances: number[];
  records: RecordItem[];
};

export type SessionState = {
  sessionId: string;
  roundIndex: number;
  stage: StageId;
  stepValue: number;
  theme: ThemeId;
  createdAt: number;
};

export type LedgerState = {
  players: Player[];
  session: SessionState;
  records: RecordItem[];
  archivedSessions: SessionSnapshot[];
};

export type NetResult = {
  player: Player;
  total: number;
};

const DEFAULT_NAMES = ["我", "阿泽", "明叔", "小棠"] as const;
const DEFAULT_STEP = 1;
const STEP_INCREMENT = 0.5;
const MULTIPLIERS = [1, 2, 3, 5, 10] as const;

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeStep(value: number) {
  const snapped = Math.round(value / STEP_INCREMENT) * STEP_INCREMENT;
  return Math.max(STEP_INCREMENT, normalizeMoney(snapped));
}

export function formatMoney(value: number) {
  const rounded = normalizeMoney(value);
  const text = rounded.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  return rounded > 0 ? `+${text}` : text;
}

export function formatAmount(value: number) {
  return formatMoney(value).replace(/^\+/, "");
}

export function formatClock(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export function getStepAmounts(stepValue: number) {
  return MULTIPLIERS.map((multiplier) => normalizeMoney(multiplier * stepValue));
}

function createPlayers(names = DEFAULT_NAMES) {
  return names.map((name, index) => ({
    id: index,
    name,
    balance: 0,
    isDealer: index === 0,
    accentToken: (["jade", "gold", "mist", "ember"] as const)[index],
  }));
}

function clonePlayers(players: Player[]) {
  return players.map((player) => ({ ...player }));
}

function resetPlayers(players: Player[]) {
  return players.map((player) => ({ ...player, balance: 0 }));
}

function findPlayerName(players: Player[], playerId: number) {
  return players.find((player) => player.id === playerId)?.name ?? "玩家";
}

function applyBalanceChange(
  players: Player[],
  opponentId: number,
  amount: number,
  direction: DirectionId,
) {
  const me = players[0];
  const opponent = players.find((player) => player.id === opponentId);
  if (!me || !opponent) {
    return;
  }

  if (direction === "win") {
    me.balance = normalizeMoney(me.balance + amount);
    opponent.balance = normalizeMoney(opponent.balance - amount);
    return;
  }

  me.balance = normalizeMoney(me.balance - amount);
  opponent.balance = normalizeMoney(opponent.balance + amount);
}

function reverseBalanceChange(
  players: Player[],
  opponentId: number,
  amount: number,
  direction: DirectionId,
) {
  applyBalanceChange(players, opponentId, amount, direction === "win" ? "lose" : "win");
}

function activeRecords(records: RecordItem[]) {
  return records.filter((record) => !record.reverted);
}

function createSnapshot(state: LedgerState): SessionSnapshot | null {
  const currentRecords = activeRecords(state.records);
  if (currentRecords.length === 0) {
    return null;
  }

  return {
    id: state.session.sessionId,
    roundIndex: state.session.roundIndex,
    stage: state.session.stage,
    endedAt: Date.now(),
    leaderName: getCurrentLeader(state).name,
    spread: getLargestSpread(state),
    theme: state.session.theme,
    balances: state.players.map((player) => player.balance),
    records: state.records.map((record) => ({ ...record })),
  };
}

function resetSession(state: LedgerState, incrementRound: boolean) {
  const snapshot = createSnapshot(state);
  const archivedSessions = snapshot
    ? [snapshot, ...state.archivedSessions].slice(0, 8)
    : state.archivedSessions;

  return {
    players: resetPlayers(state.players),
    session: {
      ...state.session,
      sessionId: createId("session"),
      roundIndex: incrementRound ? state.session.roundIndex + 1 : state.session.roundIndex,
      createdAt: Date.now(),
    },
    records: [],
    archivedSessions,
  };
}

export function createInitialState(): LedgerState {
  return {
    players: createPlayers(),
    session: {
      sessionId: createId("session"),
      roundIndex: 1,
      stage: "east",
      stepValue: DEFAULT_STEP,
      theme: "jade",
      createdAt: Date.now(),
    },
    records: [],
    archivedSessions: [],
  };
}

export function applyRecord(
  state: LedgerState,
  opponentId: number,
  amount: number,
  direction: DirectionId,
  mode: ModeId,
) {
  if (!Number.isFinite(amount) || amount <= 0 || opponentId === 0) {
    return state;
  }

  const nextPlayers = clonePlayers(state.players);
  const nextAmount = normalizeMoney(amount);
  applyBalanceChange(nextPlayers, opponentId, nextAmount, direction);

  return {
    ...state,
    players: nextPlayers,
    records: [
      ...state.records,
      {
        id: createId("record"),
        opponentId,
        amount: nextAmount,
        direction,
        mode,
        createdAt: Date.now(),
        reverted: false,
      },
    ],
  };
}

export function undoRecordById(state: LedgerState, recordId: string) {
  const target = state.records.find((record) => record.id === recordId && !record.reverted);
  if (!target) {
    return state;
  }

  const nextPlayers = clonePlayers(state.players);
  reverseBalanceChange(nextPlayers, target.opponentId, target.amount, target.direction);

  return {
    ...state,
    players: nextPlayers,
    records: state.records.map((record) =>
      record.id === recordId ? { ...record, reverted: true } : record,
    ),
  };
}

export function undoLastRecord(state: LedgerState) {
  const target = [...state.records].reverse().find((record) => !record.reverted);
  return target ? undoRecordById(state, target.id) : state;
}

export function endCurrentSession(state: LedgerState) {
  return resetSession(state, false);
}

export function startNextSession(state: LedgerState) {
  return resetSession(state, true);
}

export function setPlayerNames(state: LedgerState, names: string[]) {
  return {
    ...state,
    players: state.players.map((player, index) => ({
      ...player,
      name: names[index]?.trim() || DEFAULT_NAMES[index],
    })),
  };
}

export function setDealer(state: LedgerState, playerId: number) {
  return {
    ...state,
    players: state.players.map((player) => ({
      ...player,
      isDealer: player.id === playerId,
    })),
  };
}

export function setStepValue(state: LedgerState, value: number) {
  return {
    ...state,
    session: {
      ...state.session,
      stepValue: normalizeStep(value),
    },
  };
}

export function setTheme(state: LedgerState, theme: ThemeId) {
  return {
    ...state,
    session: {
      ...state.session,
      theme,
    },
  };
}

export function setStage(state: LedgerState, stage: StageId) {
  return {
    ...state,
    session: {
      ...state.session,
      stage,
    },
  };
}

export function getCurrentLeader(state: LedgerState) {
  return [...state.players].sort((left, right) => right.balance - left.balance)[0];
}

export function getLargestSpread(state: LedgerState) {
  const balances = state.players.map((player) => player.balance);
  return normalizeMoney(Math.max(...balances) - Math.min(...balances));
}

export function getRecentActions(state: LedgerState, limit: number) {
  return activeRecords(state.records).slice(-limit).reverse();
}

export function getNetResultByPlayer(state: LedgerState): NetResult[] {
  const totals = new Map<number, number>();
  for (const record of activeRecords(state.records)) {
    const existing = totals.get(record.opponentId) ?? 0;
    const delta = record.direction === "win" ? record.amount : -record.amount;
    totals.set(record.opponentId, normalizeMoney(existing + delta));
  }

  return state.players
    .filter((player) => player.id !== 0)
    .map((player) => ({
      player,
      total: totals.get(player.id) ?? 0,
    }));
}

export function getMomentumSummary(state: LedgerState) {
  const recent = activeRecords(state.records).slice(-5);
  if (recent.length === 0) {
    return "这一局还没落子，适合直接开一波漂亮的节奏。";
  }

  const wins = recent.filter((record) => record.direction === "win").length;
  const losses = recent.length - wins;
  if (wins === losses) {
    return "最近手感均衡，局势还在拉扯。";
  }

  return wins > losses
    ? `最近 ${recent.length} 笔里你赢了 ${wins} 次，节奏正在抬头。`
    : `最近 ${recent.length} 笔里你输了 ${losses} 次，需要一手扳回。`;
}

export function describeRecord(state: LedgerState, record: RecordItem) {
  const targetName = findPlayerName(state.players, record.opponentId);
  const verb = record.direction === "win" ? "赢了" : "给了";
  return `我${verb}${targetName} ${formatAmount(record.amount)}`;
}
