# M01 Playable Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement one deterministic 7–10 minute M01 project-management simulator mission with four decisions, visible project state, optional tools, authored consequences, trajectory review, and cohort-safe evidence persistence.

**Architecture:** Keep the existing static-app architecture. Add one authored mission data module, one pure deterministic simulator domain module, and one simulator UI extension that owns `#/mission/m01`. Integrate minimally with `index.html`, the base router reservation, M01 course entry point, and M01 validation treatment gate; preserve baseline/post-case isolation and keep all simulator evidence in a dedicated localStorage key.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, browser localStorage, Node 22 built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-09-09-m01-playable-vertical-slice-design.md`

## Global Constraints

- M01 only; no M02 changes.
- No telemetry changes.
- Do not modify `main`; work only on the isolated feature branch.
- No production publication or merge.
- Mission ID is `m01-mission-partner-launch-v1`.
- Exactly four deterministic decision moments; no randomness and no hidden aggregate score.
- Visible project state: deadline confidence, stakeholder trust, team capacity, launch risk, each clamped to `0..100`.
- Optional tools are penalty-free and never reveal the preferred answer.
- First committed choice at each decision is immutable for cohort evidence.
- Baseline/post-case remain separate and blind; simulator completion unlocks post-case only for the pinned simulator treatment.
- Do not mix old textual M01.1 treatment evidence with simulator-treatment evidence inside one cohort.
- No automatic mastery inference.
- Accessibility is part of the slice: semantic controls, keyboard path, focus management, text equivalents for meters, reduced-motion compatibility.

---

## File Structure

- Create `m01-simulator-data.js` — authored mission content, initial state, four decisions, tools, copy, deterministic deltas and flags.
- Create `m01-simulator-domain.js` — pure state/evidence functions: initial state, transition, clamping, completion, trajectory summary.
- Create `m01-simulator-app.js` — route renderer, persistence, tool interaction, decision commit, consequence screen, trajectory review.
- Create `m01-simulator.css` — simulator-only styles and accessibility states.
- Modify `index.html` — load simulator CSS/data/domain/app in deterministic order.
- Modify `app.js` — reserve `mission/m01` from base-router overwrite and route the M01 course entry point to the mission while leaving non-M01 modules unchanged.
- Modify `m01-validation-app.js` — replace the two-lesson learning gate with the pinned simulator mission completion gate on this feature branch; leave baseline/post/field/reflection logic intact.
- Create `tests/m01-simulator-domain.test.js` — pure deterministic transition/evidence tests.
- Create `tests/m01-simulator-integration.test.js` — static/VM contract tests for route ownership, load order, treatment isolation, first-choice lock and accessible markup.

---

### Task 1: Define simulator domain contract with RED tests

**Files:**
- Create: `tests/m01-simulator-domain.test.js`
- Create: `tests/m01-simulator-integration.test.js`

**Interfaces:**
- Consumes: existing Node test conventions and browser-global module pattern.
- Produces required interfaces for later tasks:
  - `window.PM01SimulatorData.mission`
  - `window.PM01SimulatorDomain.initialRun(mission)`
  - `window.PM01SimulatorDomain.commitDecision(run, mission, decisionId, optionId, rationale)`
  - `window.PM01SimulatorDomain.openTool(run, toolId, decisionId)`
  - `window.PM01SimulatorDomain.isComplete(run, mission)`
  - `window.PM01SimulatorDomain.trajectory(run, mission)`

- [ ] **Step 1: Write failing pure-domain tests**

Test that the mission has exactly four decisions, every decision has 3–4 options, all effects are deterministic integers, initial meters are `0..100`, transitions clamp meter values, committed decisions cannot be replaced, tool opening records evidence without changing meters, and completion requires exactly four committed decisions plus required rationales for D1/D4.

- [ ] **Step 2: Write failing integration/static tests**

Test that `index.html` loads simulator data → domain → app after base learning data but before validation extension; the base router reserves `mission/m01`; the simulator app owns `#/mission/m01`; validation uses the simulator completion contract instead of legacy lesson completion on this branch; simulator storage uses a dedicated key and does not write telemetry.

- [ ] **Step 3: Run tests and confirm RED**

Run: `node --test tests/m01-simulator-domain.test.js tests/m01-simulator-integration.test.js`

Expected: FAIL because simulator files/interfaces do not yet exist.

- [ ] **Step 4: Commit RED tests**

Commit message: `test: define M01 simulator vertical-slice contract`

---

### Task 2: Implement authored mission data + pure transition engine

**Files:**
- Create: `m01-simulator-data.js`
- Create: `m01-simulator-domain.js`
- Test: `tests/m01-simulator-domain.test.js`

**Interfaces:**
- `PM01SimulatorData.mission` includes `id`, `version`, `title`, `initialState`, `meters`, `tools`, `decisions`.
- `initialRun(mission)` returns `{ treatmentId, status, decisionIndex, meters, flags, decisions, toolsOpened, events }`.
- `commitDecision(...)` returns a new run object and throws/returns an explicit error for invalid node/option or a second commit to the same node.
- `openTool(...)` returns a new run with one evidence event and unchanged meters.
- `trajectory(...)` returns a deterministic review model from the run; no hidden aggregate score.

- [ ] **Step 1: Implement mission data exactly from the approved spec**

Use initial meters: deadline 58, trust 64, capacity 72, risk 63. Implement D1–D4 options, deterministic meter deltas and flags from the spec, plus the three optional tools: Decision Timeline, Hypothesis Comparator, Change Condition.

- [ ] **Step 2: Implement pure immutable domain functions**

Clamp meters to `0..100`. Record `before`, `after`, `delta`, selected option, flags added, rationale and event sequence. Do not use time or randomness in domain decisions; timestamps are UI persistence metadata only.

- [ ] **Step 3: Run pure-domain tests**

Run: `node --test tests/m01-simulator-domain.test.js`

Expected: PASS.

- [ ] **Step 4: Run full existing test suite**

Run: `node --test tests/*.test.js`

Expected: existing tests plus simulator-domain tests pass except integration tests that intentionally wait for Task 3/4 wiring.

- [ ] **Step 5: Commit**

Commit message: `feat: add deterministic M01 simulator mission engine`

---

### Task 3: Build accessible playable mission UI and persistence

**Files:**
- Create: `m01-simulator-app.js`
- Create: `m01-simulator.css`
- Modify: `index.html`
- Test: `tests/m01-simulator-integration.test.js`

**Interfaces:**
- Route: `#/mission/m01`.
- Dedicated storage key: `pm01-simulator-m01-v1`.
- Stored envelope: `{ treatmentId, missionVersion, run, startedAt, completedAt }`.
- Completion evidence must expose the pinned treatment ID `m01-mission-partner-launch-v1`.

- [ ] **Step 1: Load simulator modules and CSS in `index.html`**

Load `m01-simulator-data.js`, then `m01-simulator-domain.js`, then `m01-simulator-app.js`; keep `m01-validation-app.js` last so it can consume the completion contract.

- [ ] **Step 2: Render mission shell**

Render title/premise, textual meter cards, progress `Decision N of 4`, open facts, optional tools and current decision as semantic `<fieldset>`/radio controls. No canvas-only or color-only state.

- [ ] **Step 3: Implement tool drawers**

Each tool is opened by a real `<button aria-expanded>` and exposes checklist content in DOM. Opening a tool records an event but does not mutate project meters.

- [ ] **Step 4: Implement decision commit + consequence step**

D1 requires a non-empty rationale before commit. D4 requires a non-empty keep/revise rationale. After commit, disable the option controls, save evidence immediately, show numerical and textual state deltas, then expose one explicit `Continue` button. Never allow replacing a committed answer.

- [ ] **Step 5: Implement final trajectory review**

Show the four committed decisions, state trajectory, rationale snippets, tools opened and whether the diagnosis was revised. Before post-case, do not label options as correct/preferred and do not reveal an expert solution. Provide a CTA back to `#/validation/m01` when the run is complete.

- [ ] **Step 6: Add storage failure handling**

Probe localStorage. If saving fails, show an assertive visible message and prevent moving to the next decision so cohort evidence is not silently lost.

- [ ] **Step 7: Add accessibility behavior**

Move focus to the new decision/consequence heading after screen transitions; preserve keyboard operation; include `aria-live` only for consequence/status updates; respect `prefers-reduced-motion`; meters must include visible numeric values and descriptive text.

- [ ] **Step 8: Run integration tests**

Run: `node --test tests/m01-simulator-integration.test.js`

Expected: route/load/storage/accessibility contracts pass except course/validation wiring deferred to Task 4.

- [ ] **Step 9: Commit**

Commit message: `feat: add playable M01 simulator mission UI`

---

### Task 4: Wire course + validation treatment without contaminating measurement

**Files:**
- Modify: `app.js`
- Modify: `m01-validation-app.js`
- Test: `tests/m01-simulator-integration.test.js`
- Test: existing M01 validation tests as required.

**Interfaces:**
- `app.js` must not render not-found for `mission/m01`; simulator extension owns that route.
- M01 course entry should target `#/mission/m01`; other modules keep the existing lesson routing.
- `m01-validation-app.js` determines `isStudied()` from a valid completed simulator envelope with exact treatment ID/version, not legacy M01 lesson flags, for this feature treatment.

- [ ] **Step 1: Reserve simulator route in base router**

Follow the same extension-ownership seam used by `validation/m01`: base app leaves `mission/m01` DOM ownership to `m01-simulator-app.js`.

- [ ] **Step 2: Route M01 primary course entry to mission**

For module `m01`, the course/home target becomes `#/mission/m01`; do not remove old lesson data or alter other modules in this slice.

- [ ] **Step 3: Replace validation learning block with simulator treatment CTA**

After blind baseline, show one CTA to `#/mission/m01` and a treatment status. Post-case unlocks only after a valid completed simulator run with exact `treatmentId === 'm01-mission-partner-launch-v1'`.

- [ ] **Step 4: Preserve validation measurement**

Do not alter baseline questions, scoring, blinding, post-case questions, field application, reflection, validation storage key, or promotion rule.

- [ ] **Step 5: Run integration + validation tests**

Run: `node --test tests/m01-simulator-integration.test.js tests/m01-validation-*.test.js tests/m01-app-smoke.test.js`

Expected: PASS.

- [ ] **Step 6: Run full suite**

Run: `node --test tests/*.test.js`

Expected: PASS.

- [ ] **Step 7: Commit**

Commit message: `feat: use simulator as M01 validation treatment`

---

### Task 5: Structural content migration and cohort evidence review

**Files:**
- Modify: `tests/m01-simulator-integration.test.js`
- Optionally modify simulator data/app only if a test exposes a spec mismatch.

**Interfaces:**
- D1 evidence tests diagnosis before intervention.
- D2 tests changing the decision interface.
- D3 tests explicit trade-offs/reversibility.
- D4 injects the same falsifying fact for all learners and tests diagnosis revision.
- Tool-use evidence is descriptive, never scored as good/bad.

- [ ] **Step 1: Add structural tests for M01.1 concept migration**

Assert mission/tool copy contains explicit concepts for alternative hypothesis, discriminating evidence, falsifier, early signal and revision condition; assert no preferred-answer copy appears in the pre-post trajectory review.

- [ ] **Step 2: Add cohort comparability tests**

Assert every run receives the same four decision IDs in the same order, D4 underlying falsifying evidence is invariant across earlier flags, and flags may vary narrative only.

- [ ] **Step 3: Run full suite**

Run: `node --test tests/*.test.js`

Expected: PASS.

- [ ] **Step 4: Commit**

Commit message: `test: verify M01 simulator learning and cohort contracts`

---

### Task 6: Final verification and review package

**Files:**
- No product changes unless verification exposes a confirmed defect.

- [ ] **Step 1: Run JavaScript syntax checks**

Run: `for file in app.js course-data.js learning-domain.js m01-validation-data.js m01-learning-lab-data.js m01-simulator-data.js m01-simulator-domain.js m01-simulator-app.js m01-validation-app.js; do node --check "$file"; done`

Expected: all pass.

- [ ] **Step 2: Run complete test suite**

Run: `node --test tests/*.test.js`

Expected: 0 failures.

- [ ] **Step 3: Verify diff scope**

Confirm no file path containing `m02`, telemetry, or production `gh-pages` is changed. Confirm `main` SHA is unchanged.

- [ ] **Step 4: Browser-level review classification**

If no real browser-control runtime is available, mark actual click-through, responsive visual QA, and screen-reader behavior as UNEXECUTED rather than inferring them from static tests.

- [ ] **Step 5: Open a review PR only; do not merge**

Base it on the M01.1 feature/design lineage, describe treatment isolation, RED→GREEN evidence and browser-review limitations. No deployment.

---

## Self-Review

- Spec coverage: mission structure, four meters, D1–D4 consequences, optional tools, trajectory review, M01.1 concept migration, cohort treatment isolation, accessibility, persistence, tests and success gates are each mapped to a task.
- Scope: one mission only; no framework migration, no M02, no telemetry, no production release.
- Type/interface consistency: mission/data/domain/app names and storage/treatment IDs are consistent across tasks.
- No placeholder implementation steps remain.
