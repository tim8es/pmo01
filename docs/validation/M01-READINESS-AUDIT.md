# M01 Validation Readiness Audit

## Purpose

This audit closes the non-human part of PMO01 Phase 1 before real learner sessions.

It checks whether the current M01 validation slice:

1. has an explicit curriculum/competency target;
2. exercises the learning model rather than page completion;
3. can later be represented by the canonical content model without turning experimental measurement mechanics into permanent product requirements;
4. has known gaps documented before learner evidence is collected.

This document is a **readiness audit**, not a Phase 1 exit decision. Phase 1 cannot exit without real learner evidence.

## Sources reviewed

- `docs/product/CURRICULUM.md`
- `docs/product/LEARNING_MODEL.md`
- `docs/product/METRICS.md`
- `docs/content/CONTENT_MODEL.md`
- current M01 candidate lessons in `course-data.js`
- `m01-validation-data.js`
- `docs/validation/M01-VALIDATION-PROTOCOL.md`

## Executive result

**Status: READY FOR LEARNER TESTING / NOT READY FOR PHASE 2.**

The M01 slice is coherent enough to run the first real validation cohort. Its core learning target is narrow enough to measure, its interactions test meaningful PM reasoning, and no current observation requires a new permanent content entity solely to support the baseline/post experiment.

The remaining Phase 1 blocker is empirical:

> Run real learner sessions and determine whether M01 changes diagnosis/intervention reasoning and transfers to real project work.

Do not freeze v1 contracts or select a framework before that gate.

---

## 1. Curriculum scope

### Recommended module competency contract

M01 should be treated as targeting:

- **Primary: C1 — System diagnosis**
- **Secondary: C8 — Intervention design**

M01 uses examples involving dependencies, decisions, information, and feedback, but it should **not** claim mastery of C3, C6, or C7 from this module alone. Those concepts appear as evidence inside system diagnosis; their full competency treatment belongs to later curriculum units.

This keeps the measured construct narrow enough for a meaningful pre/post comparison.

### Candidate module outcome

Current prototype outcome:

> Построить карту семи потоков реального проекта и найти главный системный разрыв.

Recommended canonical outcome after validation:

> Given evidence from a real or described project, the learner can distinguish a visible symptom from a reproducible system mechanism, identify the most relevant flow break, choose a first intervention aimed at that mechanism, and state an early condition for changing course.

This outcome is observable and maps directly to C1 + C8 and the five validation rubric dimensions.

---

## 2. Lesson outcome audit

| Lesson | Current instructional role | Recommended observable outcome | Competencies | Status |
|---|---|---|---|---|
| `project-system` | Changes unit of analysis from task/date to system/flow | Given project evidence, map the seven flows, separate facts from interpretations, and identify one system break that plausibly explains downstream symptoms. | C1 | Ready to test; canonical metadata missing |
| `system-diagnostic` | Traces symptom to reproducible system condition before intervening | Given a recurring project symptom, trace symptom → mechanism → system condition, choose an intervention aimed at the mechanism, and define an early signal that could invalidate the intervention. | C1, C8 | Ready to test; canonical metadata missing |

### Findings

- The lessons have distinct instructional jobs; they are not duplicates.
- Both practices require observable learner work rather than recall.
- The second lesson extends the first from system framing into intervention design.
- Current prototype fields use `thesis`, `body`, `model`, `practice`, and `criteria`, not the future canonical lesson metadata. This is a **migration transformation**, not a reason to modify the prototype now.

### Learner-test question

Watch for whether participants actually distinguish the two lessons:

- Lesson 1 should change **where they look**.
- Lesson 2 should change **how they explain cause and choose action**.

If learners experience both as the same idea, revise or merge before migration.

---

## 3. Rubric audit

The M01 validation rubric uses five dimensions:

1. mechanism;
2. evidence;
3. trade-offs;
4. intervention;
5. change condition.

This is consistent with:

- C1: symptom/mechanism/system diagnosis;
- C8: intervention, expected effect, risk/trade-off, early signal/change condition;
- the L1 diagnostic-reasoning metric in `METRICS.md`;
- the Assessment Rubric examples in `CONTENT_MODEL.md`.

### Decision

**Keep the five dimensions stable for the first learner cohort.**

Do not tune weights or thresholds between participants unless a question is clearly invalid. Changing rubric semantics mid-cohort would make pre/post and participant comparisons harder to interpret.

The current `+3 total / 2 improved dimensions` rule remains a prototype development signal, not a mastery threshold or statistical claim.

---

## 4. Decision Drill audit

### `m01-drill-system`

What it tests:

- symptom response vs system response;
- whether an external dependency becomes an explicit managed node rather than hidden waiting time.

Why it is useful:

- all choices are plausible management reactions;
- the preferred answer changes the system rather than blaming the late task;
- feedback explains why local schedule compensation is weaker.

Risk to observe:

- the preferred answer may be too obvious after immediately reading the lesson.

Learner-session signal:

- useful if it exposes a misconception, causes a rationale change, or helps later transfer;
- weak if nearly everyone selects the preferred choice instantly and cannot articulate a meaningful contrast.

### `m01-drill-diagnostic`

What it tests:

- stopping the causal chain at a reproducible decision/interface condition rather than QA or an individual developer.

Why it is useful:

- it directly tests C1 and C8;
- it distinguishes downstream detection from upstream mechanism;
- feedback explains the system condition rather than only marking correctness.

Risk to observe:

- wording around “где остановить причинную цепь” may require facilitator observation for ambiguity.

### Content-model fit

Canonical Decision Drill requires structured fields such as competencies and analysis of mechanism/trade-offs/change conditions.

The prototype currently stores most analysis as per-choice feedback. Before v1 migration this should be transformed into structured canonical analysis, but no new entity type is required.

**Classification: representable with enrichment; no content-model exception.**

---

## 5. Integrative post-case audit

The post-case is structurally similar to baseline but uses a different project scenario. It exercises all five rubric dimensions and requires free-text diagnosis before the scored choices.

It satisfies the learning-model intent to test:

- diagnosis;
- missing/relevant evidence;
- trade-off reasoning;
- intervention choice;
- change condition.

### Content-model fit

The canonical Integrative Case expects:

- case evidence;
- diagnosis prompt;
- intervention decision;
- rationale prompt;
- evidence/change-condition prompt;
- assessment rubric.

All of these concepts exist in the current post-case, although some are encoded as separate scored questions rather than named canonical fields.

Before migration, convert the case into canonical structured content and reference an explicit rubric ID/version.

**Classification: representable by canonical Integrative Case + Assessment Rubric; no new entity required.**

---

## 6. Field Application audit

Current M01 field application collects:

- project/context and outcome;
- symptom;
- mechanism;
- intervention;
- early signal;
- observed evidence;
- next decision.

This is a strong match to the intended transfer chain:

`diagnosis → intervention → evidence → updated decision`

### Content-model gaps before migration

The canonical Field Application should make these properties explicit rather than infer them from UI fields:

- `context_requirement`;
- `action_steps`;
- `expected_artifact`;
- `evidence_criteria`;
- `reflection_prompts`;
- `privacy_guidance`.

The prototype contains enough material to derive these properties, but they are not yet first-class metadata.

Recommended expected artifact for M01:

> A short intervention record containing the observed symptom, proposed system mechanism, one minimal intervention, an early signal, observed evidence, and the next decision.

Recommended evidence criteria:

- mechanism is not merely a person or symptom;
- intervention acts on the proposed mechanism;
- early signal is observable before the final outcome where possible;
- evidence distinguishes observed result from an untested expectation;
- next decision follows from evidence rather than from course completion.

Recommended privacy guidance:

> Use anonymized project descriptions and omit confidential names, customer data, credentials, commercial terms, or sensitive internal metrics when they are not necessary for reasoning.

**Classification: representable with metadata enrichment; no content-model exception.**

---

## 7. Reflection audit

The current reflection prompts ask what changed in:

- diagnosis;
- first action;
- evidence requirements;
- remaining uncertainty.

This maps directly to L3 Reflection Quality in `METRICS.md` and the learning-model requirement to update the learner's mental model.

Reflection should remain qualitative during Phase 1. Do not add an automatic “reflection score” before learner samples show a stable, useful classification rule.

**Classification: representable as Field Application / module reflection prompts.**

---

## 8. What is validation harness vs production content

This boundary is critical for v1 quality.

### Validation harness — do not automatically migrate as permanent content entities

- baseline case used to establish pre-learning reasoning;
- pre/post blinding behavior;
- prototype promotion threshold (`+3` / 2 dimensions);
- cohort/session measurement protocol;
- facilitator interview;
- comparison display used to inspect learning delta.

These exist to **measure the product while it is being validated**. They are not automatically part of the learner-facing production curriculum.

### Candidate production learning content

- M01 lesson outcomes/content;
- Decision Drills that prove useful;
- integrative case;
- field application;
- reflection prompts that support transfer;
- assessment rubric semantics that remain useful after learner testing.

### Consequence

Do **not** add a permanent `BaselineAssessment` entity to `CONTENT_MODEL.md` merely because the Phase 1 experiment uses one.

If future product requirements later need diagnostic/pre-assessment content in production, specify that separately from the current validation harness.

---

## 9. Learner-state boundary

The current prototype stores validation work separately in `pm01-validation-m01-v1` and reads legacy lesson completion from `pm01-state-v1`.

This is appropriate for the reference prototype but is not the future learner repository contract.

For v1, learner records should eventually reference:

- program version;
- immutable content ID/version;
- interaction/attempt identity where needed;
- learning-state transition evidence.

Do not design those stable contracts until Phase 1 evidence confirms which interactions and evidence must survive migration.

---

## 10. Phase 1 promotion-gate status

| Gate | Current status | Evidence still needed |
|---|---|---|
| Explicit learning outcomes | **Provisionally pass** | Confirm wording after learner observations |
| Lesson → competency mapping | **Provisionally pass** | C1 primary, C8 secondary; validate scope |
| Useful Decision Drill | **Implemented / unproven** | Real learner misconception/decision evidence |
| Integrative case | **Implemented / unproven** | Pre/post reasoning delta with real learners |
| Field transfer possible | **Implemented / unproven** | Credible real-project applications |
| Rubric usable | **Implemented / unproven** | Check ambiguity and discrimination in sessions |
| Major learner friction known | **Not passed** | Must observe real sessions |
| No unresolved content-model special case | **Provisionally pass** | Re-check after learner-driven revisions |

## Decision

### Current decision: RUN LEARNER SESSIONS

Do not start Phase 2 contract freeze yet.

Run at least **5 completed M01 sessions** using `M01-VALIDATION-PROTOCOL.md` and the session record template. Then review:

1. diagnostic reasoning delta;
2. improved rubric dimensions;
3. drill usefulness;
4. credible field transfer;
5. reflection quality;
6. interface/content friction;
7. any learner-driven content-model exception.

Possible gate outcomes remain:

- **Promote to Phase 2** — evidence supports the learning format and no unresolved content-domain ambiguity remains;
- **Revise and retest** — interaction/content/rubric/friction distorts the result;
- **Reject mechanism** — an interaction adds complexity without useful learning evidence.

Until one of those decisions is documented, Phase 2 is intentionally blocked.
