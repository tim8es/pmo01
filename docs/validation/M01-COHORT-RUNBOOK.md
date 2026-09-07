# M01 Cohort Runbook — first 5 learner sessions

## Purpose

Run the first five real M01 learner-validation sessions consistently enough to make one product decision: **Promote / Revise / Reject**.

This is an operational product gate for a small exploratory cohort, not a statistical effectiveness claim.

Published learner experience under test:

- course: `https://tim8es.github.io/pmo01/?v=e2bb179a`
- validation route: `https://tim8es.github.io/pmo01/?v=e2bb179a#/validation/m01`

Do not activate M02 during this cohort.

## Cohort plan

Run the same core sequence for participant IDs `P01` … `P05`.

Eligible participant: someone who regularly reasons about delivery/project work, such as PM, Delivery/Process Manager, Team Lead with delivery ownership, or comparable product/operations role.

Do not count the course author or synthetic/AI sessions.

Plan roughly 100–130 minutes per completed session. Time is an operating estimate, not a validity criterion. A session is valid only if the required evidence below is complete.

| Session | Participant | Status | Valid / excluded | Reason if excluded |
|---|---|---|---|---|
| P01 | | planned | | |
| P02 | | planned | | |
| P03 | | planned | | |
| P04 | | planned | | |
| P05 | | planned | | |

If a session is excluded, document why and run an additional participant so the final review still contains at least five valid sessions.

---

## Exact session script

### 0. Setup — 2 minutes

1. Open the validation route.
2. Reset M01 validation data or use a fresh browser profile.
3. Confirm that no previous baseline result is visible.
4. Tell the participant:

> Проходи задания так, как решал бы реальную рабочую ситуацию. Я не буду подсказывать правильный ответ. Если формулировка или интерфейс мешают — говори вслух, что именно непонятно.

Do not explain the seven-flow model or diagnostic technique before baseline.

### 1. Baseline — 10–15 minutes

Participant reads **«Релиз снова сдвинулся»** and, without coaching:

1. writes the free-text diagnosis;
2. answers all five rubric questions;
3. submits baseline.

Baseline dimensions, each `0..3`:

- mechanism;
- evidence;
- trade-offs;
- intervention;
- change condition.

Required evidence:

- baseline total `0..15`;
- five dimension scores;
- one-sentence summary of the participant's diagnosis;
- whether they mainly reasoned from people/symptoms or from a repeatable mechanism;
- any wording/UI ambiguity.

**Blinding rule:** do not reveal baseline score or option feedback before post-case submission.

### 2. M01 learning experience — about 80 minutes

Participant completes, in order:

1. `project-system` Learning Lab;
2. its decision drill;
3. workbook/transfer fields required by the lesson;
4. `system-diagnostic` Learning Lab;
5. its decision drill;
6. workbook/transfer fields required by the lesson.

Facilitator does not teach the answer. Record only observed friction and reasoning changes.

For each decision drill capture:

- first choice;
- short reason for the choice;
- whether feedback changed the reasoning: `yes / no / unclear`;
- whether the drill exposed a misconception: `yes / no / unclear`;
- usefulness: `useful / partial / weak`.

### 3. Post-case — 10–15 minutes

Participant completes **«Интеграция к запуску партнера»** without baseline feedback having been shown beforehand.

Required evidence:

- post total `0..15`;
- five dimension scores;
- total delta `post - baseline`;
- number of improved dimensions;
- free-text diagnosis summary;
- whether free-text reasoning supports the scored result.

Individual positive prototype signal is unchanged:

```text
post >= baseline + 3
AND
at least 2 rubric dimensions improved
```

This is a development signal, not mastery.

### 4. Real-project transfer — 10–15 minutes

Participant uses a current or recent real project and records:

1. visible symptom;
2. repeatable mechanism/system condition;
3. one minimal intervention;
4. one early observable signal;
5. observed evidence, or explicitly `not tested yet`;
6. next decision that follows from the evidence.

Classify transfer:

- **credible** — mechanism is not merely a person/symptom; intervention acts on that mechanism; early signal is observable; next decision follows from evidence;
- **partial** — chain is directionally useful but one important link is weak/missing;
- **restatement only** — course language is repeated without a defensible real-project causal chain;
- **not completed**.

Do not require confidential names, customer data, credentials, commercial terms, or sensitive metrics.

### 5. Reflection + interview — 8–10 minutes

Ask exactly these five questions:

1. Что ты сначала считал главной проблемой?
2. Что изменилось в диагнозе после M01?
3. Какая часть M01 реально изменила ход мысли?
4. Где формулировка, feedback или интерфейс мешали или казались неубедительными?
5. Где ты сможешь применить это завтра без открытия курса?

Capture paraphrased answers. A verbatim quote is optional.

### 6. Facilitator closeout — 3 minutes

Mark:

- response/state loss: `yes / no`;
- route/navigation confusion: `yes / no`;
- blocking readability/interaction issue: `yes / no`;
- rubric ambiguity that could change score: `yes / no`;
- session: `valid / exclude`.

Exclude only when evidence is materially contaminated, for example:

- baseline was not blind/fresh;
- required baseline or post-case evidence is missing;
- facilitator coached the answer materially;
- a reliability/UI failure prevented completion or corrupted answers.

Ordinary disagreement with the course, low score, or weak transfer is **not** a reason to exclude.

---

## Minimal evidence form — copy once per participant

```text
Participant ID: P0_
Role / experience:
Date:
Valid / excluded:
Exclusion reason (if any):

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

DRILL 1 — project-system
First choice:
Reason:
Feedback changed reasoning: yes / no / unclear
Misconception exposed: yes / no / unclear
Useful: useful / partial / weak

DRILL 2 — system-diagnostic
First choice:
Reason:
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
Mechanism credible: yes / partial / no
Intervention acts on mechanism: yes / partial / no
Early signal observable: yes / partial / no
Next decision follows from evidence: yes / partial / no
Overall transfer: credible / partial / restatement only / not completed

UX / RELIABILITY
State loss: yes / no
Route/navigation confusion: yes / no
Blocking readability/interaction issue: yes / no
Rubric ambiguity could affect score: yes / no
Main friction:

INTERVIEW
What changed in diagnosis:
What caused the change:
What felt weak/misleading:
Where they can apply it tomorrow:

SESSION SUMMARY
Learning signal: positive / mixed / absent / uninterpretable
Transfer: credible / partial / absent
Interaction usefulness: strong / mixed / weak
Major friction: none / manageable / blocking
Recommended action: keep / revise / investigate
```

The longer `M01-SESSION-RECORD-TEMPLATE.md` remains available when a session needs richer notes. This minimal form is the required first-cohort evidence set.

---

## Cohort decision after 5 valid sessions

First calculate:

- number of positive individual signals;
- number of credible transfers;
- for each drill, number of sessions where it was `useful` or `partial` and why;
- number of sessions with blocking UX/reliability problems;
- number of sessions where rubric ambiguity could plausibly affect the result;
- repeated content/wording problems appearing in at least two valid sessions.

### PROMOTE to Phase 2

Choose **Promote** only if all are true:

1. at least 5 valid completed sessions;
2. at least **3 of 5** show the positive individual signal (`+3` and ≥2 improved dimensions);
3. at least **3 of 5** produce **credible** real-project transfer;
4. qualitative free-text/interview evidence does not materially contradict the score improvement;
5. no unresolved blocking reliability/UX defect materially distorted more than one valid session;
6. no repeated rubric ambiguity plausibly explains the observed gains;
7. no unresolved learner-driven content-model exception blocks representing the validated M01 contract.

A drill may be revised later; one weak drill alone does not block Promote if the module-level reasoning and transfer gates pass and the weak interaction is clearly identified.

### REVISE and retest

Choose **Revise** when the mechanism remains plausible but any of these is true:

- only **2 of 5** show the positive individual signal;
- transfer is mostly partial rather than credible;
- the same wording/content/interaction problem appears in at least **2 valid sessions** and could affect reasoning or measurement;
- a rubric item creates plausible false-positive/false-negative results in at least **2 valid sessions**;
- reliability/usability interferes with otherwise interpretable learning evidence;
- qualitative reasoning improves but the current scored instrument fails to capture it consistently.

Record the smallest specific revision and run a new cohort or targeted retest before Phase 2.

### REJECT mechanism

Choose **Reject** only when the sessions are valid enough to interpret and both are true:

1. **0–1 of 5** show the positive individual signal; and
2. **0–1 of 5** show credible real-project transfer;

and there is no blocking measurement/usability defect that could reasonably explain the failure.

Also consider Reject for a specific interaction when it repeatedly adds effort without exposing misconceptions, changing reasoning, or contributing to transfer. Rejecting one interaction does not automatically mean rejecting the whole M01 module.

### Borderline/conflicting cohort

If evidence does not fit the rules cleanly — for example 3/5 score signals but only 1/5 credible transfer — choose **Revise and retest**, not Promote.

When quantitative and qualitative evidence conflict materially, choose **Revise and retest** and document the conflict.

---

## Five-session cohort summary

| ID | Baseline | Post | Delta | Improved dims | Positive signal | Transfer | Drill 1 | Drill 2 | Blocking friction |
|---|---:|---:|---:|---:|---|---|---|---|---|
| P01 | | | | | | | | | |
| P02 | | | | | | | | | |
| P03 | | | | | | | | | |
| P04 | | | | | | | | | |
| P05 | | | | | | | | | |

Final decision:

```text
PROMOTE / REVISE / REJECT

Why:

Evidence:

Required next action:
```

Then complete the existing `M01-COHORT-REVIEW-TEMPLATE.md` for the durable Phase 1 decision record and update Issue #4.
