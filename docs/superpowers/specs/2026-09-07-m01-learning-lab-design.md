# M01 Learning Lab Design

## Goal
Turn M01 from a reading page with checkbox self-attestation into a compact decision-training lab that teaches, checks, and transfers project-system diagnosis skills.

## Scope
- Redesign only M01 (`project-system`, `system-diagnostic`) as the reference vertical slice.
- Preserve the existing sequential learning path and lesson URLs.
- Reuse existing M01 validation drills and feedback where they fit.
- Add in-lesson interactive workbook state stored locally in the browser.
- Fix readability/contrast problems across the current art direction.
- Do not change `main`, telemetry, or M02-M10 content in this iteration.

## Learning loop
Each M01 lesson follows one visible sequence:

1. **Cold case** — learner sees a realistic situation before explanation.
2. **Decision** — learner chooses or writes an initial diagnosis.
3. **Feedback** — immediate explanation of why the choice is strong or weak.
4. **Worked example** — concise expert reasoning, not a long lecture.
5. **Technique** — one reusable method with an explicit procedure.
6. **Guided drill** — another case with feedback.
7. **Workbook** — learner applies the technique in structured fields.
8. **Transfer** — learner uses the same structure on a real project.
9. **Exit check** — lesson completion requires a substantive drill plus workbook evidence, not checkbox self-attestation.

## M01 lesson design

### Lesson 1 — Смотри на проект целиком
Skill: distinguish task symptoms from the execution system and identify the highest-leverage broken flow.

Technique: **Seven-flow scan**
- Outcome
- Value
- Work
- Information
- Decisions
- Dependencies
- Uncertainty
- Feedback

Interactive workbook:
- Observable outcome
- Facts by flow
- Main break
- Why this break matters
- Earliest useful signal

Cold/guided drill: reuse the existing `m01-drill-system` scenario and feedback.

### Lesson 2 — Сначала найди причину
Skill: build a causal chain and choose an intervention that changes a reproducible mechanism rather than treating the visible symptom.

Technique: **Symptom → Mechanism → System condition → Intervention → Early signal**

Interactive workbook:
- Symptom
- Evidence
- Mechanism
- System condition
- Intervention
- Early signal

Cold/guided drill: reuse `m01-drill-diagnostic` and relevant rubric language from M01 validation.

## Completion contract
For M01 lab lessons, the completion button is enabled only when:
- at least one decision drill has been answered;
- all required workbook fields for that lesson contain non-whitespace content.

Existing checkbox criteria remain hidden for M01 lab lessons and continue to work unchanged for M02-M10.

Completion still writes to the existing `pm01-state-v1` `completed` array and advances to the next lesson.

## State
Extend the existing `pm01-state-v1` object with:

```js
lab: {
  [lessonId]: {
    drillAnswers: { [drillId]: optionId },
    workbook: { [fieldId]: string }
  }
}
```

Older localStorage remains compatible because missing `lab` state defaults to `{}`.

## Data boundary
Create `m01-learning-lab-data.js` that attaches `learningLab` metadata only to the two M01 lessons. It may read `PM01.m01Validation.decisionDrills` but must not duplicate the validation runtime.

The normal learner route remains owned by `app.js`. `m01-validation-app.js` continues to own only `#/validation/m01`.

## UI boundary
`app.js` gets generic conditional rendering/binding for optional `lesson.learningLab` data:
- render lab sections;
- persist drill choices and workbook fields;
- calculate readiness;
- render feedback;
- reuse existing completion/navigation behavior.

No new router is introduced.

## Readability requirements
Keep the Editorial Instrument identity but prioritize long-form usability:
- normal learner-facing text contrast must target WCAG AA 4.5:1;
- secondary text must not use the current near-invisible `#5f5f5a` / `#666660` on `#0a0a0a` for essential content;
- body copy remains at least 16px on desktop and mobile;
- metadata may remain smaller only when non-essential;
- light workbook surfaces use dark text with AA contrast;
- focus states remain clearly visible.

## Success criteria
- M01 lessons visibly contain case → decision → feedback → technique → workbook → transfer.
- Decision drills give immediate option-specific feedback.
- Workbook state survives reload.
- M01 completion is gated by drill + required workbook evidence.
- M02-M10 completion behavior is unchanged.
- No additional learner-facing learning route is introduced.
- Existing CI plus new lab regression tests pass.
- Pages can deploy as a clean static site with no build dependency.
