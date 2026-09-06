# PMO01 Product Requirements

## Scope model

PMO01 evolves through explicit validation gates. Requirements are separated into:

- **Reference prototype requirements** — what the current implementation is allowed to prove.
- **V1 core requirements** — what the first scalable architecture must support.
- **Deferred capabilities** — features that require evidence before implementation.

## Reference prototype

The prototype exists to validate learning format and curriculum assumptions.

Required behavior:

- present PM learning content in a readable editorial interface;
- support navigation across the current curriculum;
- store lightweight progress locally;
- store learner notes locally;
- provide a diagnostic starting point;
- expose reusable field-work templates;
- support real-project application tasks;
- remain deployable as a static site.

The current implementation already demonstrates most of this behavior.

## V1 core capabilities

### P1. Structured content ingestion

The application must load program/module/lesson/case/drill/artifact definitions through a validated content interface.

Acceptance conditions:

- UI code contains no lesson body text;
- invalid content references fail validation before publication;
- one content package can be replaced by another without changing core learning UI.

### P2. Curriculum navigation

The learner can:

- browse programs, modules, and lessons;
- continue from recent work;
- understand what a module develops;
- see prerequisite guidance when it materially affects learning.

### P3. Learning interactions

The runtime supports at minimum:

- decision drills;
- integrative cases;
- field application prompts;
- reflection prompts;
- rubric-based assessment data structures.

Not every assessment must be automatically scored.

### P4. Progress model

The product must distinguish engagement from learning evidence.

Minimum states:

- unseen;
- studied;
- applied;
- mastered.

V1 may initially support only part of the transition logic, but the data model must not collapse these states into a single completion boolean.

### P5. Learner work

The learner can persist:

- notes;
- drill/case decisions where useful;
- field application artifacts or structured responses;
- progress state.

The first scalable release may still store data locally if validation does not yet require accounts. Storage implementation must be isolated behind an interface.

### P6. Diagnostics

Diagnostics may recommend where to start or what to revisit.

Requirements:

- recommendation logic is inspectable and deterministic unless explicitly redesigned;
- diagnostic result is described as guidance, not proof of mastery;
- diagnostic questions map to competencies or flows.

### P7. Accessibility and readability

The learning experience must support:

- keyboard navigation for interactive controls;
- readable narrow and wide layouts;
- semantic document structure;
- visible focus states;
- sufficient text contrast;
- no essential information conveyed by color alone.

### P8. Content version awareness

Learner state must reference stable content IDs and program/content versions so future curriculum changes do not silently rewrite historical meaning.

### P9. Observability

Before large-scale growth work, the product must be able to observe the minimum learning funnel defined in `METRICS.md`.

Instrumentation can be added only when there is a deployment model that can collect data ethically and legally.

## Deferred capabilities

Do not implement these without a separate decision/spec:

- accounts and authentication;
- cloud sync;
- team/organization dashboards;
- payments;
- CMS;
- AI tutor;
- AI assessment;
- social features;
- leaderboards;
- XP/currency systems;
- generalized knowledge graph;
- adaptive sequencing engine;
- native mobile applications;
- certificates;
- enterprise reporting.

## Quality attributes

### Maintainability
- content is separated from runtime;
- domain modules have explicit interfaces;
- no single application file owns routing, rendering, learner state, and learning logic at scale.

### Portability
- core content and learning model should not depend on GitHub Pages;
- hosting can change without rewriting curricula.

### Testability
- content validation is automated;
- learning-state transitions are unit-testable;
- drill/case behavior is testable independently from full-page rendering;
- critical navigation paths have integration coverage.

### Performance
- static content should render with minimal client JavaScript;
- interactive code should load only where required where practical;
- performance budgets should be defined when the v1 framework is selected.

## Release gate for scalable v1

Do not start broad feature expansion until:

1. the prototype learning format has been tested with real learners;
2. at least one module has validated drills, integrative assessment, and field transfer;
3. the canonical content model is stable enough to represent that module without special cases;
4. migration requirements are known;
5. the target architecture has an accepted ADR/spec.
