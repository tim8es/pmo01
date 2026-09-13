# M01 Cohort Review Template

Use this document only after at least **5 valid completed learner sessions**. This is a product/learning decision record, not a statistical significance report.

## Cohort metadata

- **Review date:**
- **Runtime/treatment pin:** `m01-mission-partner-launch-v1` / mission version `1`
- **Sessions included:**
- **Sessions excluded:**
- **Reasons for exclusion:**
- **Experience mix:**
- **Facilitator(s):**

## Per-session summary

| Participant | Baseline | Post | Delta | Improved dims | Individual signal | Transfer | Major friction |
|---|---:|---:|---:|---:|---|---|---|
| P01 | | | | | | | |
| P02 | | | | | | | |
| P03 | | | | | | | |
| P04 | | | | | | | |
| P05 | | | | | | | |

## L1 — Diagnostic reasoning delta

- **Positive individual signals (`post >= baseline + 3` and >=2 improved dimensions):**
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

1. Is improvement broad or concentrated in one rubric item?
2. Does free-text reasoning support the scored result?
3. Is wording ambiguity a plausible alternative explanation for score movement?
4. Are there obvious ceiling/floor effects?

## L2 — Real-project transfer

- **Credible:**
- **Partial:**
- **Restatement only:**
- **Not completed:**

Review whether participants can produce a defensible chain:

`mechanism -> strong alternative -> discriminating evidence -> falsifier -> intervention -> early signal -> revision condition -> next decision`

Do not count a filled form as credible transfer when intervention/evidence does not follow from the diagnosis.

## L3 — Simulator trajectory review

### D1 — Diagnose

- Common first choices:
- Rationale quality: strong / mixed / weak
- Did participants seek distinguishing evidence before intervention? yes / mixed / no
- Repeated ambiguity/friction:

### D2 — Intervene

- Common first choices:
- Did interventions target the diagnosed mechanism rather than compensate for symptoms? yes / mixed / no
- Repeated ambiguity/friction:

### D3 — Trade-off

- Common first choices:
- Could participants explain the accepted cost/trade-off? yes / mixed / no
- Repeated ambiguity/friction:

### D4 — Revise

- Diagnosis revised after falsifying/new evidence: count /5
- Could participants name the fact that preserved or changed the diagnosis? yes / mixed / no
- Did any participant ignore the new evidence because of commitment to the prior plan? observations:
- Repeated ambiguity/friction:

### Project-state trajectory

Review deadline confidence / stakeholder trust / team capacity / launch risk only as authored consequences, not as a hidden score.

- Consequences were understandable: yes / mixed / no
- Participants could explain at least one state trade-off: yes / mixed / no
- Any meter interpretation caused misleading optimization behavior:

### Optional tools

| Tool | Opened by | Useful evidence | Recommendation |
|---|---:|---|---|
| Decision Timeline | | | keep / revise / remove |
| Hypothesis Comparator | | | keep / revise / remove |
| Change Condition | | | keep / revise / remove |

A tool/interaction is useful only when it exposes a meaningful reasoning difference, changes diagnosis/action, reveals a misconception, or improves transfer.

## L4 — Reflection and interview patterns

Count/classify whether participants showed:

- changed diagnosis;
- changed planned action;
- new evidence requirement;
- plausible alternative hypothesis;
- observable falsifier;
- explicit revision condition;
- testable remaining uncertainty;
- simulator/course restatement without mental-model change.

Key qualitative patterns:

## L5 — Reliability / UX review

Count and classify:

- response/state loss;
- reload/navigation recovery failures;
- persistence errors;
- route/sequence confusion;
- baseline contamination;
- simulator/post-case unlock failures;
- blocking readability/interaction issues;
- keyboard/accessibility blockers;
- wording/UI interfering with reasoning;
- abandonment points.

### Blocking defects

List defects that invalidate or materially distort learner evidence:

## Rubric review

| Dimension | Keep | Revise | Evidence |
|---|---|---|---|
| Mechanism | | | |
| Evidence | | | |
| Trade-offs | | | |
| Intervention | | | |
| Change condition | | | |

The `+3 total / >=2 dimensions` rule is a development heuristic, not mastery.

- Did it agree with qualitative evidence?
- False positives?
- False negatives?
- Recommendation: keep / revise / stop using

## Content-contract fit review

Record only learner-driven requirements that cannot be represented cleanly by the current content/runtime model without a one-off exception.

- New exceptions discovered:
- Are any blocking preservation of the validated simulator contract? yes / no

## Phase 1 exit decision

Choose exactly one.

### PROMOTE

Choose **PROMOTE** only when all are true:

- >=5 valid sessions;
- >=3/5 positive individual signals;
- >=3/5 credible real-project transfers;
- qualitative reasoning does not materially contradict score gains;
- no unresolved blocking reliability/UX defect materially distorts more than one valid session;
- no repeated rubric ambiguity plausibly explains the gains;
- no unresolved learner-driven content-model exception blocks preserving the validated simulator contract.

### REVISE

Choose **REVISE** when the mechanism remains plausible but evidence is mixed, transfer is mostly partial, repeated wording/interaction/rubric problems appear, alternatives/falsifiers/revision conditions become form-filling, reliability interferes with evidence, or quantitative and qualitative evidence conflict.

Borderline/conflicting evidence defaults to **REVISE**.

### REJECT

Choose **REJECT** only when sessions are valid enough to interpret, no blocking measurement/usability defect reasonably explains failure, and both are true:

- `0–1/5` positive individual signals;
- `0–1/5` credible transfers.

## Recorded decision

- **Decision:** PROMOTE / REVISE / REJECT
- **Rationale:**
- **Evidence supporting the decision:**
- **Required changes before next gate:**
- **Owner:**
- **Date:**

## Phase 2 authorization

Phase 2 contract freeze is authorized only if the recorded decision is **PROMOTE**. If the decision is REVISE or REJECT, do not begin v1 domain freeze or framework selection.
