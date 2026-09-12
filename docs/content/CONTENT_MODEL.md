# PMO01 Content Model

## Goal

Separate learning content from presentation and runtime behavior so that curricula can evolve, be versioned, validated, and reused without editing application code.

## Canonical entities

### Program

A complete curriculum package.

Required fields:

```yaml
id: pm-core
version: 1
slug: project-management
locale: ru
status: draft | validated | published | retired
```

### Module

A coherent competency unit inside a program.

Required fields:

```yaml
id: flow-management
program: pm-core
order: 4
title: Flow management
competencies:
  - C4
estimated_minutes: 240
```

A module also references:

- lesson IDs;
- integrative case ID;
- field application ID;
- prerequisite competency IDs when necessary.

### Lesson

A focused learning unit with one primary outcome.

Required metadata:

```yaml
id: queues
module: flow-management
order: 2
title: Queues
estimated_minutes: 40
competencies:
  - C4
outcome: "Given delivery evidence, diagnose harmful queue formation and choose a first intervention."
status: draft | validated | published | retired
```

Canonical lesson content sections:

1. problem frame;
2. principle;
3. mental model;
4. mechanism;
5. failure pattern;
6. worked example;
7. decision drill references;
8. application task reference;
9. evidence criteria;
10. reflection prompt.

The storage format may use Markdown plus structured front matter. UI components must consume parsed content rather than import lesson text from application source files.

### Decision Drill

```yaml
id: queues-drill-01
competencies:
  - C4
scenario: ...
choices:
  - id: a
    text: ...
analysis:
  preferred_choice: b
  mechanism: ...
  tradeoffs: ...
  change_conditions: ...
```

A drill may have a preferred action, but feedback must explain context and trade-offs.

### Integrative Case

A multi-concept scenario used near the end of a module.

Required properties:

- case evidence;
- learner diagnosis prompt;
- intervention decision;
- rationale prompt;
- evidence/change-condition prompt;
- assessment rubric.

### Field Application

A task performed on a real or recent project.

Required properties:

- context requirement;
- action steps;
- expected artifact;
- evidence criteria;
- reflection prompts;
- privacy guidance when real work data is involved.

### Artifact Template

A reusable working document such as an assumption map or dependency map.

Templates are content assets, not hard-coded download strings in application code.

### Assessment Rubric

Rubrics define how reasoning or application is evaluated.

A rubric must contain observable dimensions rather than generic labels such as "good answer".

Example dimensions:

- mechanism identified;
- relevant evidence used;
- trade-offs acknowledged;
- intervention matches diagnosis;
- change condition stated.

## Learner-state entities

Content definitions must not contain learner state.

Learner state belongs to the learning runtime and references immutable content IDs.

Minimum conceptual state:

```ts
type LearningState =
  | 'unseen'
  | 'studied'
  | 'applied'
  | 'mastered';
```

Runtime records should be keyed by program version + content ID so future content changes do not silently corrupt historical progress.

## Versioning rules

1. Editorial correction with unchanged learning outcome may keep the same content version.
2. A changed learning outcome, rubric, or assessment semantics requires a new version.
3. Published IDs are stable and must not be reused for different concepts.
4. Retired content remains resolvable for historical learner records.
5. Migration between program versions must be explicit when accounts/server persistence exist.

## Validation rules

Before content is published, automated or editorial validation should verify:

- unique IDs;
- valid module/lesson references;
- valid competency references;
- deterministic ordering;
- required fields present;
- no broken drill/case/artifact references;
- no published lesson without a measurable outcome.

## V1 storage recommendation

Use structured Markdown/YAML or an equivalent repository-native content format first.

Do not introduce a CMS until authoring friction, multi-author workflows, publishing permissions, or content volume demonstrate the need.

The application must depend on a content interface, not on the repository storage format directly. This keeps a future CMS migration possible without rewriting learning UI.
