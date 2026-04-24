# Round Table Mobile Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the mahjong ledger into a mobile-first round-table scoring tool with only core features.

**Architecture:** Collapse the app into a focused single-flow experience: a compact landing header, a round-table target selector, a bottom ledger rail for scoring actions, and a lightweight history sheet. Remove low-value state such as stage, dealer, and theme so the UI and storage model only serve rapid scoring.

**Tech Stack:** React, TypeScript, Vite, GSAP, CSS via `src/styles.css`

---

### Task 1: Simplify state model

**Files:**
- Modify: `src/lib/ledger.ts`
- Modify: `src/hooks/useLedger.ts`
- Modify: `src/lib/storage.ts`

- [ ] Remove `stage`, `theme`, and `dealer` state from the ledger model and keep only names, balances, step value, records, and archived sessions.
- [ ] Keep storage backward-compatible by migrating older saved payloads into the new shape.
- [ ] Preserve core operations: apply record, undo one record, undo last, reset current session, next session, rename players, change step value.

### Task 2: Replace page structure with tool-first flow

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/RoundTableLedger.tsx`
- Create: `src/components/HistorySheet.tsx`

- [ ] Remove the old hero, feature grid, pinned story, theme switcher, precision board, and replay layout from the main render path.
- [ ] Build a tool-first page with one strong intro block, the round-table mobile stage, and a compact history area.
- [ ] Keep the page usable on desktop, but optimize layout and interaction hierarchy for mobile.

### Task 3: Rebuild visual system

**Files:**
- Modify: `src/styles.css`

- [ ] Replace the old jade/editorial surface system with a warmer, darker round-table palette.
- [ ] Implement the round-table stage, opponent nodes, bottom ledger rail, and mobile-first spacing in CSS.
- [ ] Add a small amount of meaningful motion for round-table entrance and history reveal without returning to grid/card-heavy dashboard UI.

### Task 4: Verify and review

**Files:**
- Modify: any files above if review finds issues

- [ ] Run `npm run build` and fix any type/build regressions.
- [ ] Request code review against the working tree diff and address any material findings before completion.
