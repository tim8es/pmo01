# M01 Learning Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn M01 `Проект как система` into the first measurable end-to-end learning-validation slice: baseline case → lessons/drills → integrative post-case → field application → reflection/evidence.

**Architecture:** Keep the existing static prototype. Add a small pure-JavaScript learning domain module for scoring and state semantics, structured M01 validation content in `course-data.js`, and one dedicated validation route in `app.js`. Persist validation work in the existing localStorage state without introducing backend/auth/framework migration.

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

---

### Task 1: Add CI and failing learning-domain tests

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `tests/learning-domain.test.js`

**Interfaces:**
- Consumes: future CommonJS exports from `learning-domain.js`.
- Produces: executable contract for `scoreAssessment`, `promotionDecision`, and `deriveLearningState`.

- [ ] Create a GitHub Actions workflow that runs `node --test tests/*.test.js` on pushes and pull requests.
- [ ] Add tests asserting rubric totals, per-dimension scores, promotion delta + dimension gate, and the rule that immediate assessment cannot produce `mastered`.
- [ ] Open/refresh the feature PR and verify CI fails specifically because `learning-domain.js` does not yet exist.

### Task 2: Implement the pure learning domain

**Files:**
- Create: `learning-domain.js`

**Interfaces:**
- Produces: `scoreAssessment(questions, answers) -> { total, byDimension, max }`.
- Produces: `promotionDecision(baseline, post, options?) -> { promoted, delta, improvedDimensions }`.
- Produces: `deriveLearningState({ studied, fieldApplied, transferEvidence }) -> 'unseen'|'studied'|'applied'|'mastered'`.

- [ ] Implement a browser + CommonJS compatible module with no DOM/storage dependencies.
- [ ] Validate answer scores are integers 0..3 and ignore unanswered questions rather than inventing credit.
- [ ] Implement the default promotion gate: `delta >= 3` and at least two dimensions improve.
- [ ] Require explicit `transferEvidence` for `mastered`; `fieldApplied` alone yields `applied`.
- [ ] Verify the Task 1 test suite passes.

### Task 3: Add structured M01 validation content and content tests

**Files:**
- Modify: `course-data.js`
- Create: `tests/m01-content.test.js`

**Interfaces:**
- Produces: `window.PM01.m01Validation` with `rubricDimensions`, `baseline`, `decisionDrills`, `postCase`, `fieldApplication`, `reflection`.

- [ ] First add a failing test that evaluates `course-data.js` in a VM sandbox and checks the M01 validation contract.
- [ ] Add five stable rubric dimensions: mechanism, evidence, tradeoffs, intervention, changeCondition.
- [ ] Add a baseline case with five scored questions; each answer option carries `score: 0..3` and inspectable feedback.
- [ ] Add two decision drills mapped to the existing M01 lessons.
- [ ] Add a non-identical integrative post-case using the same five dimensions.
- [ ] Add a field-application prompt requiring a real project, intervention, expected signal, observed evidence, and next decision.
- [ ] Add reflection prompts comparing baseline reasoning with post-case reasoning.
- [ ] Verify content-contract tests pass.

### Task 4: Integrate the validation route and persisted learner state

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Create: `tests/static-contract.test.js`

**Interfaces:**
- `index.html` loads `learning-domain.js` after `course-data.js` and before `app.js`.
- `app.js` persists `state.validation.m01` under existing `pm01-state-v1` storage.
- Route: `#/validation/m01`.

- [ ] First add failing static-contract tests for script order, route support, and the M01 validation CTA.
- [ ] Extend default state with `validation: { m01: {} }` while preserving existing stored state.
- [ ] Add a `validation/m01` route with staged sections: baseline, lesson links/drills, post-case, field application, reflection/result.
- [ ] Save assessment answers and reasoning before revealing feedback.
- [ ] Show baseline score only after baseline submission; show post score and delta only after post submission.
- [ ] Use `promotionDecision` to show a neutral validation signal, not celebratory correctness UI.
- [ ] Use `deriveLearningState` to show `studied`/`applied`; never auto-show `mastered` unless explicit transfer evidence is recorded.
- [ ] Add a CTA from M01 in the course view to the validation route without changing other modules.
- [ ] Verify static-contract and domain tests pass.

### Task 5: Add validation UI styling and accessibility checks

**Files:**
- Modify: `styles.css`
- Modify: `tests/static-contract.test.js`

**Interfaces:**
- Reuse existing `.question-card`, `.option`, `.practice`, `.button` patterns where possible.

- [ ] Add only the styles required for the validation stepper, rubric result rows, reasoning textareas, and evidence summary.
- [ ] Ensure all inputs have visible labels/legends and keyboard-operable native controls.
- [ ] Ensure score/learning-state meaning is conveyed by text, not color alone.
- [ ] Add static checks for required fieldsets/labels/aria-live result region.
- [ ] Verify all tests pass.

### Task 6: Document the experiment and prepare review

**Files:**
- Create: `docs/validation/M01-VALIDATION-PROTOCOL.md`
- Modify: `README.md`

**Interfaces:**
- Produces an operational protocol for real learner sessions and a clear statement that scores are prototype evidence, not validated mastery.

- [ ] Document who to test with, baseline/post protocol, what to observe, interview prompts, and how to record qualitative failures.
- [ ] Define the module promotion review: learning delta, transfer evidence, interaction usefulness, friction, and content-model exceptions.
- [ ] Add a README link to the M01 validation route/protocol.
- [ ] Run/inspect GitHub Actions and require green CI before marking the PR ready.
- [ ] Review the final diff for scope creep: no backend/auth/framework migration or unrelated refactor.
