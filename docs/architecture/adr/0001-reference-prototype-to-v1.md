# ADR 0001 — Evolve from Reference Prototype to Scalable V1

- Status: Accepted
- Date: 2026-09-06

## Context

PMO01 has a working static prototype on `main` and a historical V0 design that proposed Astro, Markdown-first content, and a single FLOW vertical slice.

The working prototype moved beyond that V0 scope: it contains a broader curriculum, diagnostics, local learner state, notes, and tools. At the same time, its implementation couples content, routing, rendering, learner state, and interactions too tightly for long-term multi-program growth.

Three options were considered:

### Option A — Keep evolving the current prototype

Advantages:

- low immediate cost;
- preserves working behavior;
- fastest path for experiments.

Disadvantages:

- increasing coupling;
- difficult content/version management;
- poor foundation for accounts, richer assessment, multiple curricula, or teams;
- high risk of turning prototype structure into permanent architecture.

### Option B — Return to the historical V0 Astro design

Advantages:

- simpler vertical slice;
- clean static/content-first direction.

Disadvantages:

- discards useful work and product discoveries;
- treats an older design document as more authoritative than observed prototype requirements;
- framework choice precedes renewed validation.

### Option C — Immediately rewrite as a scalable v1

Advantages:

- strongest theoretical separation of concerns;
- removes prototype constraints early.

Disadvantages:

- high overengineering risk;
- architecture could encode unvalidated learning interactions;
- migration scope is large before the product has proven what must be retained.

## Decision

Use **A → C**.

1. Preserve the current `main` implementation as a **reference prototype**.
2. Stop treating prototype architecture as the default place for long-term expansion.
3. Validate learning format, curriculum elements, diagnostics, and interactions with real users.
4. Define stable product, learning, content, and data contracts.
5. Design scalable v1 after those contracts are sufficiently validated.
6. Migrate vertically, starting with one validated module.
7. Retire prototype behavior only after v1 reproduces or improves the validated learning experience.

## Consequences

### Positive

- avoids throwing away working product evidence;
- delays irreversible architecture decisions;
- provides a controlled migration path;
- makes content and learning logic first-class domains;
- enables future programs without making them current requirements.

### Negative

- two implementations may coexist temporarily;
- some prototype work will not be migrated;
- short-term feature requests may need to be rejected if they deepen prototype coupling;
- migration requires explicit comparison and content audit.

## Guardrails

Until a v1 architecture spec is accepted:

- do not add backend/auth/CMS/AI architecture to the prototype;
- do not expand `course-data.js` as if it were the permanent content system;
- do not turn `app.js` into a generalized platform runtime;
- prototype-only experiments are allowed when cheap and reversible;
- new prototype work should be justified by a validation question.

## Revisit conditions

Revisit this ADR only if:

- the reference prototype proves inadequate even for validation;
- a hard external requirement forces server-backed functionality before the validation gate;
- the content model cannot represent a validated learning module without major special cases;
- evidence shows a different product direction.
