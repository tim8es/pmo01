# PMO01 Canonical Runtime v7 — Implementation Plan

## Objective

Replace the layered course UI with one canonical renderer/router and preserve M01 validation compatibility.

## Task 1 — RED contracts

- Add `tests/canonical-runtime-v7.test.js`.
- Assert `index.html` does not load `learning-experience-v2.js`, `guided-practice-v2.js`, `course-clarity-v3.js`, `skill-first-ui-v5.js`, `m02-challenge-v5.js`, or `ux-enhancements.js`.
- Assert all 20 lessons receive one `learningLab` contract before `app.js` loads.
- Assert `app.js` owns `#/practice/:module` routing and renders module practices itself.
- Assert raw completion cannot bypass Learning Lab evidence.
- Assert home/course/sidebar consume the same mastery domain.
- Assert M01 treatment ID/version remain unchanged.

## Task 2 — Data normalization

- Reintroduce the proven non-presentation portions from the failed v6 attempt:
  - full-course Learning Lab normalizer
  - full-course mastery domain
  - deterministic module-practice data/domain
  - isolated theme runtime
- Do not load any v6/v5/v3/v2 course presentation layer.

## Task 3 — Canonical `app.js`

Rewrite the base course renderer so it directly owns:

- home
- course path
- lesson rendering
- module practice rendering for M02–M10
- diagnostic/toolkit
- sidebar/mastery progress
- mobile navigation

Keep M01 validation route reserved for its existing extension. Link M01 final practice to the standalone pinned simulator.

## Task 4 — Canonical visual system

- Add one scoped course stylesheet for the canonical surfaces.
- Remove loaded legacy enhancement styles that alter course page hierarchy.
- Preserve simulator/validation styles only where those surfaces need them.
- Include responsive/mobile rules and visible focus states.

## Task 5 — Regression and review

- Run syntax and full `node --test tests/*.test.js`.
- Compare branch to main; ensure no M01 data/domain/validation mutations.
- Open PR, require PR-context CI success.
- Merge with exact-head guard.
- Require production CI + Pages success on merge SHA.

## Task 6 — Browser QA gate

Before describing the redesign as visually successful, verify production through a real browser workflow on:

- home (fresh and returning)
- course path
- M01 lesson
- representative M02 and M06 lessons
- M02 module practice
- standalone M01 simulator
- mobile viewport
- light/dark theme

If browser automation is unavailable in the current execution environment, explicitly report that as the remaining gate instead of asserting visual quality.
