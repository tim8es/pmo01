# PMO01 Curriculum Contract

## Purpose

The curriculum defines what a strong PM should be able to diagnose and do after completing PMO01. It is independent from the current number of modules or the UI used to deliver them.

## Organizing model: seven project flows

PMO01 uses seven flows as the primary diagnostic lens:

1. **Value** — how work connects to an observable user or business outcome.
2. **Work** — how work moves through the delivery system.
3. **Information** — how quickly relevant facts reach the people who need them.
4. **Decisions** — how decisions are made, owned, and delayed.
5. **Dependencies** — what blocks downstream valuable action.
6. **Uncertainty** — what must be true but has not yet been demonstrated.
7. **Feedback** — how the system detects error and updates behavior.

These flows are the stable conceptual backbone. Module boundaries may change during content validation.

## Target competencies

A learner completing the core PM curriculum should be able to:

### C1. System diagnosis
- define the project as a system producing an outcome;
- distinguish symptom, mechanism, systemic condition, and intervention;
- identify the flow in which a failure originates rather than only where it appears.

### C2. Outcome and value reasoning
- distinguish output from outcome;
- express causal assumptions between work and business/user effect;
- identify weak links in an outcome hypothesis.

### C3. Dependency and criticality reasoning
- model technical, organizational, decision, and external dependencies;
- reason about downstream impact rather than list priority;
- identify constraints and high-leverage nodes.

### C4. Flow management
- identify queues, work accumulation, batching, handoff loss, and bottlenecks;
- understand why local utilization can reduce system throughput;
- select interventions that improve flow rather than local productivity optics.

### C5. Uncertainty and risk
- make assumptions explicit;
- prioritize uncertainty by confidence, impact, and reversibility;
- design evidence-producing experiments before irreversible commitments.

### C6. Decision architecture
- identify decision rights and decision latency;
- design escalation and ownership mechanisms;
- separate reversible from difficult-to-reverse decisions.

### C7. Information and feedback
- identify missing, delayed, or distorted information;
- design feedback loops with clear consumers and decisions;
- distinguish status reporting from information that changes action.

### C8. Intervention design
- choose a management intervention based on mechanism rather than symptom;
- define expected effect, risk, early signal, and stop/change condition;
- review intervention results and update the mental model.

## Curriculum progression

The canonical progression is:

```text
Observe the system
→ Model causes and flows
→ Expose uncertainty and constraints
→ Choose an intervention
→ Collect evidence
→ Update the system
```

This progression matters more than preserving any historical module numbering.

## Module contract

Every production module must define:

- `id` and title;
- competency targets;
- prerequisite competencies, if truly required;
- 2–5 lessons with distinct learning outcomes;
- at least one decision drill;
- one integrative/boss case;
- one field application artifact or intervention;
- evidence criteria;
- expected learner effort;
- assessment rule for any claimed mastery.

## Lesson outcome contract

Each lesson outcome must use observable behavior. Prefer:

> "Given X project evidence, the learner can diagnose Y and choose Z with an explicit rationale."

Avoid outcomes such as:

- understand queues;
- learn dependencies;
- know risk management.

## Current prototype mapping

The existing prototype contains 10 modules and 20 lessons organized around the seven flows and adjacent system-management concepts. That content is treated as **candidate curriculum**, not automatically canonical curriculum.

Before migration to v1, each lesson must be audited against:

1. a target competency;
2. a unique learning outcome;
3. a valid decision/application activity;
4. evidence criteria;
5. redundancy with neighboring lessons.

Lessons that fail this audit should be merged, rewritten, or removed rather than migrated unchanged.

## Future curricula

The platform architecture should permit other professional curricula, but PMO01 core content remains a separately versioned curriculum package. Future programs must define their own competency maps rather than reuse the seven PM flows by default.
