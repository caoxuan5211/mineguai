# Mahjong Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前单文件麻将计数页重构为基于 React 的作品级品牌站与手机优先记分应用。

**Architecture:** 使用 Vite + React + TypeScript 构建单页前端，展示层与记分状态层分离；用 Tailwind 和自定义 CSS variables 实现 `Jade Ledger` 主题；用 GSAP 为 Hero、叙事区和回放区添加关键滚动动效；用 localStorage 持久化局状态和偏好。

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS, GSAP, localStorage

---

### Task 1: Scaffold the frontend app

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/vite-env.d.ts`
- Modify: `index.html`

- [ ] **Step 1: Initialize the package and install dependencies**

Run: `npm init -y`
Run: `npm install react react-dom gsap @gsap/react @phosphor-icons/react`
Run: `npm install -D vite typescript @types/react @types/react-dom tailwindcss @tailwindcss/vite`

- [ ] **Step 2: Add Vite scripts and baseline config**

Ensure `package.json` includes:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: Point the HTML shell at the React entry**

Replace the old static app body in `index.html` with:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mahjong Ledger</title>
    <meta
      name="description"
      content="作品级麻将计数器，兼顾桌边快记分与沉浸式对局回放。"
    />
    <link rel="icon" href="/icon.png" type="image/png" />
    <script type="module" src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 4: Verify the scaffold builds**

Run: `npm run build`
Expected: Vite 构建产物输出到 `dist/`

### Task 2: Build the app state and ledger logic

**Files:**
- Create: `src/lib/ledger.ts`
- Create: `src/hooks/useLedger.ts`
- Create: `src/lib/storage.ts`
- Test: `npm run build`

- [ ] **Step 1: Model players, sessions, records, and stats**

Create types and pure helpers covering:

```ts
export type ThemeId = "jade" | "ink" | "brass";
export type StageId = "east" | "south";
export type ModeId = "rapid" | "precision";
export type DirectionId = "win" | "lose";

export type Player = {
  id: number;
  name: string;
  balance: number;
  isDealer: boolean;
  accentToken: string;
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
```

- [ ] **Step 2: Implement pure ledger mutations**

Add pure functions for:

```ts
createInitialState();
applyRecord(state, opponentId, amount, direction, mode);
undoLastRecord(state);
undoRecordById(state, recordId);
startNextSession(state);
setPlayerNames(state, names);
setDealer(state, playerId);
setStepValue(state, value);
setTheme(state, theme);
setStage(state, stage);
```

- [ ] **Step 3: Add derived summaries**

Compute:

```ts
getCurrentLeader(state);
getLargestSpread(state);
getRecentActions(state, limit);
getNetResultByPlayer(state);
getMomentumSummary(state);
```

- [ ] **Step 4: Wrap the state in a React hook with persistence**

Implement `useLedger()` to load from and save to `localStorage`, exposing actions and derived stats.

- [ ] **Step 5: Verify the state layer builds**

Run: `npm run build`
Expected: TypeScript passes with no type errors

### Task 3: Implement the premium landing shell

**Files:**
- Create: `src/components/FloatingNav.tsx`
- Create: `src/components/HeroSection.tsx`
- Create: `src/components/FeatureGrid.tsx`
- Create: `src/components/PinnedStory.tsx`
- Create: `src/components/FinalCta.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Build the floating navigation and skip link**

Add semantic navigation with anchored links for `开局`, `战绩`, `主题`, `关于`, and a skip-to-content link.

- [ ] **Step 2: Build the cinematic hero**

Use a wide headline, dual CTAs, layered backdrop, and an inline media pill embedded in the heading.

- [ ] **Step 3: Build the dense feature grid**

Implement a 12-column dense grid with 5 intentional panels covering rapid scoring, replay, dealer flow, themes, and local-first behavior.

- [ ] **Step 4: Build the pinned narrative section**

Create a left-pinned narrative title and right-side stacked story cards describing how a session becomes replayable data.

- [ ] **Step 5: Verify the shell builds**

Run: `npm run build`
Expected: Build passes and the page renders all AIDA sections

### Task 4: Implement the score arena and replay UI

**Files:**
- Create: `src/components/ScoreArena.tsx`
- Create: `src/components/RapidPad.tsx`
- Create: `src/components/PrecisionBoard.tsx`
- Create: `src/components/SessionReplay.tsx`
- Create: `src/components/ThemeSwitcher.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Build the summary and controls rail**

Render current leader, round, stage, dealer, step shortcuts, and current theme inside an upper control frame.

- [ ] **Step 2: Build rapid mode**

Implement two-step mobile-friendly scoring:

```ts
selectedOpponent -> selectedAmountAndDirection -> applyRecord()
```

- [ ] **Step 3: Build precision mode**

Render each opponent panel with gain/loss buttons using step-multiplied amounts.

- [ ] **Step 4: Build replay and selective undo**

Render timeline cards with selection, selected undo, last undo, and session summary cards.

- [ ] **Step 5: Build session controls**

Add `结束本局`, `开新局`, player naming, dealer toggle, and theme switching.

- [ ] **Step 6: Verify app interactions build**

Run: `npm run build`
Expected: Build passes with rapid, precision, replay, and controls wired to the state layer

### Task 5: Add motion, polish, and final verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/components/HeroSection.tsx`
- Modify: `src/components/PinnedStory.tsx`
- Modify: `src/components/SessionReplay.tsx`

- [ ] **Step 1: Add GSAP motion hooks**

Animate:

```ts
Hero intro timeline
PinnedStory ScrollTrigger pin
SessionReplay stack reveal
```

- [ ] **Step 2: Add theme variables and texture layers**

Create CSS variables for `jade`, `ink`, and `brass` themes, plus noise overlays, radial glows, and tinted shadows.

- [ ] **Step 3: Add interaction polish**

Ensure all primary actions have hover, pressed, and focus-visible states; ensure headings stay within 2-3 lines on large screens.

- [ ] **Step 4: Run full verification**

Run: `npm run build`
Expected: exit code `0`

Run: `git status --short`
Expected: only intended project files changed

- [ ] **Step 5: Prepare completion summary**

Summarize:

```txt
- what changed
- what was verified
- any residual limitation
```
