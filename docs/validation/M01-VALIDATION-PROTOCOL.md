# M01.1 Learning Validation Protocol

## Purpose

This protocol tests the published M01.1 learning slice end-to-end before any scalable v1 implementation.

Primary question:

> After M01.1, can a learner diagnose a structurally similar project problem and choose a stronger intervention with better reasoning than before?

The experiment is exploratory. Its thresholds are operational product rules, not a statistically generalizable effectiveness claim.

## What is being validated

M01.1 keeps five scored reasoning dimensions:

1. **Mechanism** — separates a visible symptom from a reproducible system mechanism.
2. **Evidence** — chooses observable evidence rather than opinions or vanity metrics.
3. **Trade-offs** — makes costs and alternative explanations explicit.
4. **Intervention** — acts on the diagnosed mechanism rather than compensating for a symptom.
5. **Change condition** — defines an early signal that can confirm or invalidate the intervention.

Baseline and post-case each use one scored item per dimension, `0..3`, total `0..15`.

M01.1 additionally teaches a non-scored transfer discipline that must be reviewed qualitatively:

`primary hypothesis ↔ strong alternative → discriminating evidence → falsifier → decision → early signal → revision condition`

## Individual learning signal

A session has a **positive prototype learning signal** only when both are true:

- post-case total is at least `baseline + 3`;
- at least two dimensions improve.

This is not `mastery`. Immediate post-case performance must not produce a mastered state.

## Participant profile

Use real people who regularly reason about delivery/project work: PM, Delivery/Process Manager, Team Lead with delivery ownership, or comparable product/operations roles.

Record experience level. Require at least **5 valid completed sessions** before a module-level decision. Do not use the course author or synthetic/AI sessions as effectiveness evidence.

## Environment and clean start

Experiment data key:

`pm01-validation-m01-v1`

Main-course state key:

`pm01-state-v1`

For **each new participant**, start from a fresh browser context where both keys are absent. Use a fresh profile/private context or clear all PMO01 site data.

Do not prepare another participant by pressing only **Сбросить M01 validation data** because it preserves course progress and can contaminate the learning sequence.

Before baseline:

1. open `#/validation/m01`;
2. verify no prior baseline result is visible;
3. verify M01 is not already completed;
4. do not expose M01 content before baseline submission.

## Blinding rule

Baseline answers and score may be stored, but baseline score and explanatory feedback must stay hidden until post-case submission.

After post-case, the prototype may reveal baseline/post totals, dimension changes, option feedback, and the prototype signal.

## Session sequence

### 1. Baseline

Required evidence:

- free-text diagnosis;
- five rubric answers;
- frozen score;
- observed reasoning pattern;
- wording/UI ambiguity.

Do not coach toward the system model.

### 2. M01.1 learning experience

Participant completes:

- `project-system` Learning Lab;
- `m01-drill-system` cold drill;
- `m01-exit-system`;
- six required workbook fields;
- `system-diagnostic` Learning Lab;
- `m01-drill-diagnostic` cold drill;
- `m01-exit-diagnostic`;
- six required workbook fields.

Each cold drill records the first choice and becomes read-only after feedback. The validation route must not repeat these drills.

Observe for each drill:

- first choice and rationale;
- whether a credible near-miss was chosen or seriously considered;
- whether feedback exposed a misconception;
- whether feedback changed reasoning;
- whether the interaction added useful discrimination rather than clicks.

### 3. Integrative post-case

Required evidence:

- free-text diagnosis;
- five answers;
- post score;
- total delta;
- per-dimension changes;
- individual signal;
- whether qualitative reasoning supports the scored result.

A higher total alone is insufficient if improvement is concentrated in one dimension or contradicted by free text.

### 4. M01.1 real-project transfer

Use a current or recent real project and capture:

- **Primary hypothesis / mechanism**;
- **Strong alternative hypothesis**;
- **Discriminating evidence** that could separate them;
- **Falsifier / факт-опровержение** that would weaken or overturn the primary diagnosis;
- **Decision / minimal intervention**;
- **Early observable signal**;
- **Revision condition** — evidence under which the learner would revise, stop, change or reverse the decision;
- observed evidence, or `not tested yet`;
- next decision that follows from evidence.

A field application is **credible** only when the alternative is genuinely plausible, discriminating/falsifying evidence is observable, the intervention acts on the selected mechanism, and the revision condition is explicit. Repeating course terminology or merely filling fields is not transfer.

### 5. Reflection and interview

Capture:

- what changed in diagnosis/action;
- what alternative was considered;
- what could falsify the diagnosis;
- what evidence would cause a decision revision;
- what evidence the learner would now request earlier;
- where content, feedback or UI interfered with reasoning.

### 6. Optional delayed check

When practical, use a new structurally similar case after a delay. Record whether the learner independently reconstructs the mechanism, generates an alternative hypothesis, states a falsifier/revision condition, and transfers to a different domain without course vocabulary prompts.

## Minimum evidence packet

For each valid participant retain only what is needed for the Phase 1 decision:

- anonymized participant ID and role/experience;
- baseline/post totals, delta and improved dimensions;
- baseline/post diagnosis summaries;
- first choice and near-miss/feedback observations for both cold drills;
- primary hypothesis, strong alternative, discriminating evidence and falsifier;
- intervention, early signal and revision condition;
- transfer classification: credible / partial / restatement only / not completed;
- major UX/reliability/content/rubric ambiguity;
- delayed-transfer evidence when available.

Do not add telemetry or new product instrumentation for this cohort. Use manual session records.

## Exclusion rules

Exclude only when evidence is materially contaminated, for example:

- baseline was not fresh/blind;
- required baseline or post-case evidence is missing;
- facilitator materially coached the answer;
- reliability/UI failure prevented completion or corrupted answers.

Low score, disagreement, choosing a near-miss, or weak transfer are not exclusion reasons.

## Module-level decision

After at least five valid sessions review:

1. **Learning signal** — individual `+3 / ≥2 dimensions` and direction across the cohort.
2. **Transfer** — defensible `hypothesis ↔ alternative → evidence/falsifier → intervention → signal → revision` reasoning on real projects.
3. **Interaction usefulness** — drills expose misconceptions/change reasoning/contribute to transfer.
4. **Friction and reliability** — no evidence-distorting state loss, contamination, accessibility or wording defect.
5. **Content-model fit** — no unresolved one-off requirement blocking migration.

### PROMOTE

Use only when at least five valid sessions exist, at least **3/5** show the positive individual signal, at least **3/5** show credible real-project transfer, qualitative evidence does not contradict the scores, and no unresolved measurement/UX/content-model issue plausibly explains the gains.

### REVISE and retest

Use when the mechanism remains plausible but evidence is mixed, transfer is mostly partial, alternative/falsifier work becomes form-filling, the same wording/rubric/interaction issue appears in at least two valid sessions, or quantitative and qualitative evidence conflict.

### REJECT mechanism

Use only when the sessions are interpretable, **0–1/5** show the positive signal and **0–1/5** show credible transfer, with no measurement/usability defect that reasonably explains failure.

Borderline/conflicting evidence defaults to **REVISE**, not PROMOTE.

Until one explicit outcome is recorded after at least five valid sessions, Phase 2 contract freeze/framework selection remains blocked.
