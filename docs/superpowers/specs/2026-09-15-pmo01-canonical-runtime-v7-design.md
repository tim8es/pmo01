# PMO01 Canonical Runtime v7 — Design

## Problem

The failed v6 attempt still left `app.js` as the authoritative renderer and then replaced parts of its DOM afterward. Any route/state re-render could therefore reintroduce the old UI before the overlay caught up. This produced visual regression, flicker, inconsistent state, and competing UX semantics.

## Goal

Replace the layered presentation architecture with a single canonical course runtime. The runtime must own routing, rendering, learner state, lesson completion, competency progress, and module-practice progression directly. No post-render DOM replacement, MutationObserver-driven page rewrites, or multiple home/course renderers.

## Architecture

### Canonical runtime

`app.js` becomes the only renderer/router for the course shell (`#/`, `#/course`, `#/lesson/:id`, `#/practice/:module`, `#/diagnostic`, `#/toolkit`).

Specialized M01 validation and standalone simulator remain isolated extensions/pages because their treatment contract is experimental and already tested. They must not mutate normal course routes.

### Data before UI

Course content and practice metadata are normalized before `app.js` loads:

1. `course-data.js`
2. `content-overrides.js`
3. M01/M02 lab data
4. guided-case/reference data
5. full-course learning-lab normalizer
6. mastery domain
7. module-practice domain
8. `app.js`

Presentation overlays (`learning-experience-v2.js`, `guided-practice-v2.js`, `course-clarity-v3.js`, `skill-first-ui-v5.js`, challenge overlay runtime) are not loaded.

### One lesson loop

All 20 lessons expose one `learningLab` contract and render through one function:

`mission → cold decision → feedback → worked example → technique → second decision → workbook evidence → transfer`

Completion requires required decision answers plus required workbook fields. Raw `completed` flags never bypass current evidence.

### One module loop

Every module is shown as:

`lesson 1 → lesson 2 → final practice`

M01 final practice is the existing pinned simulator. M02–M10 use deterministic module-practice data. Module practice is rendered by `app.js`, not by an independent router.

### Mastery

Seven competencies use four evidence-derived states:

`Не встречал → Понял → Применил → Доказал`

No XP, streaks, coins, leaderboards, or mutable score balance. Practice proof can only advance the skill(s) explicitly tested by that practice.

### Home

Returning-home screen has one dominant continuation:

- current module/step
- current skill and level
- next evidence required
- one primary CTA
- compact seven-skill map

Course percentage is secondary.

### Course path

Each module card shows the three real steps and their state. No duplicate dashboards or competing concepts.

### Theme

Theme handling is a small isolated runtime that only manages light/dark preference and never rewrites course DOM.

## Migration and compatibility

- Keep existing `pm01-state-v1` and M01 simulator/validation storage keys.
- Reuse M02 v5 learning-lab content and existing guided/reference content for M03–M10.
- Preserve exact M01 treatment ID/version, decisions, effects, scoring, validation blindness, and cohort contracts.
- Preserve earned module-practice proof monotonically across retries.
- Do not add network calls or telemetry.

## Acceptance criteria

1. `index.html` loads exactly one course presentation runtime: `app.js`.
2. No loaded script uses MutationObserver or rewrites home/course/lesson DOM after `app.js` renders.
3. All 20 lessons use the same Learning Lab renderer and evidence gate.
4. M02–M10 final practices are routed and rendered inside `app.js`.
5. M01 remains pinned and validation-compatible.
6. Home/course/sidebar all read the same mastery and progression state.
7. Full regression suite passes.
8. Production Pages deploy is verified on the exact merge SHA.
9. Browser QA must be performed before calling the redesign successful; until then, report it as technically deployed but visually unverified.
