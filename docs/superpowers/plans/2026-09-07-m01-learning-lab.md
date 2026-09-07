# M01 Learning Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn M01 into a decision-training lab with immediate feedback, an in-lesson workbook, substantive completion gates, and readable Editorial Instrument styling.

**Architecture:** Keep `app.js` as the sole owner of normal lesson routes. Add optional `learningLab` metadata to only M01 lessons from a dedicated data file. Extend generic lesson rendering/binding so M01 gets drills/workbook while M02-M10 retain existing behavior.

**Tech Stack:** Static HTML/CSS/JavaScript, browser localStorage, Node `node:test` CI.

**Spec:** `docs/superpowers/specs/2026-09-07-m01-learning-lab-design.md`

## Global Constraints
- Do not change `main`.
- Do not add telemetry.
- Do not add a new learner-facing route or router owner.
- Preserve `pm01-state-v1` backward compatibility.
- M02-M10 completion behavior must remain unchanged.
- Target WCAG AA 4.5:1 for normal learner-facing text.

---

### Task 1: Define lab data contract and load order

**Files:**
- Create: `m01-learning-lab-data.js`
- Modify: `index.html`
- Test: `tests/static-contract.test.js`

**Interfaces:**
- Consumes: `window.PM01`, `window.PM01.m01Validation.decisionDrills`.
- Produces: `lesson.learningLab = { technique, workedExample, drills, workbookFields, transferPrompt }` for the two M01 lessons.

- [ ] Add a failing static-contract test requiring `m01-learning-lab-data.js` after `m01-validation-data.js` and before `app.js`, and requiring both M01 lesson IDs in the lab data file.
- [ ] Run `node --test tests/*.test.js`; verify the new contract fails because the file/load order does not exist.
- [ ] Add `m01-learning-lab-data.js` with one reusable technique/workbook contract per M01 lesson and attach the existing validation decision drill by `lessonId`.
- [ ] Add the script to `index.html` in the required order.
- [ ] Run the full test suite and commit.

### Task 2: Render decision lab and workbook

**Files:**
- Modify: `app.js`
- Test: `tests/m01-app-smoke.test.js`

**Interfaces:**
- Consumes: optional `lesson.learningLab`.
- Produces: DOM classes `learning-lab`, `lab-drill`, `lab-feedback`, `lab-workbook`, `lab-transfer`, plus persisted `state.lab[lessonId]`.

- [ ] Add a failing VM/static smoke test asserting an M01 lesson includes a decision drill, feedback region, technique, workbook fields, and transfer section while a non-M01 lesson does not include `learning-lab`.
- [ ] Verify RED with `node --test tests/*.test.js`.
- [ ] Extend `defaultState` with `lab: {}` and normalize missing nested lab state when rendering.
- [ ] Render the optional lab sequence before the final completion action: cold/guided decision drill → feedback → worked example → technique → workbook → transfer.
- [ ] Bind drill radio changes to persist the selected option and render option-specific feedback immediately.
- [ ] Bind workbook input/textarea changes to persist field values.
- [ ] Run full tests and commit.

### Task 3: Gate M01 completion on evidence instead of checkbox self-attestation

**Files:**
- Modify: `app.js`
- Test: `tests/m01-app-smoke.test.js`

**Interfaces:**
- Produces: `labReady(lesson, state)` behavior: at least one answered drill and all required workbook fields non-empty.

- [ ] Add a failing test that M01 completion is disabled until drill + required workbook fields are present, then enabled; verify a representative M02 lesson still uses the existing criteria gate.
- [ ] Verify RED.
- [ ] Add a small readiness helper and M01-specific completion status text.
- [ ] Hide legacy checkbox criteria for lessons with `learningLab`; preserve them for all other lessons.
- [ ] Update completion handler so M01 uses lab readiness and still writes to the existing `completed` array and advances to the next lesson.
- [ ] Run full tests and commit.

### Task 4: Fix readability without losing art direction

**Files:**
- Modify: `art-direction.css`
- Test: `tests/static-contract.test.js`

**Interfaces:**
- Produces: readable essential text tokens and styled lab surfaces/classes.

- [ ] Add failing CSS contract tests that essential secondary learner text uses a named readable token rather than `#5f5f5a`, `#666660`, or `#777770`, and that lab classes have explicit focus/feedback styles.
- [ ] Verify RED.
- [ ] Introduce `--text-secondary` and `--text-tertiary` values with visibly stronger contrast on `#0a0a0a`.
- [ ] Replace low-contrast essential labels/statuses with the new tokens while leaving decorative numbering subdued.
- [ ] Style `learning-lab`, drill options, feedback, technique, workbook, transfer, and focus states in the Editorial Instrument language.
- [ ] Ensure body/workbook text remains at least 16px where substantive.
- [ ] Run full tests and commit.

### Task 5: Integration verification and clean Pages preview

**Files:**
- Production assets only on `gh-pages` after feature CI is GREEN.

- [ ] Run/confirm `Prototype CI` on the final feature head and require success.
- [ ] Build a clean `gh-pages` tree from current production assets plus the new lab data/app/style/index files; do not copy tests/docs into Pages.
- [ ] Verify Pages deployment success for the exact deploy SHA.
- [ ] Externally fetch root and first M01 lesson to confirm the new scripts/content are publicly served.
- [ ] Open a PR from `feature/m01-learning-lab` to `feature/art-direction-editorial-instrument`; do not merge.
