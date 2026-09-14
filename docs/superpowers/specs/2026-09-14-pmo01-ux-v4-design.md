# PMO01 UX v4 — Course Journey Design

## Goal
Make PMO01 feel like one coherent practical course rather than a collection of independent surfaces. The learner should always understand where they are, what to do next, why it matters, and how practice connects to the current module.

## Product hierarchy
The learner-facing hierarchy is:

**Course → Module → Lesson → Practice → Final case**

The following are supporting mechanisms, not top-level product destinations: company context, notes, project map, mastery evidence, diagnostics, simulator internals, validation internals.

## Global navigation
Top-level navigation is reduced to:
- Главная
- Учебный путь
- Самопроверка
- Инструменты

The M01 simulator is removed from global navigation. It is presented inside M01 as **Итоговый кейс M01**. Internal routes and storage identifiers stay unchanged for compatibility.

## Returning learner home
The first viewport must answer exactly three questions:
1. Где я?
2. Что делать сейчас?
3. Что будет дальше?

Primary home content:
- current module and module outcome;
- current lesson, lesson position, and overall course progress;
- one primary CTA to continue;
- one compact “Дальше” row showing either the next lesson or the M01 final case when both M01 lessons are complete.

Secondary home content appears below the fold:
- a compact 10-module progress path;
- optional saved work/resources, without large competing cards.

Mastery, Project Map, Decision Journal, and final case are not separate hero cards on home.

## M01 module structure
M01 explicitly shows three sequential steps:
1. Проект как система
2. Диагностика системы
3. Итоговый кейс M01

The final case is unlocked visually after both M01 lessons are complete, but the existing simulator route remains technically reachable so validation flows are not broken. The course UI must communicate that the case is the final application step for M01, not a separate course feature.

## Final case framing
Learner-facing terminology is **Итоговый кейс M01**. “Mission” may remain in internal IDs and validation code only.

Briefing explains what the learner is expected to demonstrate:
- distinguish symptom from mechanism;
- make decision interfaces explicit;
- manage reversible vs irreversible scope;
- revise a diagnosis when falsifying evidence appears.

Company scale remains selectable before the run and changes context/lenses only, not hidden scoring.

## Final case learning payoff
The review screen becomes an after-action review. For each of the four decisions it shows:
- learner choice;
- observed consequence;
- strongest reference move;
- why it is stronger;
- the PM principle being tested;
- lesson linkage (M01.1 or M01.2).

The review is educational feedback, not a numeric grade. Existing trajectory meters remain as context but are secondary.

At the end show:
- demonstrated strengths;
- one or two improvement areas derived from decisions/flags;
- CTA back to M01 / next module;
- validation/post-case link only as a secondary compatibility action when needed by the experiment flow.

## Content principles
- Prefer plain learner language over platform terminology.
- “Mastery”, “Decision Journal”, “Project Map”, “mission”, “post-case”, and “evidence” should not dominate navigation or primary copy.
- Every practice element must explain its purpose.
- Reference answers remain optional and appear after the learner attempts the task.

## Technical boundaries
- Do not change simulator treatment ID, version, storage key, route, decision IDs, decision effects, validation storage, or cohort gates.
- No network calls or telemetry.
- Preserve small / medium / large company contexts.
- Preserve current lesson completion logic.
- Prefer removing obsolete enhancement behavior over stacking another visual dashboard layer.

## Success criteria
- No learner-facing simulator link in global navigation.
- Returning home has one dominant continuation action and no large mastery/project/journal/simulator card grid.
- M01 course path clearly contains the final case as step 3.
- Simulator briefing uses “Итоговый кейс M01”.
- Final review contains actionable reference feedback for all four decisions and links feedback to M01 skills/lessons.
- Existing simulator/validation contracts continue to pass.