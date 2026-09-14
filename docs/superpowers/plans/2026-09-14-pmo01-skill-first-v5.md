# PMO01 Skill-First v5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce evidence-based mastery, upgrade M02 to the canonical Learning Lab flow, add an M02 proof challenge, and make the returning-home UX skill-oriented.

**Architecture:** Reuse the existing Learning Lab renderer instead of inventing a second lesson engine. Add one pure mastery domain, one M02 data layer, and one deterministic M02 challenge runtime; wire them into the existing home/course surfaces while preserving all M01 validation/treatment contracts.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, LocalStorage, Node.js built-in test runner, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-14-pmo01-skill-first-v5-design.md`

## Global Constraints

- Keep runtime local-only: no fetch/XHR/WebSocket/telemetry/LLM calls.
- Preserve `pm01-state-v1`, `pm01-sim-m01-v1`, M01 treatment id/version, M01 decision IDs/effects, and validation/cohort blindness.
- New storage key is exactly `pm01-m02-challenge-v5`.
- Mastery levels are exactly `Не встречал`, `Понял`, `Применил`, `Доказал`.
- No XP, coins, streaks, leaderboards, daily quests, or social ranking.
- M03–M10 remain on their current lesson runtime in this PR.
- M02 completion must rely on Learning Lab decision/workbook evidence, not legacy self-check checkboxes.

---

### Task 1: Add v5 RED contract tests

**Files:**
- Create: `tests/skill-first-v5.test.js`

**Interfaces:**
- Consumes: current production assets from `main`.
- Produces: executable contracts for Tasks 2–5.

- [ ] **Step 1: Write failing tests for asset loading and mastery domain**

Add assertions that `index.html` loads, in dependency order:

```js
assert.ok(index.indexOf('mastery-domain-v5.js') < index.indexOf('learning-experience-v2.js'));
assert.ok(index.includes('m02-learning-lab-data-v5.js'));
assert.ok(index.includes('m02-challenge-v5.js'));
```

Load `mastery-domain-v5.js` in a VM context and assert:

```js
const empty = api.derive({ courseState: {}, challengeState: {}, modules });
assert.equal(empty.skills.value.level, 0);
assert.equal(empty.skills.value.label, 'Не встречал');
```

Assert page visits/raw `completed` flags without required lab evidence cannot produce `Применил`.

- [ ] **Step 2: Write failing tests for M02 Learning Lab contracts**

Load `course-data.js` then `m02-learning-lab-data-v5.js` and assert both `outcome-tree` and `assumption-map` expose:

```js
assert.ok(lesson.learningLab.mission.length > 40);
assert.ok(lesson.learningLab.terms.length >= 4);
assert.equal(lesson.learningLab.drills.filter(d => d.required !== false).length, 2);
assert.ok(lesson.learningLab.workbookFields.filter(f => f.required !== false).length >= 6);
```

Also assert the existing generic renderer contains optional `lab.mission` and `lab.terms` handling and that legacy checkbox criteria are not the completion gate for lessons with `learningLab`.

- [ ] **Step 3: Write failing tests for M02 challenge proof semantics**

Load `m02-challenge-v5.js` in a DOM-light VM harness with fake LocalStorage and assert:

```js
assert.equal(api.isComplete(), false);
api.__test.commit('value-chain', 'strong-value');
api.__test.commit('assumption-priority', 'weak-assumption');
assert.equal(api.isComplete(), true);
const proof = api.proof();
assert.equal(proof.value, true);
assert.equal(proof.uncertainty, false);
```

Assert challenge state uses only `pm01-m02-challenge-v5` and contains exactly the two decision IDs.

- [ ] **Step 4: Write failing tests for returning-home skill UX**

Assert `learning-experience-v2.js` consumes `window.PM01MasteryV5`, renders learner-facing strings:

```text
Навык сейчас
Следующее доказательство
Карта навыков
```

and includes all seven skill IDs without adding XP/streak/leaderboard copy.

- [ ] **Step 5: Run tests and verify RED**

Run in CI/local equivalent:

```bash
node --test tests/skill-first-v5.test.js
```

Expected: failures because v5 assets and contracts do not exist yet.

- [ ] **Step 6: Commit RED tests**

```bash
git add tests/skill-first-v5.test.js
git commit -m "test: define skill-first v5 contracts"
```

---

### Task 2: Implement pure evidence-based mastery domain

**Files:**
- Create: `mastery-domain-v5.js`
- Modify: `index.html`
- Test: `tests/skill-first-v5.test.js`

**Interfaces:**
- Consumes: course state shape from `pm01-state-v1`, challenge state shape from `pm01-m02-challenge-v5`, `window.PM01.modules`.
- Produces:
  - `window.PM01MasteryV5.LEVELS`
  - `window.PM01MasteryV5.SKILLS`
  - `window.PM01MasteryV5.derive({ courseState, challengeState, modules })`
  - `window.PM01MasteryV5.nextEvidence(skillId, derived)`

- [ ] **Step 1: Implement constants and evidence helpers**

Use exactly:

```js
const LEVELS = [
  { level: 0, label: 'Не встречал' },
  { level: 1, label: 'Понял' },
  { level: 2, label: 'Применил' },
  { level: 3, label: 'Доказал' },
];
```

Define seven `SKILLS` keyed by existing flow IDs. Implement a pure `labEvidence(lesson, courseState)` that returns required drill answers and required workbook completion; it must ignore raw lesson completion if evidence is absent.

- [ ] **Step 2: Implement v5 evidence mapping**

Map:

```js
const LESSON_SKILLS = {
  'project-system': ['work', 'dependencies'],
  'system-diagnostic': ['decisions'],
  'outcome-tree': ['value'],
  'assumption-map': ['uncertainty'],
};
```

For each mapped skill:
- answered required drill => minimum level 1;
- complete required lab + completed lesson flag => minimum level 2;
- M02 challenge `proof.value/uncertainty` => level 3 for those skills only.

Do not award levels to `information` or `feedback` in this slice.

- [ ] **Step 3: Implement `nextEvidence`**

Return plain-language next action, e.g.:

```js
if (skill.level === 0) return 'Ответь на первое решение в связанном уроке.';
if (skill.level === 1) return 'Заверши рабочую карту и зафиксируй применение техники.';
if (skill.level === 2 && skillId === 'value') return 'Пройди итоговый challenge M02 сильным решением по цепочке ценности.';
if (skill.level === 2 && skillId === 'uncertainty') return 'Пройди итоговый challenge M02 и правильно выбери, какое допущение проверять первым.';
return 'Навык подтверждён итоговым challenge.';
```

- [ ] **Step 4: Load mastery domain before experience UI**

Add `<script src="mastery-domain-v5.js"></script>` after course/data layers and before `learning-experience-v2.js`.

- [ ] **Step 5: Run v5 tests**

```bash
node --test tests/skill-first-v5.test.js
```

Expected: mastery-domain assertions pass; M02/challenge/home assertions still fail.

- [ ] **Step 6: Commit**

```bash
git add mastery-domain-v5.js index.html tests/skill-first-v5.test.js
git commit -m "feat: derive mastery from learning evidence"
```

---

### Task 3: Upgrade M02 to canonical Learning Labs

**Files:**
- Create: `m02-learning-lab-data-v5.js`
- Modify: `index.html`
- Modify: `app.js`
- Test: `tests/skill-first-v5.test.js`

**Interfaces:**
- Consumes: `window.PM01.modules`, existing `renderLearningLab()` contract.
- Produces: `learningLab` definitions for `outcome-tree` and `assumption-map` with `mission`, `terms`, `skill`, `technique`, `workedExample`, two required drills, six required workbook fields, `transferPrompt`.

- [ ] **Step 1: Define M02.1 lab data**

Use the existing guided-case scenario as the cold decision but freeze the first choice through the existing Learning Lab drill behavior. Add:

```js
mission: 'Проверить, умеешь ли ты отличать готовый deliverable от доказанной ценности и восстанавливать причинную цепочку до наблюдаемого эффекта.'
```

Terms:

```js
[
  ['Output', 'То, что команда непосредственно выпускает: экран, интеграция, отчёт.'],
  ['Outcome', 'Наблюдаемое изменение поведения или состояния пользователя/бизнеса.'],
  ['Причинная связь', 'Гипотеза, что одно изменение действительно вызывает следующее.'],
  ['Evidence', 'Наблюдение, способное изменить уверенность или решение.'],
]
```

Workbook fields: `outcome`, `behavior`, `chain`, `weak-link`, `evidence`, `decision`.

- [ ] **Step 2: Define M02.2 lab data**

Mission:

```js
mission: 'Научиться выбирать, какое неизвестное проверять первым, чтобы новая информация пришла до дорогого или необратимого решения.'
```

Terms: assumption, confidence, cost of error, irreversibility with concise Russian definitions.

Workbook fields: `decision-at-risk`, `assumptions`, `confidence`, `cost`, `evidence-test`, `redirect-rule`.

- [ ] **Step 3: Extend generic Learning Lab renderer for mission and terms**

In `renderLearningLab()` render, when present:

```html
<section class="lab-mission">
  <p class="lab-step">Цель урока</p>
  <p>...</p>
</section>
<section class="lab-terms" aria-label="Ключевые термины">...</section>
```

Place these before the cold drill. Keep M01 behavior unchanged when fields are absent.

- [ ] **Step 4: Load M02 data before `app.js`**

Add `<script src="m02-learning-lab-data-v5.js"></script>` after M01 Learning Lab data and before `app.js`.

- [ ] **Step 5: Run all tests**

```bash
node --test tests/*.test.js
```

Expected: M02 v5 lab contracts pass; pre-existing M01 Learning Lab and completion tests remain green.

- [ ] **Step 6: Commit**

```bash
git add m02-learning-lab-data-v5.js index.html app.js tests/skill-first-v5.test.js
git commit -m "feat: convert M02 to evidence-based learning labs"
```

---

### Task 4: Add deterministic M02 module challenge

**Files:**
- Create: `m02-challenge-v5.js`
- Create: `m02-challenge-v5.css`
- Modify: `index.html`
- Modify: `learning-experience-v2.js`
- Test: `tests/skill-first-v5.test.js`

**Interfaces:**
- Consumes: LocalStorage, `window.PM01MasteryV5` only for display labels, current course state from `pm01-state-v1` for readiness.
- Produces:
  - `window.PM01M02ChallengeV5.getState()`
  - `window.PM01M02ChallengeV5.isComplete()`
  - `window.PM01M02ChallengeV5.proof()`
  - `window.PM01M02ChallengeV5.open()`
  - test-only deterministic commit hook `window.PM01M02ChallengeV5.__test.commit(decisionId, optionId)`

- [ ] **Step 1: Implement local state and deterministic challenge data**

Use decision IDs exactly:

```js
'value-chain'
'assumption-priority'
```

Strong option IDs exactly:

```js
'strong-value'
'strong-assumption'
```

`isComplete()` returns true only when both decision IDs exist. `proof()` returns:

```js
{
  value: state.decisions['value-chain'] === 'strong-value',
  uncertainty: state.decisions['assumption-priority'] === 'strong-assumption'
}
```

- [ ] **Step 2: Implement challenge rendering under `#/challenge/m02`**

Intercept that hash in the v5 challenge runtime and render into `#main`:
- briefing with purpose and two abilities tested;
- Decision 1 with four plausible options;
- immediate consequence/debrief after commit;
- Decision 2 with four plausible options;
- final review showing `Что доказано` and `Что усилить`;
- direct links to `outcome-tree` and `assumption-map`.

Do not expose numeric scores.

- [ ] **Step 3: Add challenge readiness to learning path**

In `learning-experience-v2.js`, when both M02 lessons are complete:
- current step becomes M02 challenge until complete;
- learning path M02 receives a third step label `Итоговый challenge M02`;
- challenge is not promoted to global navigation.

- [ ] **Step 4: Add scoped challenge styles**

Use `.m02-challenge-v5` prefix for all new challenge surfaces. Reuse semantic theme tokens from `theme-contract-v3.css`; do not introduce hard-coded light-only text/background pairs.

- [ ] **Step 5: Run all tests**

```bash
node --test tests/*.test.js
```

Expected: challenge semantics and existing routing tests pass.

- [ ] **Step 6: Commit**

```bash
git add m02-challenge-v5.js m02-challenge-v5.css index.html learning-experience-v2.js tests/skill-first-v5.test.js
git commit -m "feat: add M02 mastery challenge"
```

---

### Task 5: Make returning-home UX skill-oriented

**Files:**
- Modify: `learning-experience-v2.js`
- Modify: `learning-experience-v2.css`
- Test: `tests/skill-first-v5.test.js`
- Test: `tests/learning-experience-v2.test.js`

**Interfaces:**
- Consumes: `PM01MasteryV5.derive()`, `PM01MasteryV5.nextEvidence()`, M02 challenge state.
- Produces: returning-home UI with current mission, current skill, next evidence, seven-skill map.

- [ ] **Step 1: Derive current skill from current learning step**

Mapping:

```js
const STEP_SKILL = {
  'project-system': 'work',
  'system-diagnostic': 'decisions',
  'outcome-tree': 'value',
  'assumption-map': 'uncertainty',
  'challenge:m02': 'value',
};
```

For M02 challenge, show both `Ценность` and `Неопределённость` in the supporting text while keeping one primary skill label for layout simplicity.

- [ ] **Step 2: Replace generic progress emphasis with competence feedback**

First screen hierarchy:

```text
Продолжить обучение
<current mission title>
<one primary CTA>

Навык сейчас
<skill name> · <mastery label>
<plain-language skill question>

Следующее доказательство
<exact nextEvidence text>
```

Keep `X/Y lessons` and percent only in muted metadata.

- [ ] **Step 3: Add compact seven-skill map**

Render all skills with labels from `derive()` and accessible text:

```html
<li data-skill="value"><strong>Ценность</strong><span>Применил</span></li>
```

No progress bar pretending levels are continuous percentages.

- [ ] **Step 4: Remove obsolete mastery wording conflicts**

Ensure returning-home no longer contains old `Mastery · M01`, `Навыки, а не XP`, or other v2 dashboard remnants. Keep notes/Project Map off the primary home surface.

- [ ] **Step 5: Run full test suite**

```bash
node --test tests/*.test.js
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add learning-experience-v2.js learning-experience-v2.css tests/skill-first-v5.test.js tests/learning-experience-v2.test.js
git commit -m "feat: orient home around skills and evidence"
```

---

### Task 6: Production verification and merge

**Files:**
- Review only; no planned product-code changes unless verification reveals a defect.

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: merged PR and exact production evidence.

- [ ] **Step 1: Run syntax checks**

```bash
find . -maxdepth 1 -type f -name '*.js' -print0 | sort -z | while IFS= read -r -d '' file; do node --check "$file"; done
```

Expected: zero syntax errors.

- [ ] **Step 2: Run full suite**

```bash
node --test tests/*.test.js
```

Expected: zero failures.

- [ ] **Step 3: Review diff against compatibility boundaries**

Confirm `m01-simulator-domain.js`, M01 decision effects, treatment ID/version, and validation gate were not changed.

- [ ] **Step 4: Open PR**

PR title:

```text
feat: make PMO01 progression skill-first
```

PR body must state:
- M02 is the pilot upgraded module;
- mastery is derived from evidence rather than XP;
- M03–M10 are intentionally unchanged;
- exact test count/results;
- M01 compatibility boundaries.

- [ ] **Step 5: Require green PR-context CI on exact head SHA**

Do not merge from branch-only CI. Verify PR mergeability and successful `Prototype CI` for exact PR head.

- [ ] **Step 6: Merge with expected head SHA**

Use exact-head merge protection.

- [ ] **Step 7: Verify production main and Pages**

Confirm:
- `main` points to merge SHA;
- production `Prototype CI` succeeds on merge SHA;
- GitHub Pages deployment succeeds on the same merge SHA.

- [ ] **Step 8: Report limits honestly**

If no rendered-browser screenshot pass is available, explicitly state that automated/runtime/CI/Pages verification passed but fresh visual browser QA was not performed.
