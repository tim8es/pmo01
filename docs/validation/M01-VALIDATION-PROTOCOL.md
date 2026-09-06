# M01 Learning Validation Protocol

## Purpose

This protocol tests the first PMO01 learning slice end-to-end before any scalable v1 implementation.

The question is not whether learners enjoy the module or finish every page. The primary question is:

> After M01, can a learner diagnose a structurally similar project problem and choose a stronger intervention with better reasoning than before?

The experiment is exploratory. Its thresholds are operational decision rules for product development, not evidence of a statistically generalizable educational effect.

## What is being validated

M01 tests five reasoning dimensions:

1. **Mechanism** — separates a visible symptom from a reproducible system mechanism.
2. **Evidence** — chooses observable evidence rather than opinions or vanity metrics.
3. **Trade-offs** — makes the cost of an intervention and alternative explanations explicit.
4. **Intervention** — acts on the diagnosed mechanism rather than compensating for a symptom.
5. **Change condition** — defines an early signal that can confirm or invalidate the intervention.

The prototype uses one scored item per dimension in both baseline and post-case. Each item scores `0..3`; total score is `0..15`.

## Individual learning signal

An individual session produces a **positive prototype learning signal** only when both conditions are true:

- post-case total is at least `baseline + 3`;
- at least two rubric dimensions improve.

This signal is not `mastery`.

`mastered` must not be assigned from the immediate post-case. Delayed transfer evidence requires separate review and a later mastery decision.

## Participant profile

Use people who can reason about real delivery work, for example:

- Project Manager;
- Delivery Manager;
- Process Manager;
- Team Lead with delivery ownership;
- Product/operations role that regularly coordinates dependencies and decisions.

Record experience level rather than filtering to one exact seniority. For the first cycle, aim for at least **5 completed sessions** before making a module-level promotion decision. More sessions are useful when results conflict.

Do not use the course author as evidence of learning effectiveness.

## Environment

The prototype stores experiment data only in browser `localStorage` under:

`pm01-validation-m01-v1`

The main course continues using its own `pm01-state-v1` key. The separation prevents legacy course saves from erasing validation work.

For each new participant:

1. open `#/validation/m01`;
2. use **Сбросить M01 validation data** before the session, or use a fresh browser profile;
3. verify the page does not show an existing baseline score;
4. do not show the M01 lesson content before baseline is submitted.

## Session sequence

### 1. Baseline

Participant reads the baseline scenario without M01 material.

Required evidence:

- free-text diagnosis;
- answers to all five rubric questions;
- frozen baseline score after submission.

Observe:

- whether the participant blames people or follows a mechanism;
- what data they ask for first;
- whether they specify an early change condition;
- hesitation or ambiguity in question wording.

Do not coach the participant toward the system model.

### 2. Learning experience

Participant completes both existing M01 lessons:

- `project-system`;
- `system-diagnostic`.

Then they complete both Decision Drills. The first drill choice is frozen before feedback is revealed.

Observe:

- whether feedback explains consequences rather than merely marking correct/incorrect;
- whether a drill exposes a misconception that the lesson text did not expose;
- whether the participant can explain why their choice changed after feedback.

### 3. Integrative post-case

Post-case uses a different scenario but the same five reasoning dimensions.

Required evidence:

- new free-text diagnosis;
- all five post-case answers;
- post score;
- total delta;
- per-dimension delta;
- individual promotion-signal result.

Do not interpret a higher total alone as success if improvement is concentrated in one dimension.

### 4. Real-project transfer

Participant applies the model to a current or recent real project and records:

- project/outcome;
- visible symptom;
- proposed system mechanism;
- one minimal intervention;
- early signal;
- observed evidence or an explicit statement that it has not yet been observed;
- next decision.

A field application is useful only when it connects diagnosis → intervention → evidence. Rephrasing the lesson is not transfer.

### 5. Reflection

Participant records:

- what changed in the diagnosis;
- what changed in the first action;
- what evidence they would now obtain earlier;
- remaining uncertainty and how they would test it.

Optional delayed-transfer text can be captured later. It is evidence for human review only and does not automatically produce `mastered`.

## Short interview

After the workflow, ask the same questions in every session:

1. What did you initially think the project problem was?
2. What, if anything, changed in your diagnosis after the module?
3. Which part of the module caused that change?
4. Which feedback felt obvious, misleading, or unconvincing?
5. Could you use the model tomorrow without opening the course? Where?
6. What information would you now request earlier on a real project?
7. Where did the interface or wording interfere with your reasoning?

Capture examples and direct observations, not only satisfaction ratings.

## Optional delayed check

When practical, give a new structurally similar case after a delay rather than immediately after reading.

Record:

- whether the learner independently reconstructs symptom → mechanism → intervention → evidence;
- whether they need the course terminology as a prompt;
- whether the reasoning transfers to a different domain;
- whether the immediate post-case improvement persists.

Do not introduce an automatic mastery rule until delayed evidence has been reviewed across multiple sessions.

## Session record

For each participant record outside the product, using anonymized IDs where possible:

| Field | Record |
|---|---|
| Participant ID | Non-identifying ID |
| Role / experience | Context for interpretation |
| Baseline total | 0–15 |
| Post total | 0–15 |
| Delta | Post − baseline |
| Improved dimensions | IDs/names |
| Individual signal | pass / not pass |
| Field application credible | yes / partial / no |
| Drill misconception exposed | description |
| Major friction | description |
| Content ambiguity | description |
| Content-model exception | description |
| Delayed transfer | not run / evidence |

Do not store sensitive project details when an anonymized description is sufficient.

## Module-level promotion review

Do not migrate M01 into v1 solely because CI is green or the UI works.

After at least 5 completed learner sessions, review these five areas:

### 1. Learning signal

Look at individual `+3 / 2-dimension` results and the direction of change across the cohort. Treat the threshold as a development heuristic, not a significance test.

### 2. Transfer

Determine whether learners can produce a credible real-project chain:

`mechanism → intervention → early signal → evidence → next decision`

### 3. Interaction usefulness

Promote a Decision Drill only if it does at least one of the following:

- exposes a meaningful reasoning difference;
- changes diagnosis/action;
- reveals a misconception worth addressing;
- improves transfer.

A drill that only creates clicks should be removed or redesigned.

### 4. Friction and reliability

Block promotion for:

- silent loss of learner work;
- confusing sequence that contaminates baseline;
- inaccessible critical controls;
- wording ambiguity that materially changes score interpretation.

### 5. Content-model fit

Record every special case needed to represent M01. If the module requires one-off runtime behavior that the canonical content model cannot express cleanly, resolve the content contract before v1 migration.

## Promotion decision

Possible outcomes:

- **Promote** — learning mechanism and transfer evidence are strong enough to become v1 requirements.
- **Revise and retest** — promising signal, but content, rubric, interaction, or friction is materially distorting results.
- **Reject mechanism** — interaction adds complexity without useful reasoning evidence.

Document the decision and evidence before beginning the v1 vertical slice.
