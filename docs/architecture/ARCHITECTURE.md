# PMO01 Architecture

## Architecture status

PMO01 currently has two architectural descriptions:

1. the working static prototype on `main`;
2. the historical V0 Astro design spec.

Neither is automatically the target v1 architecture.

The accepted strategy is **A → C**:

- preserve the current prototype as a product/learning reference;
- validate useful mechanisms;
- design a scalable v1 architecture from validated requirements;
- migrate selectively.

## Current reference prototype

Current implementation characteristics:

```text
index.html
   ↓
app.js
   ├── routing
   ├── rendering
   ├── learner state
   ├── diagnostics
   ├── interaction binding
   └── toolkit behavior

course-data.js
   ├── flows
   ├── modules
   ├── lessons
   ├── diagnostics
   └── tools

localStorage
   └── learner progress / notes / diagnostic answers
```

Strengths:

- extremely low operational complexity;
- deployable as static files;
- useful as a learning-format prototype;
- no backend dependency;
- fast to change during discovery.

Scaling constraints:

- content is embedded in JavaScript application data;
- routing, rendering, interaction logic, and learner state are concentrated in one application file;
- binary completion cannot represent stronger learning evidence;
- no explicit content version model;
- diagnostics are coupled directly to prototype data structures;
- adding many programs or authors would increase coupling and review risk;
- server-backed identity, sync, analytics, or AI would require new boundaries rather than incremental additions inside `app.js`.

## Architectural principles for v1

1. **Content is data, not application code.**
2. **Learning domain logic is independent from page rendering.**
3. **Learner state is behind an interface.** Local and remote persistence must be replaceable.
4. **Content IDs and versions are stable.**
5. **Static-first delivery remains preferred while requirements permit it.**
6. **Interactive behavior is introduced only where learning needs it.**
7. **AI is an optional adapter, not the source of curriculum truth.**
8. **Framework choice follows validated product requirements.** Do not select v1 technology solely because the old V0 spec named Astro.

## Target logical architecture

```text
                    ┌─────────────────────┐
                    │   Content packages  │
                    │ programs/modules/...│
                    └──────────┬──────────┘
                               │ validate/parse
                    ┌──────────▼──────────┐
                    │   Content service   │
                    │ stable read model   │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
┌─────────▼────────┐ ┌─────────▼────────┐ ┌────────▼─────────┐
│ Learning runtime│ │ Curriculum nav    │ │ Assessment logic │
│ state transitions│ │ sequence/context  │ │ rubrics/evidence │
└─────────┬────────┘ └─────────┬────────┘ └────────┬─────────┘
          └────────────────────┼────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Presentation layer  │
                    │ pages/components/UI │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Learner repository │
                    │ local or remote     │
                    └─────────────────────┘
```

## Core boundaries

### 1. Content package

Owns curriculum definitions and editorial material.

Does not own:

- learner progress;
- UI components;
- authentication;
- analytics transport.

### 2. Content service

Consumes validated content definitions and exposes a stable application-facing interface.

Examples of conceptual reads:

```ts
getProgram(programId)
getModule(moduleId)
getLesson(lessonId)
getNextLearningUnit(currentId)
getAssessment(assessmentId)
```

Storage format is hidden behind this boundary.

### 3. Learning runtime

Owns state transitions and rules such as:

- studied;
- applied;
- mastered;
- recent activity;
- evidence references.

It must not render HTML or know where content files live.

### 4. Assessment domain

Owns decision drills, case responses, rubrics, and evidence semantics.

Automated scoring is optional. The model must allow human/self/AI-assisted evaluation later without redefining content IDs.

### 5. Learner repository

Persistence interface for progress, responses, and notes.

Initial implementations may use browser storage. Future implementations may use a backend.

The UI must not call `localStorage` directly.

### 6. Presentation layer

Owns navigation, reading experience, controls, feedback presentation, and accessibility.

It consumes domain interfaces and does not define curriculum semantics.

## Data flow

### Lesson load

```text
route
→ content service resolves lesson
→ runtime loads learner state
→ page renders lesson + state
```

### Decision drill

```text
learner selects action
→ assessment domain records response
→ feedback model resolves analysis
→ learner repository persists response
→ UI displays mechanism/trade-offs
```

### Field application

```text
application task
→ learner creates evidence / response
→ repository stores reference or content
→ assessment/runtime updates applied state when criteria are met
```

## Error handling principles

V1 should fail explicitly for content-integrity errors.

Examples:

- duplicate IDs;
- missing referenced drill;
- invalid module order;
- unknown competency reference;
- incompatible content version.

These should fail build/publish validation rather than produce broken learner pages.

Runtime persistence failures should preserve the learning page and surface a clear state-saving error rather than discard learner input silently.

## Technology decision

No final v1 framework is accepted yet.

The historical Astro recommendation remains a candidate because static-first content and interactive islands fit the product well, but framework selection should be made in a dedicated architecture decision after the validation gate.

Candidate evaluation criteria:

- content pipeline quality;
- static generation;
- TypeScript support;
- accessibility ergonomics;
- testability;
- deployment portability;
- incremental interactivity;
- migration cost from the prototype;
- future support for authenticated/server-backed features without corrupting domain boundaries.

## Migration strategy

Do not rewrite the entire prototype before validation.

Migration should happen vertically:

1. select one validated module;
2. express it in the canonical content model;
3. implement content validation;
4. implement the minimum learning runtime;
5. reproduce its learning experience in v1;
6. compare behavior and usability;
7. only then migrate remaining validated modules.

The reference prototype remains available for comparison until v1 reaches functional parity for validated learning paths.

## Testing architecture

Required test layers for v1:

- content schema/relationship validation;
- unit tests for learning-state transitions;
- unit tests for diagnostic recommendation rules;
- interaction tests for drills/cases;
- navigation integration tests;
- a small number of end-to-end learner paths;
- accessibility checks for interactive controls.

Do not build a large E2E suite before domain contracts stabilize.
