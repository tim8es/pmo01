# M01 Learning Validation Protocol

## Purpose

This protocol tests the first PMO01 learning slice end-to-end before any scalable v1 implementation.

Primary question:

> After M01, can a learner diagnose a structurally similar project problem and choose a stronger intervention with better reasoning than before?

The experiment is exploratory. Thresholds below are product-development decision rules, not statistical effectiveness claims.

## What is being validated

M01 uses five reasoning dimensions:

1. **Mechanism** — separates symptom from reproducible system mechanism.
2. **Evidence** — chooses observable evidence rather than opinions or vanity metrics.
3. **Trade-offs** — makes intervention cost and alternative explanations explicit.
4. **Intervention** — acts on the diagnosed mechanism rather than compensating for a symptom.
5. **Change condition** — defines an early signal and condition that can confirm or invalidate the intervention.

Baseline and post-case score one item per dimension `0..3`; total is `0..15`.

## Individual learning signal

A session produces a positive prototype learning signal only when both are true:

- `post >= baseline + 3`;
- at least two rubric dimensions improve.

This is not mastery. Delayed transfer evidence requires separate human review.

## Participant profile

Use people who regularly reason about real delivery/project work, for example:

- Project Manager;
- Delivery Manager;
- Process Manager;
- Team Lead with delivery ownership;
- comparable Product/Operations role coordinating dependencies and decisions.

Do not use the course author, synthetic/AI sessions, or materially coached sessions as evidence. Require at least **5 valid completed sessions** before a cohort-level decision.

## Production treatment

Canonical operator sequence is in `M01-COHORT-RUNBOOK.md`.

Current learner-facing treatment:

- validation: `https://tim8es.github.io/pmo01/#/validation/m01`
- simulator: `https://tim8es.github.io/pmo01/#/mission/m01`
- treatment ID: `m01-mission-partner-launch-v1`
- mission version: `1`

Do not mix legacy M01 Learning Lab treatment with simulator sessions in one cohort.

## Environment and clean start

Three independent `localStorage` keys matter:

- validation: `pm01-validation-m01-v1`
- course shell: `pm01-state-v1`
- simulator: `pm01-sim-m01-v1`

For every new participant, use a fresh browser context where all three are absent. A validation-only reset is not a valid cross-participant reset.

Before baseline:

1. open `#/validation/m01`;
2. verify no previous baseline result is visible;
3. verify no completed simulator trajectory is present;
4. do not expose the simulator before baseline submission.

## Measurement blinding rule

Baseline answers and computed score are persisted/frozen at submission, but the learner must not see baseline score or explanatory option feedback before completing the post-case.

After post-case submission the prototype may reveal baseline/post scores, dimension changes, option feedback, and the individual prototype signal.

## Session sequence

### 1. Blind baseline

Participant reads the baseline scenario without M01 simulator exposure.

Required evidence:

- free-text diagnosis;
- answers to all five rubric questions;
- frozen baseline score;
- baseline score and explanatory feedback hidden until post-case completion.

Observe reasoning pattern, evidence requested, change-condition thinking, and wording ambiguity. Do not coach toward the intended system model.

### 2. M01 simulator treatment

Participant completes `m01-mission-partner-launch-v1` version `1` at `#/mission/m01` through final trajectory review.

The mission contains four committed decisions:

- `d1` diagnose — required rationale, minimum 8 trimmed characters;
- `d2` intervene;
- `d3` trade-off;
- `d4` revise — required rationale, minimum 8 trimmed characters.

Simulator state tracks:

- deadline confidence;
- stakeholder trust;
- team capacity;
- launch risk.

Optional tools are:

- Decision Timeline;
- Hypothesis Comparator;
- Change Condition.

Required evidence:

- first committed option for D1–D4;
- D1 and D4 rationales;
- state-before/state-after trajectory;
- tools opened;
- D4 diagnosis revision behavior;
- final trajectory review reached.

A low-performing or unusual trajectory is valid evidence. Do not coach toward a preferred option or treat meter totals as a hidden score.

Post-case must remain unavailable until the simulator evidence gate is complete.

### 3. Integrative post-case

Post-case uses a different scenario but the same five reasoning dimensions.

Required evidence:

- new free-text diagnosis;
- all five post-case answers;
- post total;
- baseline revealed only now;
- total delta;
- per-dimension delta;
- individual prototype signal.

Do not interpret a higher total alone as success if improvement is concentrated in one dimension or contradicted by free-text reasoning.

### 4. Real-project transfer

Use a current or recent real project. Capture:

1. primary hypothesis / mechanism;
2. strong alternative;
3. discriminating evidence;
4. falsifier;
5. decision / minimal intervention;
6. early signal;
7. revision/stop/reverse condition;
8. observed evidence or `not tested yet`;
9. next decision.

Classify transfer as `credible / partial / restatement only / not completed`.

A filled form is not transfer if intervention/evidence does not follow from the diagnosis.

### 5. Reflection and interview

Capture:

- what changed in diagnosis;
- what changed in first action;
- what evidence would now be obtained earlier;
- whether the learner generated a plausible alternative;
- what fact could overturn the chosen diagnosis;
- when they would revise the decision;
- remaining testable uncertainty.

Use the same short interview in every session; see the runbook and session template.

### 6. Facilitator closeout

Record:

- response/state loss;
- route/navigation confusion;
- blocking readability/interaction issue;
- rubric ambiguity that could affect score;
- baseline contamination;
- material coaching;
- required evidence completeness;
- valid / excluded.

Exclude only when evidence is materially contaminated or corrupted. Low score, disagreement with the module, apparently weak simulator choices, or weak transfer are not exclusion reasons.

## Minimum evidence packet

For each valid participant retain:

- anonymized ID and role/experience;
- baseline/post totals and five dimensions;
- delta and improved-dimension count;
- baseline/post free-text diagnosis summaries;
- D1–D4 committed choices;
- D1/D4 rationales;
- project-state trajectory and tools opened;
- diagnosis-revision behavior at D4;
- transfer chain and classification;
- reflection/interview evidence;
- major UX/reliability/rubric ambiguity;
- exclusion reason when applicable.

Do not add new engineering telemetry for this cohort. Use manual evidence capture with `M01-SESSION-RECORD-TEMPLATE.md`.

## Cohort review

After at least five valid sessions review:

### 1. Learning signal

Count individual `+3 / >=2 dimensions` signals and check whether free-text reasoning supports them.

### 2. Transfer

Determine whether learners can produce a credible chain:

`mechanism -> alternative -> discriminating evidence/falsifier -> intervention -> early signal -> revision condition -> next decision`

### 3. Simulator interaction usefulness

Review whether D1–D4 consequences and optional tools expose meaningful reasoning differences, trigger diagnosis revision, or improve transfer. Interaction that only creates clicks/reading load should be revised or removed.

### 4. Friction and reliability

Block promotion for material evidence distortion caused by state loss, blinding leaks, route confusion, inaccessible controls, unreadable content, or wording/rubric ambiguity.

### 5. Content-model fit

Record learner-driven requirements that cannot be represented cleanly without one-off runtime behavior. Resolve genuine domain-contract gaps before Phase 2.

## Phase 1 decision

Record exactly one outcome in `M01-COHORT-REVIEW-TEMPLATE.md`.

### PROMOTE

Only when all are true:

- >=5 valid sessions;
- >=3/5 positive individual signals;
- >=3/5 credible transfers;
- qualitative reasoning does not materially contradict score gains;
- no unresolved blocking UX/reliability defect materially distorts more than one valid session;
- no repeated rubric ambiguity plausibly explains gains;
- no unresolved learner-driven content-model exception blocks preserving the validated simulator contract.

### REVISE

Use when the mechanism remains plausible but evidence is mixed, transfer is mostly partial, repeated wording/interaction/rubric problems appear, alternative/falsifier/revision work becomes form-filling, reliability interferes with evidence, or quantitative and qualitative evidence conflict.

### REJECT

Use only when sessions are valid enough to interpret, no blocking measurement/usability defect reasonably explains failure, and both are true:

- `0–1/5` positive individual signals;
- `0–1/5` credible transfers.

Borderline/conflicting evidence defaults to **REVISE**.

Until one outcome is recorded after at least five valid sessions, Phase 2 remains blocked.
