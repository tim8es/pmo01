# PMO01 Metrics and Validation

## Principle

PMO01 should optimize for improvement in project-management judgment, not lesson completion alone.

Metrics are split into:

1. learning-quality metrics;
2. behavior/engagement metrics;
3. product-quality metrics;
4. migration gates.

## North-star learning question

> After using PMO01, can a learner diagnose a project situation and choose a stronger intervention with better reasoning than before?

No single percentage can prove this. Validation should combine structured assessment and qualitative evidence.

## Learning-quality metrics

### L1. Diagnostic reasoning delta

Measure performance on structurally similar but non-identical cases before and after a module.

Score dimensions:

- mechanism identified;
- relevant evidence selected;
- trade-offs acknowledged;
- intervention matches diagnosis;
- change condition stated.

Use a stable rubric. Do not reuse identical questions for pre/post measurement.

### L2. Transfer rate

Definition:

```text
learners who complete a real-project application with evidence
--------------------------------------------------------------
learners who study the corresponding module
```

This is more important than page completion.

### L3. Reflection quality

Sample learner reflections and classify whether they show:

- changed diagnosis;
- changed planned action;
- new evidence requirement;
- unchanged/restated lesson content only.

This can be reviewed manually during prototype validation.

### L4. Delayed retrieval / application

Where feasible, check whether the learner can apply the concept to a new case after a delay rather than immediately after reading.

This becomes more important before any mastery label is introduced.

## Engagement metrics

These diagnose friction; they are not proof of learning.

Track when infrastructure exists:

- module start rate;
- lesson completion rate;
- decision-drill participation;
- field-application start/completion;
- return rate after first session;
- time to first meaningful application;
- abandonment point by learning unit.

Avoid optimizing for total minutes spent.

## Product-quality metrics

### P1. Content integrity

- zero broken references in published content;
- zero duplicate published IDs;
- 100% of published lessons mapped to measurable outcomes and competencies.

### P2. Reliability

For persisted learner work:

- no silent loss of notes/responses;
- recoverable state after ordinary page reload/navigation;
- explicit error when persistence fails.

### P3. Accessibility

Critical learner paths must be keyboard operable and semantically readable.

### P4. Performance

Define numerical budgets when the v1 framework/deployment model is selected. Until then, the constraint is static-first rendering with minimal client JavaScript.

## Prototype validation protocol

Before broad v1 implementation, validate at least one complete module with real learners.

Recommended minimum study:

1. baseline case;
2. module learning experience;
3. boss/integrative case;
4. real-project application;
5. short interview about reasoning and friction;
6. delayed follow-up case when practical.

The goal is to discover learning and product failure modes, not to establish statistically generalizable effect size at prototype scale.

## Promotion gate: interaction

A learning interaction can be promoted into v1 when it demonstrates at least one of:

- reveals a meaningful reasoning difference;
- changes the learner's diagnosis;
- improves transfer to a real project;
- exposes a misconception worth addressing.

Interactions that only create engagement or cosmetic progress should not become architectural requirements.

## Promotion gate: module

A prototype module is ready for migration when:

- learning outcomes are explicit;
- every lesson maps to competencies;
- at least one decision drill has useful feedback;
- the integrative case exercises multiple concepts;
- field transfer is possible;
- rubric/evidence criteria are usable;
- major learner friction is known;
- no unresolved content-model special case is required to represent it.

## V1 success gate

Do not claim scalable v1 is successful because migration is technically complete.

V1 must preserve or improve:

- reading usability;
- reasoning quality;
- transfer completion;
- learner-state reliability;

while making content maintenance and future program growth materially easier.

## Metrics anti-patterns

Do not use these as primary success measures:

- number of pages;
- number of lessons;
- raw time on site;
- XP earned;
- streak length;
- percentage of content opened.

They may describe use but not the product's learning promise.
