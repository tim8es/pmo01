# M01 Simulator Cohort Runbook — P01–P05

## Purpose

Run the first five real learner-validation sessions against the published M01 simulator treatment and make exactly one Phase 1 decision: **PROMOTE / REVISE / REJECT**.

This is an exploratory product/learning gate, not a statistical effectiveness claim.

## Production treatment under test

- Course: `https://tim8es.github.io/pmo01/`
- Validation route: `https://tim8es.github.io/pmo01/#/validation/m01`
- Simulator route: `https://tim8es.github.io/pmo01/#/mission/m01`
- Runtime baseline main SHA: `ef575928e6155b63376c90e10b932673ffae874c`
- Simulator treatment ID: `m01-mission-partner-launch-v1`
- Mission version: `1`
- Simulator asset blob at the runtime baseline: `867cd0d96bfdfbe293d2dc3c6269b1b2c402b1de`

The runtime-baseline SHA is the learner-facing production state validated before this operator-pack update. Documentation-only commits do not define a new learning treatment. If learner-facing runtime changes before P01, update this pin before collecting evidence.

Do not activate M02 or change telemetry during the cohort. Do not mix another M01 treatment into the same P01–P05 cohort.

## Cohort eligibility

Use participant IDs `P01` … `P05` for valid sessions. Eligible participants regularly reason about real delivery/project work, for example PM, Delivery/Process Manager, Team Lead with delivery ownership, or comparable product/operations roles.

Do not count:

- the course author;
- synthetic/AI sessions;
- materially coached sessions;
- sessions where a reliability/UI failure corrupts required evidence.

If a session is excluded, record the reason and recruit a replacement so the final cohort still contains at least five valid sessions.

## Exact session sequence

### 0. Clean start

For every new participant use a fresh browser context where all three PMO01 keys are absent:

- `pm01-validation-m01-v1`
- `pm01-state-v1`
- `pm01-sim-m01-v1`

Use a fresh browser profile/private session or clear all PMO01 site data. A validation-only reset is not sufficient for a different participant.

Before starting:

1. open the validation route;
2. confirm no previous baseline result is visible;
3. confirm no completed simulator trajectory is visible;
4. do not expose the M01 simulator before baseline submission.

Facilitator instruction:

> Проходи задания так, как решал бы реальную рабочую ситуацию. Я не буду подсказывать правильный ответ. Если формулировка, последствия или интерфейс мешают — говори, что именно непонятно.

### 1. Blind baseline

Without coaching, the participant:

1. writes the free-text diagnosis;
2. answers all five rubric questions;
3. submits baseline.

Capture the five `0..3` dimensions:

- mechanism;
- evidence;
- trade-offs;
- intervention;
- change condition.

Capture baseline total `0..15`, diagnosis summary, observed reasoning pattern, and any wording/UI ambiguity.

**Blinding rule:** baseline score and explanatory option feedback remain hidden until the post-case is submitted.

### 2. M01 simulator

Open `#/mission/m01` and complete the pinned treatment `m01-mission-partner-launch-v1` version `1` through the final trajectory review.

The mission contains exactly four decisions:

- `d1` diagnose — required rationale, minimum 8 trimmed characters;
- `d2` intervene;
- `d3` trade-off;
- `d4` revise — required rationale, minimum 8 trimmed characters.

For every decision capture:

- first committed option ID/label;
- state before and after: deadline confidence / stakeholder trust / team capacity / launch risk;
- consequence shown;
- whether an optional tool was opened before the decision.

Also capture:

- D1 rationale;
- D4 rationale and whether new evidence caused diagnosis revision;
- optional tools opened: Decision Timeline / Hypothesis Comparator / Change Condition;
- final trajectory state;
- route/readability/interaction friction.

A poor trajectory is still valid evidence. Do not coach toward a preferred option and do not treat the meters as a hidden score.

The simulator is complete only when all four decisions are committed and final trajectory review is reached. Validation post-case must remain locked until this evidence gate is complete.

### 3. Integrative post-case

Return to `#/validation/m01` and complete the post-case while the baseline explanation remains blind until submission.

Capture:

- post total `0..15`;
- all five dimension scores;
- delta `post - baseline`;
- improved dimensions count;
- post free-text diagnosis summary;
- whether free text supports the scored result.

Individual positive prototype signal:

```text
post >= baseline + 3
AND
at least 2 rubric dimensions improved
```

This is a development signal, not mastery.

### 4. Real-project transfer

Use a current or recent real project. Capture:

1. primary hypothesis / mechanism;
2. strong alternative hypothesis;
3. discriminating evidence;
4. falsifier — a fact that would weaken or overturn the primary diagnosis;
5. decision / minimal intervention;
6. early signal;
7. explicit revision/stop/reverse condition;
8. observed evidence or `not tested yet`;
9. next decision.

Classify transfer:

- **credible** — mechanism is more than symptom/person blame; alternative is plausible; discriminating evidence/falsifier are observable; intervention follows the mechanism; early signal and revision condition are explicit;
- **partial** — useful direction but one important link is weak/missing;
- **restatement only** — course/simulator language is repeated without a defensible real-project chain;
- **not completed**.

Do not store confidential names, credentials, commercial terms, or sensitive metrics when anonymized descriptions are sufficient.

### 5. Reflection + short interview

Ask the same questions in every session:

1. Что ты сначала считал главной проблемой?
2. Что изменилось в диагнозе после симулятора?
3. Какое решение или последствие сильнее всего изменило ход мысли?
4. Какую сильную альтернативную гипотезу ты теперь видишь?
5. Какой факт мог бы опровергнуть твой итоговый диагноз?
6. При каких данных ты пересмотришь принятое решение?
7. Где последствия, формулировки или интерфейс мешали или казались неубедительными?
8. Где ты сможешь применить этот способ мышления завтра без открытия PMO01?

Capture concise paraphrases; verbatim quotes are optional.

### 6. Facilitator closeout and validity

Record:

- response/state loss: yes / no;
- route/navigation confusion: yes / no;
- blocking readability/interaction issue: yes / no;
- rubric ambiguity could affect score: yes / no;
- baseline contamination: yes / no;
- participant materially coached: yes / no;
- required baseline/post/simulator evidence complete: yes / no;
- session: valid / exclude.

Exclude only for material contamination or corrupted evidence, for example:

- baseline was not fresh/blind;
- required baseline/post/simulator evidence is missing;
- facilitator materially coached the answer;
- reliability/UI failure prevented completion or corrupted answers.

Low score, disagreement with the content, an apparently weak decision, or weak transfer are **not** exclusion reasons.

## Minimum per-session record

Use `M01-SESSION-RECORD-TEMPLATE.md`. At minimum retain:

- anonymized participant ID, role/experience, date;
- clean-start and validity status;
- baseline/post five dimensions, totals, delta, improved dimensions, individual signal;
- D1–D4 committed choices;
- D1 and D4 rationales;
- tools opened and final project-state trajectory;
- whether D4 evidence caused diagnosis revision;
- transfer chain and classification;
- interview/reflection notes;
- UX/reliability/rubric ambiguity;
- exclusion reason if invalid.

## Cohort decision after five valid sessions

Calculate:

- positive individual signals;
- credible transfers;
- simulator decision/revision patterns;
- optional-tool usefulness;
- blocking UX/reliability problems;
- rubric ambiguities that could explain score movement;
- repeated content problems in at least two valid sessions;
- repeated failures to form a plausible alternative, falsifier, or revision condition.

### PROMOTE

Choose **PROMOTE** only if all are true:

1. at least 5 valid completed sessions;
2. at least **3/5** show the positive individual signal;
3. at least **3/5** produce **credible** real-project transfer;
4. qualitative free-text/interview evidence does not materially contradict score improvement;
5. no unresolved blocking reliability/UX defect materially distorts more than one valid session;
6. no repeated rubric ambiguity plausibly explains observed gains;
7. no unresolved learner-driven content-model exception blocks preserving the validated simulator contract.

### REVISE

Choose **REVISE** when the mechanism remains plausible but evidence is mixed, including when:

- only **2/5** show the positive individual signal;
- transfer is mostly partial;
- alternatives/falsifiers/revision conditions repeatedly become form-filling;
- the same wording/content/interaction problem appears in at least **2 valid sessions** and could affect reasoning or measurement;
- rubric ambiguity creates plausible false positives/negatives in at least **2 valid sessions**;
- reliability/usability interferes with otherwise interpretable evidence;
- quantitative and qualitative evidence conflict materially.

### REJECT

Choose **REJECT** only when sessions are valid enough to interpret, no blocking measurement/usability defect reasonably explains failure, and both are true:

1. **0–1/5** show the positive individual signal;
2. **0–1/5** show credible real-project transfer.

Borderline or conflicting evidence defaults to **REVISE**, not PROMOTE.

Record exactly one final decision in `M01-COHORT-REVIEW-TEMPLATE.md`.

Do not start Phase 2 contract freeze/framework selection unless the recorded decision is **PROMOTE**.
