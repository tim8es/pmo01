# PMO01 Skill-First v5 Design

## Goal

Make PMO01 feel like one coherent practice product where progress means stronger project-management decisions, not merely more completed pages. The first production slice upgrades M02 end-to-end and introduces a reusable mastery/evidence model without rewriting M03–M10 yet.

## Product problem

The current product has three mismatched learning models:

1. M01 uses a strong Learning Lab: cold decision → feedback → worked example → technique → exit check → workbook → transfer.
2. M02–M10 use a guided decision case, then fall back to legacy theory/practice/checklist completion.
3. Course progress is primarily lesson completion percentage, so it does not tell the learner which capability improved or what evidence is still missing.

This creates inconsistent UX, weak motivational feedback, and an artificial completion loop. The product already contains good guided cases and reference solutions; the main problem is that they are not wired into one evidence-based progression model.

## Scope

### In scope

- Introduce a reusable mastery domain for the seven project flows.
- Use four learner-facing mastery states: `Не встречал`, `Понял`, `Применил`, `Доказал`.
- Derive mastery from existing local evidence instead of mutable XP counters.
- Upgrade both M02 lessons (`outcome-tree`, `assumption-map`) to the same Learning Lab interaction model as M01.
- Replace M02 legacy checklist completion with required decision + workbook evidence.
- Add concise Russian term explanations and a concrete lesson mission to reduce consulting-density.
- Add a deterministic M02 module challenge that tests both M02 skills together.
- Use the challenge as proof-level evidence for the M02 competence.
- Make the returning-home experience skill-oriented: current mission, current skill, next evidence needed, compact seven-skill map.
- Preserve overall course progress as secondary information.
- Keep everything local-only: no network calls, telemetry, accounts, secrets, or LLM runtime.

### Out of scope

- Rewriting M03–M10 into Learning Labs in this PR.
- XP, coins, streaks, leaderboards, loot, daily quests, or social ranking.
- New backend or analytics.
- Changing M01 cohort treatment, simulator IDs, decision effects, validation gates, or storage compatibility.
- Replacing all legacy UX/CSS layers in one release.

## Learning model

Every upgraded lesson follows one canonical loop:

1. **Mission** — one concrete capability and why it matters.
2. **Cold decision** — commit to a first move before explanation.
3. **Feedback** — immediate mechanism-level explanation.
4. **Worked example** — inspect a strong reasoning path.
5. **Technique** — reusable decision procedure, not just theory.
6. **Exit decision** — a second attempt on a changed situation.
7. **Evidence artifact** — structured workbook with required fields.
8. **Transfer** — apply the model to a real or supplied project context.

The learner completes a lesson only after required decision evidence and required workbook fields exist.

## Mastery model

### Competencies

The seven existing project flows become the competence map:

- `value` — Ценность
- `work` — Работа
- `information` — Информация
- `decisions` — Решения
- `dependencies` — Зависимости
- `uncertainty` — Неопределённость
- `feedback` — Обратная связь

### Levels

- **0 · Не встречал** — no qualifying evidence.
- **1 · Понял** — at least one required decision in a mapped Learning Lab has been answered.
- **2 · Применил** — a mapped Learning Lab is complete with required workbook evidence.
- **3 · Доказал** — a mapped module challenge is completed with the required strong decisions/evidence.

Levels are derived from local state on every render. There is no mutable XP balance.

### Evidence mapping for this slice

- M01 learning labs contribute understanding/application evidence to `work`, `decisions`, and `dependencies` where relevant, but this PR does not retroactively award proof from the M01 simulator.
- M02 `outcome-tree` contributes to `value`.
- M02 `assumption-map` contributes to `uncertainty`.
- The M02 module challenge can promote both `value` and `uncertainty` to `Доказал` when the learner completes the challenge and selects the strong move in both decision moments.
- M03–M10 remain visible as future skills but do not receive invented mastery evidence.

## M02 lesson content

### M02.1 Outcome до output

**Mission:** learn to reconstruct the causal chain between team output and observable business/user outcome before committing more delivery capacity.

**Terms:**
- `Output` — what the team directly ships.
- `Outcome` — observable change in user/business behavior or state.
- `Causal link` — the assumption that one change causes the next.
- `Evidence` — an observation strong enough to change confidence or a decision.

**Workbook:** outcome, target behavior, causal chain, weakest link, evidence, next decision.

### M02.2 Карта допущений

**Mission:** identify which assumption deserves evidence first by combining uncertainty, cost of error, and time to irreversibility.

**Terms:**
- `Assumption` — something the plan depends on but has not yet proved.
- `Confidence` — current strength of evidence, not optimism.
- `Cost of error` — damage if the assumption is false.
- `Irreversibility` — the point after which changing direction becomes materially more expensive.

**Workbook:** decision at risk, assumptions, confidence, cost of error, evidence test, kill/redirect rule.

## M02 module challenge

### Purpose

The challenge is not a third lesson. It is the proof step after both lessons are complete. It asks the learner to combine outcome reasoning and assumption prioritization in one launch scenario.

### Scenario

A B2B product team is six weeks from launching an AI-assisted reporting feature. The dashboard is nearly complete. Sales has already positioned the launch as a way to reduce manual reporting time, but no one has measured whether target users will change workflow. At the same time, pricing, model-cost limits, and support load remain assumptions.

### Decision 1 — Value chain

The strongest move is to reconstruct `feature → capability → behavior → business effect` and identify the weakest causal link before expanding scope or committing the story externally.

### Decision 2 — Assumption priority

The strongest move is to rank unresolved assumptions by low confidence × cost of error × time to irreversibility, then buy the cheapest evidence for the top assumption before the irreversible commitment.

### Completion and proof

- Challenge completion requires both decisions.
- `value` becomes `Доказал` only when Decision 1 uses the strong option.
- `uncertainty` becomes `Доказал` only when Decision 2 uses the strong option.
- A weak decision still completes the challenge but the skill remains `Применил`; the review explains what evidence is missing for proof.
- The final screen shows `Что доказано`, `Что усилить`, and direct links back to the relevant lesson.

## Home UX

For a returning learner, the first screen should answer four questions in order:

1. **Что делать сейчас?** — current lesson or module challenge with one primary CTA.
2. **Какой навык я тренирую?** — one current competence with plain-language description.
3. **Что нужно для следующего уровня?** — exact missing evidence, e.g. `заверши рабочую карту` or `пройди итоговый challenge сильным решением`.
4. **Как растёт моя система навыков?** — compact seven-skill map with mastery states.

Course percentage and lesson count remain present but visually secondary.

## Gamification principles

- Reward demonstrated competence, not clicks or time-on-site.
- Use progress clarity, immediate feedback, visible mastery, and proof milestones.
- Never award a higher state for opening a page.
- Never use streak pressure or arbitrary points.
- A failed/weak decision must still produce useful feedback and a clear route to improve.
- Reattempts are allowed; the product should frame them as deliberate practice, not punishment.

## Architecture

### `mastery-domain-v5.js`

Pure browser-side domain module. Reads supplied state objects and returns mastery results. It must not access DOM, network, or mutate storage.

Public API:

- `window.PM01MasteryV5.LEVELS`
- `window.PM01MasteryV5.SKILLS`
- `window.PM01MasteryV5.derive({ courseState, challengeState, modules })`
- `window.PM01MasteryV5.nextEvidence(skillId, derived)`

### `m02-learning-lab-data-v5.js`

Attaches `learningLab` data to the two M02 lessons using the existing renderer contract. Includes mission and terms metadata consumed by the renderer.

### `m02-challenge-v5.js`

Owns M02 challenge state under `pm01-m02-challenge-v5`. Renders challenge entry/review when invoked from the course/home surfaces. Deterministic, local-only, two decisions.

Public API:

- `window.PM01M02ChallengeV5.isComplete()`
- `window.PM01M02ChallengeV5.getState()`
- `window.PM01M02ChallengeV5.open()`

### Existing renderer updates

`app.js` extends the existing Learning Lab rendering contract with optional `mission` and `terms` blocks. No separate M02 renderer is introduced.

`learning-experience-v2.js` consumes `PM01MasteryV5` and `PM01M02ChallengeV5` to render current skill / next evidence / compact skill map and to route the learner to the M02 challenge after both M02 lessons are complete.

## Storage

Existing keys remain unchanged. New key:

- `pm01-m02-challenge-v5`

Shape:

```json
{
  "decisions": {
    "value-chain": "option-id",
    "assumption-priority": "option-id"
  },
  "completedAt": "ISO timestamp or null"
}
```

No migration is required because mastery is derived.

## Compatibility

Must remain unchanged:

- `pm01-state-v1`
- `pm01-sim-m01-v1`
- M01 treatment id/version
- M01 decision IDs and effects
- validation/cohort blindness rules
- existing guided cases and reference data for M03–M10
- local-only execution

## Testing

Add regression coverage that proves:

- mastery levels are derived from evidence, not page visits or raw completion flags;
- M02 lessons use `learningLab` and no longer use legacy checklist completion;
- M02 labs include mission, glossary, two required decisions, and required workbook evidence;
- M02 challenge cannot grant proof without the strong decision for that skill;
- returning home shows one current mission, current skill, next evidence, and seven-skill map;
- M01 validation/treatment contracts remain unchanged;
- no network/telemetry is introduced.

## Success criteria

A learner can complete M02 and understand, without reading implementation details:

- what capability they are currently training;
- why the current exercise matters;
- what concrete evidence is required to finish the lesson;
- why their first decision was strong/partial/weak;
- what changed in their mastery state;
- what exact action is needed to reach the next mastery level;
- why the M02 challenge exists and what it proves.
