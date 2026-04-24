export type ModeId = "rapid" | "precision";
export type DirectionId = "win" | "lose";
export type ThemeId = "jade" | "ink" | "brass";
export type StageId = "east" | "south";

export type Player = {
  id: number;
  name: string;
  balance: number;
  accentToken: "jade" | "gold" | "mist" | "ember";
  isDealer?: boolean;
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
  endedAt: number;
  leaderName: string;
  spread: number;
  balances: number[];
  records: RecordItem[];
  stage: StageId;
  theme: ThemeId;
};

export type SessionState = {
  sessionId: string;
  roundIndex: number;
  stepValue: number;
  createdAt: number;
  stage: StageId;
  theme: ThemeId;
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
const ACCENT_TOKENS = ["jade", "gold", "mist", "ember"] as const;

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function clonePlayers(players: Player[]) {
  return players.map((player) => ({ ...player }));
}

function getActiveRecords(records: RecordItem[]) {
  return records.filter((record) => !record.reverted);
}

function buildPlayers() {
  return DEFAULT_NAMES.map((name, index) => ({
    id: index,
    name,
    balance: 0,
    accentToken: ACCENT_TOKENS[index],
  }));
}

function applyBalanceDelta(
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

  const delta = direction === "win" ? amount : -amount;
  me.balance = roundAmount(me.balance + delta);
  opponent.balance = roundAmount(opponent.balance - delta);
}

function reverseBalanceDelta(
  players: Player[],
  opponentId: number,
  amount: number,
  direction: DirectionId,
) {
  applyBalanceDelta(players, opponentId, amount, direction === "win" ? "lose" : "win");
}

function createSnapshot(state: LedgerState): SessionSnapshot | null {
  const liveRecords = getActiveRecords(state.records);
  if (liveRecords.length === 0) {
    return null;
  }

  return {
    id: state.session.sessionId,
    roundIndex: state.session.roundIndex,
    endedAt: Date.now(),
    leaderName: getCurrentLeader(state).name,
    spread: getLargestSpread(state),
    balances: state.players.map((player) => player.balance),
    records: state.records.map((record) => ({ ...record })),
    stage: state.session.stage,
    theme: state.session.theme,
  };
}

function resetPlayers(players: Player[]) {
  return players.map((player) => ({ ...player, balance: 0 }));
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

export function normalizeStep(value: number) {
  const snapped = Math.round(value / STEP_INCREMENT) * STEP_INCREMENT;
  return Math.max(STEP_INCREMENT, roundAmount(snapped));
}

export function formatMoney(value: number) {
  const rounded = roundAmount(value);
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
  return MULTIPLIERS.map((multiplier) => roundAmount(multiplier * stepValue));
}

export function createInitialState(): LedgerState {
  return {
    players: buildPlayers(),
    session: {
      sessionId: createId("session"),
      roundIndex: 1,
      stepValue: DEFAULT_STEP,
      createdAt: Date.now(),
      stage: "east",
      theme: "ink",
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
  const nextAmount = roundAmount(amount);
  applyBalanceDelta(nextPlayers, opponentId, nextAmount, direction);

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
  reverseBalanceDelta(nextPlayers, target.opponentId, target.amount, target.direction);

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

export function setStepValue(state: LedgerState, value: number) {
  return {
    ...state,
    session: {
      ...state.session,
      stepValue: normalizeStep(value),
    },
  };
}

export function setDealer(state: LedgerState, _playerId: number) {
  return state;
}

export function setTheme(state: LedgerState, _theme: ThemeId) {
  return {
    ...state,
    session: {
      ...state.session,
      theme: _theme,
    },
  };
}

export function setStage(state: LedgerState, _stage: StageId) {
  return {
    ...state,
    session: {
      ...state.session,
      stage: _stage,
    },
  };
}

export function getCurrentLeader(state: LedgerState) {
  return [...state.players].sort((left, right) => right.balance - left.balance)[0];
}

export function getLargestSpread(state: LedgerState) {
  const balances = state.players.map((player) => player.balance);
  return roundAmount(Math.max(...balances) - Math.min(...balances));
}

export function getNetResultByPlayer(state: LedgerState): NetResult[] {
  const totals = new Map<number, number>();

  for (const record of getActiveRecords(state.records)) {
    const current = totals.get(record.opponentId) ?? 0;
    const delta = record.direction === "win" ? record.amount : -record.amount;
    totals.set(record.opponentId, roundAmount(current + delta));
  }

  return state.players
    .filter((player) => player.id !== 0)
    .map((player) => ({ player, total: totals.get(player.id) ?? 0 }));
}

export function getRecentActions(state: LedgerState, limit: number) {
  return getActiveRecords(state.records).slice(-limit).reverse();
}

export function getMomentumSummary(state: LedgerState) {
  const recent = getActiveRecords(state.records).slice(-5);
  if (recent.length === 0) {
    return "还没有动作，先点桌上的人再记一笔。";
  }

  const wins = recent.filter((record) => record.direction === "win").length;
  const losses = recent.length - wins;
  if (wins === losses) {
    return "最近几笔还在拉扯，局面没有完全倾斜。";
  }

  return wins > losses
    ? `最近 ${recent.length} 笔里你赢了 ${wins} 次。`
    : `最近 ${recent.length} 笔里你输了 ${losses} 次。`;
}

export function describeRecord(state: LedgerState, record: RecordItem) {
  const name =
    state.players.find((player) => player.id === record.opponentId)?.name ?? "玩家";
  return `我${record.direction === "win" ? "赢了" : "输给"}${name} ${formatAmount(record.amount)}`;
}
