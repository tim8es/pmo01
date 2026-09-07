# M01.1 Release Evidence Checklist

This checklist pins the exact published learner experience used for cohort P01–P05 and separates what can be verified statically from what requires real participants.

## Published release under test

- Pages release commit: `c4f8ac2af6a66efdb79881baa58d4c091a0e6aed`
- M01.1 production asset: `m01-learning-lab-data.js`
- M01.1 production asset blob: `33b328d3ccc753cc3d0aee15da98bccd6913f92e`
- Course URL: `https://tim8es.github.io/pmo01/`
- Validation route: `https://tim8es.github.io/pmo01/#/validation/m01`

Do not activate M02, change telemetry, or modify `main` during this cohort.

## Static / engineering verification

These checks can be verified without learner evidence:

- [x] Pages deployment completed successfully on exact release commit `c4f8ac2af6a66efdb79881baa58d4c091a0e6aed`.
- [x] Production release diff contains only `m01-learning-lab-data.js`.
- [x] Production asset blob is exactly `33b328d3ccc753cc3d0aee15da98bccd6913f92e`.
- [x] Public course page responds over HTTP.
- [x] `index.html` loads `m01-validation-data.js` before `m01-learning-lab-data.js`, then `learning-domain.js`, `app.js`, and `m01-validation-app.js`.
- [x] M02 asset is not loaded by production `index.html`.
- [x] `main` was not modified by the M01.1 release.
- [x] Telemetry was not modified by the M01.1 release.
- [x] M01.1 preserves the five validation dimensions: mechanism, evidence, trade-offs, intervention, change condition.
- [x] Every required M01.1 drill has 3–4 plausible choices with a scored near-miss.
- [x] Each M01.1 workbook has six required fields.
- [x] Each workbook captures an alternative hypothesis and a falsifier / факт-опровержение.
- [x] Transfer prompts require a real decision, evidence, early signal and a condition to revise/change/cancel the decision.
- [x] Cold decision first choice is frozen after feedback.
- [x] Validation route does not repeat the M01 cold drills.
- [x] Post-case requires evidence-aware completion of both M01 lessons.
- [x] Baseline score/feedback remains blind until post-case submission by tested contract.

Static verification proves release composition and coded contracts. It does **not** prove learning effectiveness, usability in a real browser, or transfer.

## Real-participant evidence required

These checks cannot be marked VERIFIED until real participant sessions exist:

- [ ] P01 completed and valid.
- [ ] P02 completed and valid.
- [ ] P03 completed and valid.
- [ ] P04 completed and valid.
- [ ] P05 completed and valid.
- [ ] Each new participant started with both `pm01-validation-m01-v1` and `pm01-state-v1` absent.
- [ ] Baseline was genuinely blind and uncoached for every valid participant.
- [ ] Near-miss options were actually plausible to participants rather than merely structurally present.
- [ ] Feedback exposed or changed meaningful reasoning rather than only teaching answer language.
- [ ] Learners could generate a genuinely plausible alternative hypothesis.
- [ ] Learners could identify a concrete falsifier capable of weakening/overturning their preferred diagnosis.
- [ ] Learners could state evidence under which they would revise, stop, change or reverse a decision.
- [ ] At least five session records contain baseline/post scores, deltas, dimension changes and qualitative diagnosis evidence.
- [ ] Real-project transfer was classified consistently as credible / partial / restatement only / not completed.
- [ ] UX/reliability observations exist for state loss, navigation, readability, baseline contamination and rubric ambiguity.
- [ ] Repeated content/UX risks are based on observed sessions, not speculation.

## Cohort decision checklist

After at least five valid sessions:

### PROMOTE

Mark only when all are true:

- [ ] ≥5 valid sessions.
- [ ] ≥3/5 positive individual learning signals (`post >= baseline + 3` and ≥2 improved dimensions).
- [ ] ≥3/5 credible real-project transfers.
- [ ] Qualitative free-text/interview evidence does not materially contradict score gains.
- [ ] No unresolved blocking reliability/UX defect materially distorted more than one valid session.
- [ ] No repeated rubric ambiguity plausibly explains observed gains.
- [ ] No unresolved learner-driven content-model exception blocks preserving the M01.1 contract.

### REVISE and retest

Use when the mechanism remains plausible but evidence is mixed, transfer is mostly partial, alternative/falsifier work becomes form-filling, the same wording/content/interaction/rubric issue appears in at least two valid sessions, or quantitative and qualitative evidence conflict materially.

### REJECT mechanism

Use only when valid/interpretable sessions show both:

- `0–1/5` positive individual signals;
- `0–1/5` credible transfers;

and no blocking measurement/usability defect reasonably explains the failure.

Borderline/conflicting evidence defaults to **REVISE**, not PROMOTE.

## Release hold

Until one evidence-backed cohort outcome is recorded, do not start Phase 2 contract freeze, select the v1 framework, or migrate M01 into a scalable implementation.
