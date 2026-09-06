# PMO01 Product Contract

## Product purpose

PMO01 is a learning platform for developing senior-level Project Management judgment through diagnosis, decisions, field application, and reflection.

It is not primarily a reference library, certification-prep course, or tool tutorial.

## Core promise

Help a learner move from managing tasks and ceremonies to diagnosing projects as systems and making higher-quality management decisions under uncertainty.

## Primary learner

PMO01 initially targets working or recently working project/process/delivery managers who already understand basic PM vocabulary and want to improve decision quality, systems thinking, and practical execution.

V1 must not require that the learner works in a specific framework such as Scrum, Kanban, SAFe, or PMBOK.

## Job to be done

When a project becomes delayed, uncertain, overloaded, politically difficult, or hard to diagnose, the learner should be able to:

1. identify the system mechanism producing the visible symptom;
2. distinguish output from outcome;
3. surface assumptions and uncertainty;
4. reason about dependencies, queues, constraints, decision latency, and feedback;
5. choose an intervention with explicit trade-offs;
6. collect evidence from the real project;
7. update the diagnosis after observing the result.

## Product principles

1. **Decision quality over content consumption.** Reading does not equal mastery.
2. **Real-project transfer over trivia.** Exercises should connect to work the learner actually manages.
3. **Systems thinking over ceremony memorization.** Frameworks are tools, not the organizing model.
4. **Evidence over confidence.** Completion and mastery must be tied to observable evidence where possible.
5. **Reflection over correctness theater.** Plausible trade-offs are more useful than simplistic green/red answers.
6. **Content and learning engine are separate.** The platform must support future curricula without rewriting the application.
7. **Quiet interface.** Editorial readability and reasoning take precedence over decorative gamification.
8. **Progressive architecture.** Do not introduce backend, AI, accounts, or generalized engines before a validated need exists.

## Product boundaries

### In scope for the PM curriculum
- systems diagnosis;
- value and outcomes;
- dependencies and flow;
- uncertainty and risk;
- decision architecture;
- information and feedback;
- operating mechanisms;
- interventions and learning loops.

### Not the primary focus
- Jira usage;
- Scrum role memorization;
- PMBOK terminology drills;
- generic productivity advice;
- motivational content;
- certification exam preparation.

## Platform ambition

PMO01 should eventually support multiple professional learning programs while keeping the first PM curriculum coherent and deep.

Possible future curricula may include Product Management, Team Leadership, Process Management, and AI-enabled management, but none are v1 requirements.

## Current product state

The current `main` branch is a reference prototype containing a static browser application, 10 modules / 20 lessons, seven-flow diagnostics, local progress and notes, and a toolkit.

This prototype is used to validate product and learning assumptions. It is not the target architecture.

## Definition of product success

PMO01 succeeds if learners can demonstrate better project diagnosis and intervention reasoning after using the platform, not merely finish lessons.

The validation model is defined in `METRICS.md`.
