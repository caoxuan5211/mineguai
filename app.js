const STORAGE_KEY = "mineguai-mahjong-ledger-v1";

const defaultState = {
  step: 10,
  mode: "selfDraw",
  players: [
    { id: "p1", name: "我" },
    { id: "p2", name: "上家" },
    { id: "p3", name: "对家" },
    { id: "p4", name: "下家" },
  ],
  records: [],
};

let state = loadState();
const $ = (selector) => document.querySelector(selector);
const nodes = {
  playersGrid: $("#playersGrid"),
  winnerSelect: $("#winnerSelect"),
  loserSelect: $("#loserSelect"),
  loserField: $("#loserField"),
  amountInput: $("#amountInput"),
  stepInput: $("#stepInput"),
  noteInput: $("#noteInput"),
  recordForm: $("#recordForm"),
  historyList: $("#historyList"),
  roundCount: $("#roundCount"),
  biggestRound: $("#biggestRound"),
  selfName: $("#selfName"),
  netBalance: $("#netBalance"),
  miniBars: $("#miniBars"),
  undoButton: $("#undoButton"),
  resetButton: $("#resetButton"),
  exportButton: $("#exportButton"),
  importInput: $("#importInput"),
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const saved = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...saved };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function getBalances() {
  const balances = Object.fromEntries(state.players.map((player) => [player.id, 0]));
  state.records.forEach((record) => {
    Object.entries(record.changes).forEach(([playerId, value]) => {
      balances[playerId] += value;
    });
  });
  return balances;
}

function formatScore(value) { return value > 0 ? `+${value}` : String(value); }
function playerName(playerId) { return state.players.find((player) => player.id === playerId)?.name || "未知玩家"; }
function recordTitle(record) {
  const winner = playerName(record.winnerId);
  const loser = record.loserId ? playerName(record.loserId) : "三家";
  const typeMap = { selfDraw: "自摸", discard: "点炮", transfer: "转账" };
  if (record.type === "selfDraw") return `${winner} 自摸，每家 ${record.amount}`;
  return `${winner} 收 ${loser} ${record.amount}，${typeMap[record.type]}`;
}

function buildChanges(type, winnerId, loserId, amount) {
  const changes = Object.fromEntries(state.players.map((player) => [player.id, 0]));
  if (type === "selfDraw") {
    state.players.forEach((player) => {
      if (player.id === winnerId) changes[player.id] += amount * 3;
      if (player.id !== winnerId) changes[player.id] -= amount;
    });
    return changes;
  }
  changes[winnerId] += amount;
  changes[loserId] -= amount;
  return changes;
}

function renderPlayers() {
  const balances = getBalances();
  nodes.playersGrid.innerHTML = state.players
    .map((player, index) => {
      const score = balances[player.id];
      const tone = score > 0 ? "is-positive" : score < 0 ? "is-negative" : "";
      const badge = index === 0 ? '<span class="self-badge">我</span>' : "";
      return `
        <article class="player-card ${tone}">
          <div class="name-row">
            <input value="${escapeHtml(player.name)}" data-name="${player.id}" aria-label="玩家名称" />
            ${badge}
          </div>
          <span class="score">${formatScore(score)}</span>
        </article>
      `;
    })
    .join("");
}

function renderSelect(select, selectedId) {
  select.innerHTML = state.players
    .map((player) => {
      const selected = player.id === selectedId ? "selected" : "";
      return `<option value="${player.id}" ${selected}>${escapeHtml(player.name)}</option>`;
    })
    .join("");
}

function renderStats() {
  const balances = getBalances();
  const values = Object.values(balances);
  const net = values.reduce((sum, value) => sum + value, 0);
  const biggest = state.records.reduce((max, record) => {
    const peak = Math.max(...Object.values(record.changes).map(Math.abs));
    return Math.max(max, peak);
  }, 0);
  nodes.roundCount.textContent = String(state.records.length);
  nodes.biggestRound.textContent = String(biggest);
  nodes.selfName.textContent = state.players[0].name;
  nodes.netBalance.textContent = formatScore(net);
  renderMiniBars(values);
}

function renderMiniBars(values) {
  const max = Math.max(1, ...values.map(Math.abs));
  nodes.miniBars.innerHTML = values
    .map((value) => {
      const height = Math.max(16, (Math.abs(value) / max) * 88);
      const color = value >= 0 ? "var(--green)" : "var(--red)";
      return `<span style="height:${height}px;background:${color}"></span>`;
    })
    .join("");
}

function renderHistory() {
  if (!state.records.length) {
    nodes.historyList.innerHTML = '<div class="empty-state">还没有记录。先记一手牌，账本会自动累计。</div>';
    return;
  }
  nodes.historyList.innerHTML = [...state.records]
    .reverse()
    .map((record) => `
      <article class="history-item">
        <div>
          <strong>${escapeHtml(recordTitle(record))}</strong>
          <small>${formatTime(record.createdAt)}${record.note ? ` · ${escapeHtml(record.note)}` : ""}</small>
        </div>
        <button class="delete-button" type="button" data-delete="${record.id}" aria-label="删除记录">×</button>
      </article>
    `)
    .join("");
}

function renderForm() {
  renderSelect(nodes.winnerSelect, nodes.winnerSelect.value || state.players[0].id);
  renderSelect(nodes.loserSelect, nodes.loserSelect.value || state.players[1].id);
  nodes.stepInput.value = state.step;
  nodes.amountInput.value = nodes.amountInput.value || state.step;
  nodes.loserField.style.display = state.mode === "selfDraw" ? "none" : "grid";
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.mode === state.mode);
  });
}

function render() {
  renderPlayers();
  renderForm();
  renderStats();
  renderHistory();
  saveState();
}

function addRecord(event) {
  event.preventDefault();
  const amount = Number(nodes.amountInput.value);
  const winnerId = nodes.winnerSelect.value;
  const loserId = nodes.loserSelect.value;
  if (!Number.isFinite(amount) || amount <= 0) return alert("金额必须大于 0。");
  if (state.mode !== "selfDraw" && winnerId === loserId) return alert("收付款人不能相同。");
  const record = {
    id: createId(),
    type: state.mode,
    winnerId,
    loserId: state.mode === "selfDraw" ? "" : loserId,
    amount,
    note: nodes.noteInput.value.trim(),
    changes: buildChanges(state.mode, winnerId, loserId, amount),
    createdAt: new Date().toISOString(),
  };
  state.records.push(record);
  nodes.noteInput.value = "";
  render();
}

function bindEvents() {
  nodes.recordForm.addEventListener("submit", addRecord);
  nodes.stepInput.addEventListener("change", updateStep);
  nodes.playersGrid.addEventListener("input", updateName);
  nodes.historyList.addEventListener("click", deleteRecord);
  nodes.undoButton.addEventListener("click", undoRecord);
  nodes.resetButton.addEventListener("click", resetLedger);
  nodes.exportButton.addEventListener("click", exportLedger);
  nodes.importInput.addEventListener("change", importLedger);
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });
}

function updateStep() {
  const nextStep = Math.max(1, Number(nodes.stepInput.value) || defaultState.step);
  state.step = nextStep;
  nodes.amountInput.value = nextStep;
  render();
}

function updateName(event) {
  const playerId = event.target.dataset.name;
  if (!playerId) return;
  const player = state.players.find((item) => item.id === playerId);
  player.name = event.target.value.trim() || "未命名";
  renderForm();
  renderStats();
  saveState();
}

function deleteRecord(event) {
  const recordId = event.target.dataset.delete;
  if (!recordId) return;
  state.records = state.records.filter((record) => record.id !== recordId);
  render();
}

function undoRecord() { state.records.pop(); render(); }
function resetLedger() {
  if (!confirm("确认清空所有记录和玩家名称？")) return;
  state = structuredClone(defaultState);
  render();
}

function setMode(mode) { state.mode = mode; nodes.amountInput.value = state.step; render(); }
function exportLedger() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mineguai-ledger-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importLedger(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  file.text().then((text) => {
    const parsed = JSON.parse(text);
    state = { ...structuredClone(defaultState), ...parsed };
    render();
  }).catch(() => alert("导入失败，请确认文件是有效 JSON。"));
  event.target.value = "";
}

function formatTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

bindEvents();
render();
