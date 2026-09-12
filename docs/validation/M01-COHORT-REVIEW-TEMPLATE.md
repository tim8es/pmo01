# M01 Cohort Review Template

Use this document after the first learner cohort is complete. The first review should normally include at least **5 completed sessions**.

This is a product/learning decision record, not a statistical significance report.

## Cohort metadata

- **Review date:**
- **Sessions included:**
- **Sessions excluded:**
- **Reason for exclusions:**
- **Experience mix:**
- **Facilitator(s):**

## Per-session summary

| Participant ID | Baseline | Post | Delta | Improved dimensions | Individual signal | Field transfer | Major friction | Delayed follow-up |
|---|---:|---:|---:|---:|---|---|---|---|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

## L1 — Diagnostic reasoning delta

Review the direction and distribution of change rather than only the average.

- **Positive individual signals (`+3` and ≥2 improved dimensions):**
- **No-signal sessions:**
- **Negative-delta sessions:**
- **Median delta:**
- **Range:**

### Dimension-level pattern

| Dimension | Improved | Unchanged | Worse | Interpretation |
|---|---:|---:|---:|---|
| Mechanism | | | | |
| Evidence | | | | |
| Trade-offs | | | | |
| Intervention | | | | |
| Change condition | | | | |

Questions:

1. Is improvement broad across reasoning dimensions or concentrated in one item?
2. Is any item too easy/hard to discriminate before and after learning?
3. Is wording ambiguity a plausible alternative explanation for score movement?
4. Does free-text reasoning support the same conclusion as multiple-choice scores?

## L2 — Transfer

For participants who studied M01:

- **Credible field applications:**
- **Partial applications:**
- **Restatement-only / no transfer:**
- **Not completed:**

Prototype transfer rate:

```text
credible or policy-defined completed field applications
-------------------------------------------------------
participants who studied the module
```

Do not interpret a filled form as transfer when intervention/evidence does not follow from the diagnosis.

### Common transfer patterns

- Mechanisms learners identified:
- Interventions learners attempted:
- Signals/evidence learners used:
- Where learners reverted to symptom/person-level reasoning:

## L3 — Reflection quality

Count/classify whether reflections show:

- changed diagnosis;
- changed planned action;
- new evidence requirement;
- testable remaining uncertainty;
- lesson restatement without mental-model change.

Key qualitative patterns:

## L4 — Delayed retrieval / application

- **Delayed checks run:**
- **Independent transfer retained:**
- **Partial:**
- **Absent:**

Observations:

- Did participants reconstruct the model without course vocabulary prompts?
- Did transfer survive a different project domain?
- Did immediate post-case gains persist?

Do not introduce a `mastered` rule from a small cohort. Record evidence only.

## Decision Drill review

### `m01-drill-system`

- Preferred choice selected immediately by most learners: yes / no / unclear
- Meaningful misconception exposed: yes / no / mixed
- Feedback changed reasoning: yes / no / mixed
- Transfer contribution observed: yes / no / unclear
- Recommendation: keep / revise / remove
- Reason:

### `m01-drill-diagnostic`

- Preferred choice selected immediately by most learners: yes / no / unclear
- Meaningful misconception exposed: yes / no / mixed
- Feedback changed reasoning: yes / no / mixed
- Transfer contribution observed: yes / no / unclear
- Recommendation: keep / revise / remove
- Reason:

## Integrative case review

- Case felt structurally similar but non-identical to baseline: yes / no / mixed
- Case tested multiple concepts rather than recall: yes / no / mixed
- Scoring dimensions remained interpretable: yes / no / mixed
- Free-text diagnosis added useful evidence beyond choices: yes / no / mixed
- Recommendation: keep / revise / replace

## Rubric review

For each dimension, note ambiguity, ceiling/floor effects, or mismatch between option score and observed reasoning.

| Dimension | Keep | Revise | Evidence |
|---|---|---|---|
| Mechanism | | | |
| Evidence | | | |
| Trade-offs | | | |
| Intervention | | | |
| Change condition | | | |

### Promotion threshold review

The current `+3 total / ≥2 dimensions` rule is a development heuristic.

- Did it classify sessions in a way consistent with qualitative reasoning evidence?
- Did it create obvious false positives?
- Did it create obvious false negatives?
- Recommendation: keep for next prototype cycle / revise / stop using

Do not convert this threshold into mastery semantics.

## Reliability / UX review

Count and classify:

- response/state loss;
- reload/navigation recovery failures;
- persistence errors;
- keyboard/accessibility blockers;
- route/sequence confusion;
- baseline contamination;
- abandonment points;
- wording/UI interfering with reasoning.

### Blocking defects

List defects that invalidate or materially distort learner evidence:

## Content-contract fit review

Start from `M01-READINESS-AUDIT.md` and record whether learner-driven revisions create a real new content-domain requirement.

### Expected migration enrichments

These are not special cases by themselves:

- competency/outcome metadata;
- structured drill analysis;
- explicit rubric IDs/versioning;
- explicit field-application artifact/evidence/privacy metadata.

### New exceptions discovered

List only requirements that cannot be represented cleanly by the current canonical entities:

## Phase 1 exit decision

Choose exactly one:

### A. Promote to Phase 2

Use only when:

- learner evidence indicates meaningful reasoning improvement or useful discrimination;
- field transfer is credible enough to preserve as a requirement;
- major learner friction is known and non-blocking;
- no unresolved content-domain ambiguity remains.

### B. Revise and retest

Use when the learning mechanism looks promising but:

- wording/rubric distorts measurement;
- an interaction is weak;
- transfer is incomplete;
- UX/reliability interferes with evidence;
- content-contract assumptions changed materially.

### C. Reject mechanism

Use when an interaction or module format adds complexity without producing useful reasoning or transfer evidence.

## Recorded decision

- **Decision:** A / B / C
- **Rationale:**
- **Evidence supporting the decision:**
- **Required changes before next gate:**
- **Owner:**
- **Date:**

## Phase 2 authorization

Phase 2 contract freeze is authorized only if the recorded decision is **A. Promote to Phase 2**.

If the decision is B or C, do not begin v1 domain freeze or framework selection.
