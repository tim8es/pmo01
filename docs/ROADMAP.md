# PMO01 Roadmap

## Strategy

PMO01 evolves through validation gates, not feature accumulation.

```text
Reference prototype
→ learning validation
→ content contract validation
→ v1 architecture decision
→ one-module vertical migration
→ measured parity/improvement
→ broader migration
→ optional platform expansion
```

## Phase 0 — Stabilize the reference prototype

Goal: make the existing product reliable enough to use as a learning experiment without turning it into the permanent architecture.

Deliverables:

- current product behavior documented;
- current curriculum treated as candidate content;
- no major new platform subsystems added;
- obvious prototype-breaking defects fixed when they block validation;
- a small set of representative learning paths selected for testing.

Exit gate:

- the prototype can support a learner through at least one complete module without critical usability/data-loss issues.

## Phase 1 — Validate the learning model

Goal: determine which learning mechanisms actually improve PM reasoning and transfer.

Deliverables:

- select one representative module;
- audit lesson outcomes against `CURRICULUM.md`;
- improve at least one decision drill;
- create or validate one integrative case;
- create one real-project field application;
- define a rubric;
- run learner tests using the protocol in `METRICS.md`.

Exit gate:

- evidence indicates the module format can reveal and improve reasoning, not merely deliver content;
- major interaction/content failures are known;
- the validated module can be represented by `CONTENT_MODEL.md` without ad hoc exceptions.

## Phase 2 — Freeze v1 domain contracts

Goal: define the minimum stable contracts that implementation may depend on.

Deliverables:

- final v1 content schema;
- stable content IDs/version rules;
- learning-state transition model;
- assessment/rubric model;
- learner repository interface;
- diagnostic mapping contract;
- migration rules from prototype content/state where relevant.

Exit gate:

- contracts can represent the validated module end-to-end;
- unresolved questions are implementation details, not domain ambiguity.

## Phase 3 — Select v1 technical architecture

Goal: choose framework and deployment architecture based on validated requirements.

Deliverables:

- compare candidate approaches;
- architecture ADR;
- repository/file structure;
- build/test/deploy strategy;
- performance/accessibility constraints;
- plan for local persistence and future remote persistence boundary.

Likely candidates may include Astro or another TypeScript static-first framework, but no framework is selected by this roadmap.

Exit gate:

- selected architecture implements the domain contracts without coupling content to presentation;
- migration cost is understood;
- no deferred subsystem has been smuggled into v1 requirements.

## Phase 4 — Build one-module v1 vertical slice

Goal: prove the target architecture with one validated module.

Deliverables:

- content validation pipeline;
- content service;
- curriculum navigation;
- learning runtime;
- learner repository implementation;
- decision drill interaction;
- integrative case interaction;
- field application workflow;
- accessibility and core tests;
- deployment.

Exit gate:

- the validated module works end-to-end in v1;
- learner experience is at least as good as the prototype;
- content can be edited without touching UI runtime code;
- state transitions and content relationships have automated tests.

## Phase 5 — Migrate validated PM curriculum

Goal: move only content that passes curriculum and learning-quality audits.

Process per module:

1. audit outcomes and competency mapping;
2. remove duplication;
3. validate drills/cases/application;
4. convert to canonical content model;
5. migrate assets/templates;
6. test content integrity;
7. publish;
8. compare learner behavior/feedback with prototype where possible.

Exit gate:

- all production modules satisfy curriculum/content contracts;
- prototype is no longer required for validated PM paths.

## Phase 6 — Introduce server-backed learner state only if needed

Possible triggers:

- cross-device progress is a validated retention need;
- learner work must persist beyond one browser;
- authenticated cohorts/organizations are required;
- analytics require durable learner/event identity;
- paid product requires account entitlement.

Deliverables require a separate spec/ADR.

## Phase 7 — Optional intelligence and scale features

Only after core learning quality and state model are stable, evaluate separately:

- AI tutor;
- AI-assisted rubric feedback;
- adaptive review;
- personalized sequencing;
- multi-program catalog;
- team/enterprise learning;
- authoring/CMS workflows;
- payments/certificates.

Each is an independent product decision, not a default consequence of “scaling”.

## Current gate — complete Phase 1 with real learner evidence

The platform foundation and the technical M01 validation slice are prepared for review. The remaining Phase 1 gate is empirical, not architectural.

Before Phase 2 begins:

1. run at least 5 completed M01 learner sessions using `docs/validation/M01-VALIDATION-PROTOCOL.md`;
2. record each session with `docs/validation/M01-SESSION-RECORD-TEMPLATE.md`;
3. review diagnostic reasoning delta, field transfer, reflection quality, interaction usefulness, reliability/friction, and content-model fit;
4. record one explicit cohort decision with `docs/validation/M01-COHORT-REVIEW-TEMPLATE.md`:
   - **Promote to Phase 2**;
   - **Revise and retest**;
   - **Reject mechanism**.

`docs/validation/M01-READINESS-AUDIT.md` documents the current curriculum/content-contract fit before learner testing.

Do not freeze v1 domain contracts, select a framework, or start a v1 migration until the cohort decision is **Promote to Phase 2**.
