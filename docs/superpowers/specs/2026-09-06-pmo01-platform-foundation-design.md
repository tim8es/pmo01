# PMO01 Platform Foundation Design

## Status

Proposed design approved in principle on 2026-09-06: evolve via **A → C** — preserve the current implementation as a reference prototype, validate learning mechanisms, then build a separate scalable v1 architecture from validated contracts.

This document is the current platform-foundation design. The earlier `2026-09-03-pmo01-v0-design.md` remains historical context and does not define the target architecture.

## Problem

PMO01 currently has useful product behavior but conflicting architectural direction:

- the working `main` branch is a static JavaScript application containing a broad PM curriculum, diagnostics, learner progress, notes, and tools;
- the historical V0 design proposed Astro, Markdown-first content, one FLOW module, and a smaller vertical slice.

Continuing the current implementation indefinitely would make content, learning logic, state, rendering, and future platform capabilities increasingly coupled. Rewriting immediately would risk designing around unvalidated assumptions.

## Decision

Adopt a staged architecture transition.

### A — Reference prototype

The current `main` implementation is retained as the reference implementation for product and learning validation.

It answers questions such as:

- Is the curriculum useful?
- Do learners understand the seven-flow model?
- Do application tasks transfer to real projects?
- Do diagnostics help choose a learning path?
- Which interactions change reasoning?

It is not the long-term platform architecture.

### C — Scalable v1

A separate v1 architecture will be implemented only after one representative module has validated learning outcomes, interactions, assessment, and field transfer.

V1 will separate:

1. content packages;
2. content validation/read model;
3. curriculum navigation;
4. learning-state runtime;
5. assessment/evidence logic;
6. learner persistence;
7. presentation.

Framework selection is deferred until the domain contracts are validated. Astro remains a candidate, not a decision.

## Product contract

The product exists to improve senior-level PM diagnosis and intervention reasoning under uncertainty.

The learner should progress from:

```text
task/status management
→ system diagnosis
→ mechanism reasoning
→ explicit trade-offs
→ evidence-producing intervention
→ reflection and model update
```

The platform is not primarily a Scrum/Jira/PMBOK tutorial or certification course.

Canonical product rules are in `docs/product/PRODUCT.md`.

## Learning architecture

The core learning loop is:

```text
Concept
→ Case
→ Decision
→ Feedback
→ Reflection
→ Transfer
→ Evidence
→ Updated mental model
```

Learning evidence progresses through:

- recognize;
- reason;
- apply;
- transfer.

Runtime state must not treat page visits as mastery.

Canonical runtime learning states are:

- `unseen`;
- `studied`;
- `applied`;
- `mastered`.

The exact mastery algorithm is deferred until evidence supports one.

See `docs/product/LEARNING_MODEL.md`.

## Curriculum architecture

The seven project flows remain the core PM diagnostic model:

- value;
- work;
- information;
- decisions;
- dependencies;
- uncertainty;
- feedback.

The stable contract is competency-based, not tied to the current 10-module numbering.

The existing 10 modules / 20 lessons are candidate curriculum. Before migration, each lesson must demonstrate:

- competency mapping;
- measurable outcome;
- non-redundant purpose;
- decision/application activity;
- evidence criteria.

See `docs/product/CURRICULUM.md`.

## Content architecture

Content becomes repository-native structured data rather than JavaScript runtime data.

Canonical entities:

- Program;
- Module;
- Lesson;
- Decision Drill;
- Integrative Case;
- Field Application;
- Artifact Template;
- Assessment Rubric.

Content must use stable IDs and version-aware references. Published IDs are never reused for a different concept.

V1 UI must consume a content interface rather than import lesson bodies from application source files.

See `docs/content/CONTENT_MODEL.md`.

## Target logical architecture

```text
Content package
      │
      ▼
validation/parser
      │
      ▼
Content service
      │
 ┌────┼─────────────┐
 ▼    ▼             ▼
Nav  Learning     Assessment
     runtime       domain
 └────┼─────────────┘
      ▼
Presentation
      │
      ▼
Learner repository
(local first; remote later if validated)
```

Key constraints:

- presentation does not own learning semantics;
- learner state is behind an interface;
- content storage format is behind an interface;
- diagnostics map to explicit competencies/flows;
- assessment feedback is deterministic/inspectable unless separately redesigned;
- AI cannot become the source of curriculum truth.

See `docs/architecture/ARCHITECTURE.md`.

## Product requirements

The scalable v1 must support:

1. structured content ingestion and validation;
2. curriculum navigation;
3. decision drills, integrative cases, field applications, and reflection;
4. multi-state learning progress;
5. persisted learner work through an isolated repository interface;
6. inspectable diagnostics;
7. accessibility/readability;
8. content version awareness;
9. minimum observability when an ethical/legal collection mechanism exists.

Explicitly deferred:

- authentication;
- cloud sync;
- CMS;
- payments;
- AI tutor;
- AI assessment;
- social/gamification engines;
- knowledge graphs;
- enterprise dashboards;
- native mobile applications.

See `docs/product/PRODUCT_REQUIREMENTS.md`.

## Validation design

The next implementation phase is not “build v1”. It is **validate one representative module end-to-end**.

Validation requires:

1. baseline case;
2. module learning experience;
3. integrative case;
4. real-project application;
5. rubric-based review;
6. qualitative friction/reasoning review;
7. delayed follow-up case when practical.

The goal is to identify which mechanisms deserve promotion into v1.

Primary success question:

> Can the learner make a better diagnosis and intervention decision after using the module?

See `docs/product/METRICS.md`.

## Migration design

Migration is vertical, not wholesale.

For the first migrated module:

1. validate learning outcomes and interactions in the prototype;
2. express the module in the canonical content model;
3. implement content validation;
4. implement minimum content service;
5. implement minimum learning runtime and learner repository;
6. reproduce drills/case/application in v1;
7. compare usability and learning evidence with the prototype;
8. fix architecture/content-contract failures;
9. only then migrate additional modules.

Prototype and v1 may coexist temporarily.

## Error handling

### Content integrity

Broken references, duplicate IDs, unknown competency mappings, and incompatible versions must fail validation before publication.

### Learner persistence

Persistence failures must not silently discard learner work. UI must preserve unsaved input where possible and surface a clear error.

### Unsupported content

If the v1 content runtime encounters an unsupported entity/version, it should fail explicitly during validation or render a controlled unavailable state rather than partially interpreting content.

## Testing design

V1 testing should prioritize domain contracts:

- schema/relationship validation;
- learning-state transition unit tests;
- diagnostic-rule unit tests;
- drill/case interaction tests;
- navigation integration tests;
- accessibility checks;
- a small number of end-to-end learning paths.

Large E2E coverage is deferred until contracts stabilize.

Prototype testing remains limited to defects that block learning validation.

## Documentation architecture

The following documents are required sources of truth:

- `docs/README.md` — documentation precedence and map;
- `docs/product/PRODUCT.md` — product contract;
- `docs/product/LEARNING_MODEL.md` — instructional model;
- `docs/product/CURRICULUM.md` — competencies and curriculum rules;
- `docs/product/PRODUCT_REQUIREMENTS.md` — staged product capabilities;
- `docs/product/METRICS.md` — learning/product validation;
- `docs/content/CONTENT_MODEL.md` — content entities and versioning;
- `docs/architecture/ARCHITECTURE.md` — architecture boundaries and migration;
- `docs/architecture/adr/0001-reference-prototype-to-v1.md` — accepted A → C decision;
- `docs/ROADMAP.md` — gated delivery sequence.

Documents that are intentionally deferred until their triggering phase:

- detailed v1 framework ADR;
- backend/auth architecture;
- analytics/event taxonomy;
- privacy/data-retention policy for server-side learner data;
- AI tutor/assessment policy;
- billing/entitlement model;
- CMS/editorial workflow;
- multi-tenant/enterprise model.

Creating these now would imply requirements that have not been validated.

## Acceptance criteria for platform foundation

The foundation design is complete when:

1. A → C is recorded as an accepted architecture strategy.
2. The reference prototype and target v1 are clearly distinguished.
3. Product purpose and non-goals are explicit.
4. The learning model separates study, application, and mastery.
5. Curriculum is competency-based and not coupled to historical module numbering.
6. Content has stable entities, IDs, and version rules.
7. Target architecture separates content, learning logic, persistence, and presentation.
8. Deferred capabilities are explicit.
9. Validation metrics and promotion gates are defined.
10. Roadmap starts with learning validation, not a framework rewrite.

## Next step after approval

After this foundation is reviewed and approved, create a detailed implementation plan for **Phase 1 — validate one representative module**.

Do not create a full v1 implementation plan yet. The v1 plan depends on evidence and domain-contract changes discovered during Phase 1.
