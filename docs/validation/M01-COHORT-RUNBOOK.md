# M01.1 Cohort Runbook — P01–P05

## Purpose

Run the first five real learner-validation sessions against the published M01.1 experience and make exactly one Phase 1 decision: **PROMOTE / REVISE / REJECT**.

This is an exploratory product/learning gate, not a statistical effectiveness claim.

Published experience under test:

- course: `https://tim8es.github.io/pmo01/`
- validation route: `https://tim8es.github.io/pmo01/#/validation/m01`
- Pages release SHA: `c4f8ac2af6a66efdb79881baa58d4c091a0e6aed`
- M01.1 asset blob: `33b328d3ccc753cc3d0aee15da98bccd6913f92e`

Do not activate M02. Do not change telemetry during this cohort.

## Cohort

Run the same core sequence for participant IDs `P01` … `P05`.

Eligible participants regularly reason about delivery/project work, for example PM, Delivery/Process Manager, Team Lead with delivery ownership, or a comparable product/operations role.

Do not count:

- the course author;
- synthetic/AI sessions;
- sessions materially coached by the facilitator.

If a session is excluded, record the reason and recruit another participant so the final review still has at least five valid sessions.

| ID | Role / experience | Status | Valid / excluded | Exclusion reason |
|---|---|---|---|---|
| P01 | | planned | | |
| P02 | | planned | | |
| P03 | | planned | | |
| P04 | | planned | | |
| P05 | | planned | | |

## Exact session sequence

### 0. Clean start

For every new participant use a fresh browser context where both PMO01 storage keys are absent:

- `pm01-validation-m01-v1`
- `pm01-state-v1`

Use a fresh browser profile/private session or clear all PMO01 site data before opening the validation route.

Do **not** prepare a new participant by pressing only **Сбросить M01 validation data**. That preserves main-course progress and can contaminate the next learner.

Before starting:

1. open the validation route;
2. confirm no previous baseline result is visible;
3. confirm M01 is not already completed;
4. do not expose M01 lesson content before baseline submission.

Facilitator script:

> Проходи задания так, как решал бы реальную рабочую ситуацию. Я не буду подсказывать правильный ответ. Если формулировка, feedback или интерфейс мешают — говори, что именно непонятно.

### 1. Baseline

Without coaching, participant:

1. writes the free-text diagnosis;
2. answers all five rubric questions;
3. submits baseline.

Five dimensions, each `0..3`:

- mechanism;
- evidence;
- trade-offs;
- intervention;
- change condition.

Capture:

- baseline total `0..15`;
- all five dimension scores;
- one-sentence diagnosis summary;
- observed reasoning pattern: `people/symptom / mixed / mechanism`;
- wording/UI ambiguity.

**Blinding rule:** baseline score and explanatory option feedback remain hidden until post-case submission.

### 2. M01.1 learning experience

Participant completes in order:

1. `project-system` Learning Lab;
2. `m01-drill-system` cold choice — first choice is frozen after feedback;
3. `m01-exit-system`;
4. six required workbook fields;
5. `system-diagnostic` Learning Lab;
6. `m01-drill-diagnostic` cold choice — first choice is frozen after feedback;
7. `m01-exit-diagnostic`;
8. six required workbook fields.

The validation route must not repeat the cold drills. After both lessons satisfy evidence-aware completion, return to validation and continue to post-case.

For each cold drill capture:

- first choice;
- short reason;
- whether the learner chose or seriously considered a credible near-miss;
- feedback changed reasoning: `yes / no / unclear`;
- misconception exposed: `yes / no / unclear`;
- usefulness: `useful / partial / weak`.

Do not teach the answer during the drill.

### 3. Post-case

Participant completes the integrative post-case while baseline feedback is still blind.

Capture:

- post total `0..15`;
- all five dimension scores;
- delta `post - baseline`;
- improved dimensions count;
- free-text diagnosis summary;
- whether free text supports the scored result.

Individual positive prototype signal:

```text
post >= baseline + 3
AND
at least 2 rubric dimensions improved
```

This is a development signal, not mastery.

### 4. M01.1 real-project transfer

Use a current or recent real project. Capture the reasoning chain explicitly:

1. **Primary hypothesis / mechanism** — what repeatable mechanism best explains the facts?
2. **Strong alternative** — what other plausible explanation fits the same facts?
3. **Discriminating evidence** — what observation would distinguish the two?
4. **Falsifier / факт-опровержение** — what concrete fact would weaken or overturn the primary diagnosis?
5. **Decision / minimal intervention** — what will the learner actually do?
6. **Early signal** — what should change first if the diagnosis is right?
7. **Revision condition** — at what evidence will the learner revise, stop, or reverse the decision?
8. **Observed evidence** — actual observation, or `not tested yet`.
9. **Next decision** — what follows from the evidence?

Transfer classification:

- **credible** — primary mechanism is not merely a person/symptom; a strong alternative is genuinely plausible; discriminating evidence/falsifier are observable; intervention acts on the chosen mechanism; early signal is observable; revision condition is explicit;
- **partial** — direction is useful but one important link is weak/missing;
- **restatement only** — course language is repeated without a defensible real-project reasoning chain;
- **not completed**.

Do not require or store confidential names, credentials, commercial terms or sensitive metrics.

### 5. Reflection + interview

Ask consistently:

1. Что ты сначала считал главной проблемой?
2. Что изменилось в диагнозе после M01.1?
3. Какая часть изменила ход мысли?
4. Какая альтернативная гипотеза казалась наиболее правдоподобной?
5. Какой факт мог бы опровергнуть твой итоговый диагноз?
6. При каких данных ты пересмотришь принятое решение?
7. Где feedback, формулировка или интерфейс мешали или казались неубедительными?
8. Где ты сможешь применить это завтра без открытия курса?

Capture paraphrases; verbatim quotes are optional.

### 6. Facilitator closeout

Record:

- response/state loss: `yes / no`;
- route/navigation confusion: `yes / no`;
- blocking readability/interaction issue: `yes / no`;
- rubric ambiguity could affect score: `yes / no`;
- baseline contamination: `yes / no`;
- session: `valid / exclude`.

Exclude only when evidence is materially contaminated, for example:

- baseline was not blind/fresh;
- required baseline/post-case evidence is missing;
- facilitator materially coached the answer;
- reliability/UI failure prevented completion or corrupted answers.

Low score, disagreement with the course, choosing a near-miss, or weak transfer are **not** exclusion reasons.

## Minimal evidence form — copy for P01–P05

```text
Participant ID: P0_
Role / experience:
Date:
Valid / excluded:
Exclusion reason:

BASELINE
Total /15:
Mechanism /3:
Evidence /3:
Trade-offs /3:
Intervention /3:
Change condition /3:
Diagnosis summary:
Observed pattern: people/symptom / mixed / mechanism
Ambiguity/friction:

DRILL 1 — m01-drill-system
First choice:
Reason:
Near-miss chosen/seriously considered: yes / no / unclear
Feedback changed reasoning: yes / no / unclear
Misconception exposed: yes / no / unclear
Useful: useful / partial / weak

DRILL 2 — m01-drill-diagnostic
First choice:
Reason:
Near-miss chosen/seriously considered: yes / no / unclear
Feedback changed reasoning: yes / no / unclear
Misconception exposed: yes / no / unclear
Useful: useful / partial / weak

POST-CASE
Total /15:
Mechanism /3:
Evidence /3:
Trade-offs /3:
Intervention /3:
Change condition /3:
Delta:
Improved dimensions count:
Individual signal: positive / absent
Diagnosis summary:
Free text supports score: yes / partial / no

TRANSFER
Primary hypothesis/mechanism:
Strong alternative:
Discriminating evidence:
Falsifier / факт-опровержение:
Decision / minimal intervention:
Early signal:
Revision condition:
Observed evidence / not tested yet:
Next decision:
Overall transfer: credible / partial / restatement only / not completed

UX / RELIABILITY
State loss: yes / no
Route/navigation confusion: yes / no
Blocking readability/interaction issue: yes / no
Rubric ambiguity could affect score: yes / no
Baseline contamination: yes / no
Main friction:

SESSION SUMMARY
Learning signal: positive / mixed / absent / uninterpretable
Transfer: credible / partial / absent
Interaction usefulness: strong / mixed / weak
Major friction: none / manageable / blocking
Recommended action: keep / revise / investigate
```

Use `M01-SESSION-RECORD-TEMPLATE.md` for richer notes.

## Cohort decision after five valid sessions

Calculate:

- positive individual signals;
- credible transfers;
- drill usefulness/near-miss behavior;
- blocking UX/reliability problems;
- rubric ambiguities that could affect results;
- repeated content problems in at least two valid sessions;
- repeated failures to generate a plausible alternative or falsifier.

### PROMOTE

Choose **PROMOTE** only if all are true:

1. at least 5 valid completed sessions;
2. at least **3/5** show the positive individual signal;
3. at least **3/5** produce **credible** M01.1 real-project transfer;
4. qualitative free-text/interview evidence does not materially contradict score improvement;
5. no unresolved blocking reliability/UX defect materially distorts more than one valid session;
6. no repeated rubric ambiguity plausibly explains observed gains;
7. no unresolved learner-driven content-model exception blocks preserving the validated M01.1 contract.

### REVISE

Choose **REVISE** when the mechanism is plausible but any of these is true:

- only **2/5** show the positive individual signal;
- transfer is mostly partial;
- strong alternatives/falsifiers repeatedly become form-filling rather than usable reasoning;
- the same wording/content/interaction problem appears in at least **2 valid sessions** and could affect reasoning or measurement;
- rubric ambiguity creates plausible false positives/negatives in at least **2 valid sessions**;
- reliability/usability interferes with otherwise interpretable evidence;
- quantitative and qualitative evidence conflict materially.

### REJECT

Choose **REJECT** only when the sessions are valid enough to interpret and both are true:

1. **0–1/5** show the positive individual signal; and
2. **0–1/5** show credible real-project transfer;

and no blocking measurement/usability defect could reasonably explain the failure.

A specific interaction can be rejected without rejecting the whole module if it repeatedly adds effort without exposing misconceptions, changing reasoning or contributing to transfer.

Borderline or conflicting evidence defaults to **REVISE**, not PROMOTE.

## Final cohort summary

| ID | Baseline | Post | Delta | Improved dims | Signal | Transfer | Alt/falsifier quality | Drill usefulness | Blocking friction |
|---|---:|---:|---:|---:|---|---|---|---|---|
| P01 | | | | | | | | | |
| P02 | | | | | | | | | |
| P03 | | | | | | | | | |
| P04 | | | | | | | | | |
| P05 | | | | | | | | | |

Record exactly one final decision in `M01-COHORT-REVIEW-TEMPLATE.md` and update Issue #4 only after evidence exists.

Do not start Phase 2 contract freeze/framework selection unless the recorded decision is **PROMOTE**.
