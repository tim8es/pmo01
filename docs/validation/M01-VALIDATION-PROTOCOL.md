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

Record experience level rather than filtering to one exact seniority. For the first cycle, require at least **5 completed sessions** before making a module-level promotion decision. More sessions are useful when results conflict.

Do not use the course author as evidence of learning effectiveness.

## Environment

The prototype stores experiment data only in browser `localStorage` under:

`pm01-validation-m01-v1`

The main course uses a separate key:

`pm01-state-v1`

For **each new participant**, start from a fresh browser context where both keys are absent. Use a fresh browser profile/private session or clear all PMO01 site data before opening the validation route.

Do **not** prepare a different participant by using only **Сбросить M01 validation data**. That control intentionally clears `pm01-validation-m01-v1` but preserves the main-course progress in `pm01-state-v1`, so reused course progress could contaminate the next participant's learning sequence.

For each new participant:

1. start a fresh browser context or clear all PMO01 site data;
2. open `#/validation/m01`;
3. verify the page does not show an existing baseline score or completed M01 state;
4. do not show the M01 lesson content before baseline is submitted.

The in-product validation reset remains useful for restarting the **same participant's** validation answers when the facilitator intentionally wants to preserve their course state. It is not a cohort participant reset.

## Measurement blinding rule

Baseline answers and the computed score are persisted and frozen at submission, but the learner must **not** see baseline score or option-level feedback before completing the post-case.

This rule prevents the assessment itself from becoming an unplanned teaching intervention. The participant may still see their own frozen choices and free-text diagnosis; explanatory feedback and score remain blind until post-case submission.

After post-case submission the prototype may reveal:

- baseline score;
- post-case score;
- per-dimension changes;
- option feedback;
- the prototype promotion signal.

Any future implementation of the same experiment must preserve this blinding rule unless a new validation design explicitly replaces it.

## Session sequence

### 1. Baseline

Participant reads the baseline scenario without M01 material.

Required evidence:

- free-text diagnosis;
- answers to all five rubric questions;
- frozen baseline score stored after submission;
- baseline score and option feedback hidden from the learner until post-case completion.

Observe:

- whether the participant blames people or follows a mechanism;
- what data they ask for first;
- whether they specify an early change condition;
- hesitation or ambiguity in question wording.

Do not coach the participant toward the system model and do not disclose whether any baseline answer is strong or weak.

### 2. Learning experience

Participant completes both existing M01 Learning Lab lessons:

- `project-system`;
- `system-diagnostic`.

Each lesson contains its own cold Decision Drill, immediate feedback, an exit drill, and required workbook evidence. The cold drill records the learner's first choice and becomes read-only after feedback.

The validation route must **not** repeat these same drills. Post-case becomes available after both M01 lessons satisfy their current evidence-aware completion contract.

Observe:

- whether feedback explains consequences rather than merely marking correct/incorrect;
- whether a drill exposes a misconception that the lesson material did not expose;
- whether the participant can explain why the feedback changed or did not change their reasoning.

### 3. Integrative post-case

Post-case uses a different scenario but the same five reasoning dimensions.

Required evidence:

- new free-text diagnosis;
- all five post-case answers;
- post score;
- baseline score revealed only now;
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

## Minimum evidence packet

For each completed learner session, retain only the evidence needed for the Phase 1 decision:

- anonymized participant ID and role/experience;
- baseline total, post total, delta, and improved dimensions;
- baseline and post free-text diagnoses;
- first choice from each M01 cold drill and whether its feedback exposed or changed reasoning;
- field transfer: credible / partial / no;
- reflection showing changed diagnosis/action/evidence requirement, or no meaningful change;
- major UX/reliability/content ambiguity that could distort the result;
- delayed-transfer evidence when available.

Do not add new engineering telemetry or product instrumentation for this cohort. Use the existing session record template and manual evidence capture.

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

After at least **5 completed learner sessions**, review these five areas:

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
- baseline score or explanatory feedback leaking before post-case completion;
- confusing sequence that otherwise contaminates baseline;
- inaccessible critical controls;
- wording ambiguity that materially changes score interpretation.

### 5. Content-model fit

Record every special case needed to represent M01. If the module requires one-off runtime behavior that the canonical content model cannot express cleanly, resolve the content contract before v1 migration.

## Promotion decision

After the minimum cohort is complete, record exactly one outcome:

- **Promote to Phase 2** — learning mechanism and transfer evidence are strong enough to become v1 requirements.
- **Revise and retest** — promising signal, but content, rubric, interaction, or friction materially distorts results.
- **Reject mechanism** — interaction or module format adds complexity without useful reasoning/transfer evidence.

Until one of these outcomes is recorded after at least 5 completed sessions, Phase 2 and v1 work remain blocked.