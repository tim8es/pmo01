# M01 Learning Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn M01 `Проект как система` into the first measurable end-to-end learning-validation slice: baseline case → lessons/drills → integrative post-case → field application → reflection/evidence.

**Architecture:** Keep the existing static prototype and leave legacy `app.js`, `course-data.js`, and `styles.css` unchanged. Add isolated M01 extension files: a pure learning-domain module, structured validation content, a post-router UI extension, and validation-specific CSS. Persist validation work under a separate `pm01-validation-m01-v1` localStorage key so the legacy app cannot erase experiment state when it writes `pm01-state-v1`.

**Tech Stack:** Static HTML/CSS/JavaScript, browser `localStorage`, Node.js built-in test runner in GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-06-pmo01-platform-foundation-design.md`

## Global Constraints

- Current application remains a reference prototype, not the target v1 architecture.
- Do not add backend, authentication, CMS, AI tutor/assessment, payments, or cloud sync.
- Do not assign `mastered` automatically from page visits or a single immediate assessment.
- Baseline and post-case must be structurally similar but non-identical.
- Promotion signal: post-case score improves by at least 3 points and at least 2 rubric dimensions improve.
- Learner work must survive ordinary reload/navigation via localStorage.
- New domain logic must be testable outside the DOM.
- M01 validation data must not share a storage key with the legacy in-memory course state.
- Baseline score and option-level explanatory feedback must remain blind until post-case submission so the assessment itself does not become an unplanned teaching intervention.

---

### Task 1: Add CI and failing learning-domain tests

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `tests/learning-domain.test.js`

**Interfaces:**
- Consumes: CommonJS exports from `learning-domain.js`.
- Produces: executable contract for `scoreAssessment`, `promotionDecision`, and `deriveLearningState`.

- [x] Add GitHub Actions CI running `node --test tests/*.test.js` on pushes and pull requests.
- [x] Add tests for rubric totals, unanswered questions, promotion delta + dimension gate, and non-automatic mastery.
- [x] Verify RED in Actions: tests fail specifically because `learning-domain.js` does not exist.

### Task 2: Implement the pure learning domain

**Files:**
- Create: `learning-domain.js`

**Interfaces:**
- Produces: `scoreAssessment(questions, answers) -> { total, byDimension, max, answered }`.
- Produces: `promotionDecision(baseline, post, options?) -> { promoted, delta, improvedDimensions }`.
- Produces: `deriveLearningState({ studied, fieldApplied, transferEvidence }) -> 'unseen'|'studied'|'applied'|'mastered'`.

- [x] Implement browser + CommonJS compatible module with no DOM/storage dependencies.
- [x] Validate option scores as integers `0..3`; unanswered questions receive no invented credit.
- [x] Implement default promotion gate: `delta >= 3` and at least two improved dimensions.
- [x] Require explicit transfer evidence for the domain function to return `mastered`; immediate application yields at most `applied`.
- [x] Verify GREEN in Actions.

### Task 3: Add structured M01 validation content and content tests

**Files:**
- Create: `m01-validation-data.js`
- Create: `tests/m01-content.test.js`

**Interfaces:**
- Produces: `window.PM01.m01Validation` with `rubricDimensions`, `baseline`, `decisionDrills`, `postCase`, `fieldApplication`, `reflection`.

- [x] Add failing VM-based content-contract test before production content.
- [x] Add five stable rubric dimensions: mechanism, evidence, tradeoffs, intervention, changeCondition.
- [x] Add a five-question baseline with inspectable `0..3` options and feedback.
- [x] Add two Decision Drills mapped to `project-system` and `system-diagnostic`.
- [x] Add a non-identical five-question integrative post-case using the same dimensions.
- [x] Add real-project field application requiring project, symptom, mechanism, intervention, signal, evidence, and next decision.
- [x] Add reflection prompts comparing baseline reasoning with later reasoning.
- [x] Verify RED before content and GREEN after content in Actions.

### Task 4: Integrate the validation route and isolated learner state

**Files:**
- Modify: `index.html`
- Create: `m01-validation-app.js`
- Create: `tests/static-contract.test.js`
- Create: `tests/m01-app-smoke.test.js`

**Interfaces:**
- `index.html` loads `course-data.js → m01-validation-data.js → learning-domain.js → app.js → m01-validation-app.js`.
- Validation state persists under `pm01-validation-m01-v1`.
- Existing course state remains under `pm01-state-v1` and is read only to determine whether both M01 lessons are completed.
- Route: `#/validation/m01`.

- [x] Add failing static-contract tests for script order, route ownership, course CTA, isolated storage, semantic controls, and validation CSS.
- [x] Keep validation persistence separate from legacy storage after identifying stale-state overwrite risk.
- [x] Add staged route: baseline → lesson links/drills → post-case → field application → reflection/result.
- [x] Freeze submitted baseline/post answers and first drill choices at submission.
- [x] Keep baseline score and option-level feedback blind after baseline submission; reveal comparison/results only after post-case submission.
- [x] Show post score, baseline/post comparison, dimension deltas, and promotion signal only after post-case submission.
- [x] Add a VM runtime smoke test for route rendering, post-case gates, course CTA injection, and baseline blinding.
- [x] Verify the baseline-blinding regression test fails before the fix and passes after the fix.
- [x] Use `promotionDecision` for a neutral learning signal, explicitly not mastery.
- [x] Use `deriveLearningState` only up to `applied` in the UI; delayed transfer evidence remains human-review evidence.
- [x] Add M01 validation CTA to the course view without modifying the legacy router implementation.
- [x] Verify RED before UI extension and GREEN after integration.

### Task 5: Add validation-specific styling and accessibility contracts

**Files:**
- Create: `m01-validation.css`
- Modify: `tests/static-contract.test.js`

**Interfaces:**
- Reuses existing typography/button tokens while keeping validation selectors isolated.

- [x] Add validation step, score, drill, evidence, result, and CTA styles.
- [x] Use native radio/fieldset/legend/textarea/button controls.
- [x] Provide explicit labels for textareas and a polite live region for persistence/validation messages.
- [x] Convey score/state meaning with text rather than color alone.
- [x] Add narrow-screen layout for score/drill grids.
- [x] Verify static contracts pass.

### Task 6: Document the experiment and prepare review

**Files:**
- Create: `docs/validation/M01-VALIDATION-PROTOCOL.md`
- Modify: `README.md`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces a reproducible learner-session protocol and makes runtime/test boundaries visible to future contributors.

- [x] Document participant profile, baseline/post sequence, observations, interview prompts, field transfer, delayed follow-up, and anonymized session record.
- [x] Define module-level review across learning signal, transfer, interaction usefulness, friction/reliability, and content-model fit.
- [x] Document the baseline measurement-blinding rule and its rationale.
- [x] Document M01 route, file boundaries, storage keys, and validation protocol in README.
- [x] Add `node --check` for legacy and validation runtime JavaScript to CI.
- [x] Upgrade GitHub Actions runtime dependencies to current major versions used by the workflow.
- [x] Inspect final Actions run after documentation/CI changes and require GREEN.
- [x] Review final diff for scope creep and architecture violations: Phase 1 only; no backend/auth/framework migration; legacy `app.js`, `course-data.js`, and `styles.css` unchanged.
- [x] Update PR #2 from draft after verification; PR #2 is ready-for-review and mergeable.
