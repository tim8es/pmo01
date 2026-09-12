# PMO01 Learning Model

## Learning objective

PMO01 is designed to change how a learner diagnoses and manages projects, not only what they can recall.

The core instructional loop is:

```text
Concept
  ↓
Case
  ↓
Decision
  ↓
Feedback
  ↓
Reflection
  ↓
Transfer to a real project
  ↓
Evidence
  ↓
Updated mental model
```

## What counts as learning

A learner has not mastered a concept because they opened a page or selected the expected answer.

Evidence of learning should progress through four levels:

1. **Recognize** — identify the concept in a described situation.
2. **Reason** — explain mechanism, consequences, and trade-offs.
3. **Apply** — use the concept in an unfamiliar case.
4. **Transfer** — apply it to a real project and produce evidence from the intervention.

The platform may track completion before it can reliably track mastery, but it must not label page visits as mastery.

## Canonical lesson sequence

A lesson should normally contain:

1. **Problem frame** — why the concept matters.
2. **Principle** — the central claim.
3. **Mental model** — a reusable representation.
4. **Mechanism** — why the system behaves this way.
5. **Failure pattern** — a plausible but weak management response.
6. **Worked example** — the model applied to a concrete situation.
7. **Decision drill** — a realistic choice with consequences and trade-offs.
8. **Application task** — work on the learner's own project.
9. **Evidence criteria** — observable conditions for claiming the task was completed.
10. **Reflection prompt** — what changed in the learner's model or next decision.

Not every lesson needs separate UI blocks for all ten stages. The sequence is an instructional contract, not a layout requirement.

## Decision drills

Decision drills are not trivia questions.

A valid drill:

- describes a realistic project situation;
- provides multiple plausible actions;
- forces prioritization or trade-offs;
- reveals analysis after the learner chooses;
- explains downstream consequences;
- can have a preferred action without pretending all ambiguity disappears.

A weak drill asks for a definition or rewards superficial recall.

## Boss cases / integrative cases

Each module should end with an integrative case that combines multiple concepts from the module.

A boss case should require the learner to:

1. diagnose the system;
2. identify missing or misleading evidence;
3. choose an intervention;
4. explain why competing interventions are weaker or premature;
5. state what evidence would cause them to change course.

## Field practice

Every module should produce at least one reusable artifact or intervention on a real or recent project.

Examples:

- system map;
- assumption map;
- dependency graph;
- decision-latency map;
- experiment design;
- feedback-loop design;
- operating rule;
- intervention review.

The artifact exists to improve a decision, not to satisfy a template requirement.

## Feedback model

Feedback should explain:

- what mechanism the learner noticed or missed;
- what trade-off their action creates;
- what evidence matters next;
- what alternative action becomes appropriate under different conditions.

Avoid celebratory correctness UI as the primary signal of learning.

## Mastery model

V1 should separate these states:

- `unseen` — not engaged with;
- `studied` — lesson completed;
- `applied` — application task submitted or explicitly evidenced;
- `mastered` — demonstrated reasoning/application under a defined assessment rule.

The exact mastery algorithm is intentionally deferred until PMO01 has enough evidence to define it without fake precision.

## Spacing and retrieval

For scalable v1, the content model must permit later addition of spaced review and retrieval practice. These are optional future capabilities, not requirements for the reference prototype.

If added, review should target mental models and decisions, not rote terminology.

## Personalization

Personalization should eventually adapt sequence, examples, and review based on demonstrated gaps. It must not replace the curriculum's competency model with opaque AI recommendations.

The diagnostic can recommend a starting point, but diagnostic scores are hypotheses about learning needs, not proof of competence.

## Learning-quality gate

Before a learning interaction is promoted into scalable v1, it should pass three questions:

1. Does it expose a meaningful reasoning difference between stronger and weaker PM judgment?
2. Does the feedback explain mechanism and trade-offs rather than only the expected answer?
3. Can the learner transfer the idea to a different case or real project?

If not, the interaction should be revised or removed.
