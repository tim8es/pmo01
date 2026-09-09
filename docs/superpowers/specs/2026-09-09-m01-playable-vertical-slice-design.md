# PMO01 M01 Playable Vertical Slice — Design Spec

**Status:** reviewable design; no implementation authorized by this document  
**Date:** 2026-09-09  
**Scope:** M01 only  
**Target:** one 7–10 minute deterministic project-management mission  
**Base:** current M01.1 learning content and validation model  

## 1. Decision summary

PMO01 should move from a mostly linear lesson/lab experience to a compact deterministic project-management simulator for the first playable vertical slice.

The slice is **one authored mission with exactly four decision moments**. The learner sees a project state, makes a choice, sees consequences, can open optional checklists/tools, and finishes with a trajectory review. The simulation is not an optimization game and does not reduce project management to maximizing one score. It is designed to expose trade-offs, hypothesis quality, evidence use, and willingness to revise a decision when new facts weaken the original explanation.

The recommended implementation model is a **deterministic state machine with authored narrative consequences**. This gives PMO01 a game-like interaction while preserving reproducibility, accessibility, testability, and the P01–P05 evidence contract.

This spec does **not** authorize code changes, production publication, M02 work, telemetry changes, or changes to `main`.

---

## 2. Current M01.1 flow being redesigned

Current M01.1 is structurally:

`cold decision → worked example → technique → exit decision → six-field workbook → transfer prompt`

across two lessons:

- `project-system`
- `system-diagnostic`

The current content already teaches the reasoning PMO01 should preserve:

1. separate observations from interpretations;
2. compare more than one plausible systemic explanation;
3. identify discriminating evidence;
4. state a falsifier that could weaken the preferred diagnosis;
5. choose a minimal intervention aimed at the mechanism;
6. identify an early signal;
7. state a condition for revising or cancelling the decision.

Current completion is evidence-aware: required drill answers and required workbook fields must exist before a Learning Lab counts as complete. The redesign must not regress that property into “clicked through the screens.”

The validation route is also a separate measurement system with blind baseline, learning intervention, post-case, field transfer, and reflection. That separation is valuable and should remain.

---

## 3. Goals

### Product goal

Make the first M01 learning experience feel like managing a live project rather than reading a lesson and completing forms.

### Learning goal

After one mission, the learner should be more likely to:

- diagnose a repeatable system mechanism rather than blame a person or local symptom;
- compare a preferred diagnosis with a credible alternative;
- seek evidence that distinguishes the two;
- choose an intervention appropriate to the mechanism and its trade-offs;
- revise a decision when new evidence undermines the initial hypothesis.

### Validation goal

Preserve a clean causal interpretation for P01–P05:

`blind baseline → simulator treatment → blind post-case → real-project transfer`

with a pinned treatment version and no mixing of old M01.1 lesson-treatment data with simulator-treatment data in one five-person cohort.

### UX goal

A motivated learner should be able to complete the mission in roughly **7–10 minutes** without a facilitator explaining the interface.

This is a target, not a countdown. PMO01 must not impose a visible timer or penalize slower readers.

---

## 4. Non-goals for the first vertical slice

The first slice deliberately does **not** include:

- AI-generated scenarios or LLM-driven NPCs;
- randomized consequences;
- avatars, character customization, XP, badges, streaks, currencies, leaderboards;
- multiplayer or facilitator dashboards;
- free-form chat with simulated stakeholders;
- branching into dozens of unique story paths;
- adaptive difficulty;
- telemetry or server-side analytics;
- M02 content;
- migration of the full PMO01 course;
- a new framework decision;
- automatic mastery inference;
- a single aggregate “PM score.”

The slice exists to validate the **decision-simulation learning loop**, not to build a game platform.

---

## 5. Approaches considered

### A. Fully authored branch tree

Every option sends the learner to a different branch with unique later decisions.

**Advantages**

- high narrative specificity;
- visibly different paths.

**Problems**

- combinatorial authoring and QA cost;
- hard to compare learners because they may receive materially different later tasks;
- encourages content duplication;
- difficult to keep a 7–10 minute slice bounded.

**Decision:** not selected.

### B. Deterministic state machine with conditional narrative — recommended

Every learner encounters the same four decision moments. Choices change project meters and flags. Later narrative and consequence text can vary based on those flags, but the decision structure remains stable.

**Advantages**

- game-like consequences without a branch explosion;
- deterministic and replayable;
- comparable P01–P05 evidence;
- straightforward unit testing;
- content remains authored and reviewable;
- supports later mission growth without choosing a full framework now.

**Decision:** selected.

### C. LLM-driven simulation

An AI model generates stakeholder responses and consequences dynamically.

**Advantages**

- potentially realistic and open-ended.

**Problems**

- poor reproducibility for a five-person validation cohort;
- harder safety/content review;
- difficult to distinguish learning effect from model variance;
- requires API/backend/product decisions outside the vertical-slice goal.

**Decision:** explicitly deferred.

---

## 6. Mission concept

### Mission ID

`m01-mission-partner-launch-v1`

### Working title

**“Пять дней до партнёрского запуска”**

### Premise

The learner is acting as the project lead for a partner integration scheduled to launch in five working days.

The implementation is mostly complete and the status dashboard is green, but several weak signals are emerging:

- the final external data format is not frozen;
- a legal restriction is still moving through several owners;
- developers are preserving multiple implementation variants;
- QA expects a stable build tomorrow;
- the partner believes the launch date is committed.

The point is not to discover a hidden “correct answer.” The learner must decide what evidence to request, which uncertainty to close, what trade-off to accept, and when to revise the original diagnosis.

### Initial visible state

All meters use `0..100` internally and display both number and plain-language label.

| State | Initial | Meaning |
|---|---:|---|
| **Deadline confidence** | 58 | likelihood that the currently promised scope can launch on the committed date |
| **Stakeholder trust** | 64 | confidence between team, partner, business and decision owners |
| **Team capacity** | 72 | usable delivery capacity without unsustainable overload |
| **Launch risk** | 63 | unresolved exposure that can still create late rework or launch failure; lower is better |

`Team capacity` means practical delivery capacity, not budget or headcount.

The four meters are intentionally not collapsed into one total score.

---

## 7. Core learner loop

Each decision uses the same interaction rhythm:

1. **Situation update** — what changed and what is known.
2. **Project state** — four visible meters plus notable open facts.
3. **Optional tools** — learner may open a checklist before deciding.
4. **Decision** — choose one of 3–4 plausible options.
5. **Commit** — first choice becomes immutable for evidence purposes.
6. **Consequence** — immediate project-state change plus narrative outcome.
7. **New evidence** — the mission advances and introduces the next fact.

The learner cannot undo a committed choice within the cohort run. Replay can exist later but must be clearly separated from first-run evidence.

---

## 8. Four decision moments

## D1 — Diagnose before intervening

### Situation

Five days remain. QA asks whether tomorrow’s candidate build is actually stable. The partner says the “final” data format may still change because legal is reviewing one field. The team asks for a decision.

### Learner question

**“What do you do first?”**

### Options

1. **Add contingency to the schedule.**  
   A reasonable forecasting move, but it prices uncertainty before identifying the mechanism.

2. **Tell QA to prepare for both formats.**  
   Reduces a local execution risk but spends capacity while the upstream decision interface remains unclear.

3. **Set a hard deadline for the partner’s final answer.**  
   Creates urgency, but can fail if ownership and the actual decision path are still ambiguous.

4. **Reconstruct the critical decision timeline and identify who owns the next irreversible decision.**  
   Strongest diagnostic move because it distinguishes delay in information, ownership, approval and downstream handoff.

### State effects

Effects are deterministic and authored. Example values:

| Option | Deadline | Trust | Capacity | Risk | Flags |
|---|---:|---:|---:|---:|---|
| contingency | +5 | 0 | 0 | -2 | `buffer_added` |
| prepare both | +2 | +1 | -12 | -4 | `parallel_variants` |
| hard deadline | +4 | -6 | 0 | -3 | `external_pressure` |
| decision timeline | +3 | +2 | -2 | -8 | `timeline_reconstructed`, `evidence_requested` |

The strongest reasoning option does not necessarily produce the largest immediate deadline gain. This prevents the mission from becoming a simple meter-maximization puzzle.

### Required evidence

Before commit, learner writes one short sentence:

**“Why this first?”**

This is stored as `D1.rationale` and used in the final trajectory review.

---

## D2 — Act under uncertainty

### New evidence

The mission reveals that legal is not the only source of uncertainty: the partner’s technical owner had already chosen a preferred format, but that decision was never marked final because a product manager was waiting for business confirmation.

If `timeline_reconstructed` is set, the learner sees this as a direct result of the investigation. Otherwise the same fact arrives as a late escalation from the partner. The evidence is comparable; only the narrative context differs.

### Learner question

**“What intervention do you make now?”**

### Options

1. **Add another developer to protect the launch.**  
   Increases local capacity but does not close the decision interface.

2. **Freeze the currently preferred format immediately.**  
   Reduces variation but risks locking the wrong business/legal choice.

3. **Create one explicit decision owner, expiry time and acceptance example for the format decision.**  
   Changes the decision interface and reduces ambiguity before downstream work grows.

4. **Keep both technical variants alive until all stakeholders agree.**  
   Preserves flexibility at a direct capacity cost.

### State effects

Representative deterministic effects:

| Option | Deadline | Trust | Capacity | Risk | Flags |
|---|---:|---:|---:|---:|---|
| add developer | +5 | 0 | +6 | +1 | `extra_capacity`, `coordination_cost` |
| freeze now | +9 | -5 | +2 | +5 | `premature_freeze` |
| decision contract | +7 | +6 | -2 | -12 | `decision_contract` |
| keep variants | +3 | +2 | -14 | -3 | `optionality_preserved` |

---

## D3 — Make the trade-off explicit

### New evidence

Three days remain. Business now asks to include one additional partner field in the launch because it would avoid a manual workaround after go-live. QA warns that adding it now expands the test surface.

### Learner question

**“Which trade-off do you choose?”**

### Options

1. **Accept the extra field and ask the team to absorb it.**  
   Maximizes short-term scope but consumes capacity and raises late risk.

2. **Reject the field because the date is fixed.**  
   Protects the launch but may damage trust if the business cost is ignored.

3. **Separate the irreversible launch requirement from the reversible enhancement; launch the required contract and schedule the extra field behind an explicit follow-up decision.**  
   Makes optionality and downstream cost explicit.

4. **Move the whole launch so all requirements can be included together.**  
   Reduces immediate quality risk but spends the commitment without testing whether the new field is truly launch-critical.

### State effects

| Option | Deadline | Trust | Capacity | Risk | Flags |
|---|---:|---:|---:|---:|---|
| absorb field | -8 | +3 | -14 | +11 | `late_scope_added` |
| reject field | +7 | -8 | +3 | -3 | `scope_rejected` |
| split decision | +6 | +5 | -2 | -8 | `reversible_scope_split` |
| move launch | -18 | -3 | +8 | -10 | `launch_moved` |

---

## D4 — Revise when the hypothesis is challenged

### New evidence

One day remains. A new fact contradicts the simplest version of the learner’s earlier story:

- the format decision is now clear;
- the remaining blocker is a security rule discovered in an already-approved dependency;
- the team can either keep pushing the existing plan or revise the diagnosis and isolate the blocker.

The exact wording can reference prior flags, but every learner receives the same underlying falsifying fact.

### Learner question

**“What do you do with your current diagnosis?”**

### Options

1. **Stay with the original plan; changing diagnosis this late will create more confusion.**
2. **Escalate the team for not discovering the issue earlier.**
3. **Revise the diagnosis, isolate the security dependency, and redefine the smallest safe launch decision.**
4. **Add capacity and keep both the original diagnosis and original scope unchanged.**

### Required evidence

Before commit, learner writes one short sentence:

**“What fact made you keep or revise your diagnosis?”**

Stored as `D4.revisionRationale`.

### State effects

The strongest response improves risk control and trust but may reduce deadline confidence if the smallest safe launch is narrower than the original promise. That trade-off is intentional.

Example:

| Option | Deadline | Trust | Capacity | Risk | Flags |
|---|---:|---:|---:|---:|---|
| stay course | +2 | -4 | -5 | +12 | `ignored_falsifier` |
| blame/escalate | 0 | -10 | -3 | +5 | `person_blame` |
| revise diagnosis | -2 | +8 | +1 | -18 | `hypothesis_revised`, `safe_scope` |
| add capacity | +4 | -2 | +4 | +7 | `capacity_compensation` |

---

## 9. Project-state rules

### Meter mechanics

- each meter is an integer `0..100`;
- every consequence applies a fixed delta;
- values are clamped to `0..100`;
- no random effects;
- no hidden global score;
- no single “winning meter”; the final review interprets trajectory and reasoning together.

### Flags

Flags capture durable consequences and allow later copy to reflect the learner’s path without changing the four-decision structure.

Example flags:

- `timeline_reconstructed`
- `evidence_requested`
- `parallel_variants`
- `external_pressure`
- `decision_contract`
- `premature_freeze`
- `optionality_preserved`
- `late_scope_added`
- `reversible_scope_split`
- `launch_moved`
- `ignored_falsifier`
- `hypothesis_revised`
- `safe_scope`

### Conditional consequences

Conditional narrative is permitted only when:

1. it refers to a flag created by an earlier choice;
2. it does not change which later decision nodes exist;
3. it does not change the assessment difficulty materially;
4. it is deterministic and covered by tests.

This keeps trajectories personal without creating incomparable cohorts.

---

## 10. Optional tools / checklists

Tools are learner-controlled support, not answer revealers.

Opening a tool:

- has **no negative state consequence**;
- does not reduce a score;
- is logged as evidence of information-seeking behavior;
- never marks an option as “correct.”

### Tool A — Decision Timeline

Prompt checklist:

- What decision is actually open?
- When did it become necessary?
- Who owns the next commitment?
- What is waiting for that commitment?
- How old is the wait?
- What becomes expensive if the decision arrives later?

Maps current `Seven-flow hypothesis scan` evidence-seeking behavior into an interactive aid.

### Tool B — Hypothesis Comparator

Two-column checklist:

- preferred explanation;
- strong alternative;
- facts both explain;
- observation that would favor one over the other;
- fact that would weaken the preferred explanation.

Maps current `alternative` + `falsifier` workbook work into a just-in-time tool.

### Tool C — Change Condition

Checklist:

- what should change first if the decision is right?
- by when?
- what observation means “continue”?
- what observation means “revise/stop”?

Maps current early-signal and revision-condition content into an action aid.

### Availability

All three tools are available from a persistent **“Tools”** control at every decision. Context may recommend a tool by name, but the simulator must not automatically open it or imply that using it is required for the preferred answer.

---

## 11. Screens and UI states

The vertical slice needs only six reusable screen states.

### S0 — Mission briefing

Contents:

- role and mission objective;
- project context;
- initial state meters;
- explanation that consequences persist;
- “Start mission” primary action.

No tutorial wall of text. Tool behavior can be explained with one sentence.

### S1 — Decision

Contents:

- short situation update;
- project meters;
- 3–4 radio-card options;
- optional “Tools” control;
- short rationale input only for D1 and D4;
- explicit “Commit decision” action.

The learner can change selection before commit. After commit, the first committed choice is immutable for cohort evidence.

### S2 — Consequence

Contents:

- concise narrative consequence;
- meter deltas shown as text, e.g. `Deadline confidence 58 → 61 (+3)`;
- one sentence linking the consequence to the project mechanism, without calling the decision correct/incorrect;
- “Continue” action.

### S3 — Tool drawer/dialog

Contents:

- checklist only;
- close/return control;
- no answer highlighting;
- no meter changes.

### S4 — Trajectory review (before post-case)

This is the required final mission debrief, but it must remain **non-evaluative before post-case** to avoid contaminating the measurement.

Show:

- four committed decisions in order;
- state trajectory across four meters;
- D1 rationale;
- D4 revision rationale;
- tools opened;
- explicit flags such as “diagnosis revised” only when derived from learner behavior;
- reflection prompts:
  - “Where did your model of the problem change?”
  - “Which trade-off did you knowingly accept?”
  - “What evidence would make you act differently next time?”

Do **not** show:

- preferred option labels;
- option scores;
- expert path;
- “you should have…” feedback;
- aggregate mission grade.

### S5 — Expert debrief (only after post-case)

After the validation post-case is submitted, the product may reveal a deeper analysis:

- what each decision optimized;
- where near-miss reasoning was plausible but incomplete;
- which choices attacked symptoms vs mechanisms;
- how the falsifying fact should change a diagnosis;
- alternative trajectories worth replaying later.

This screen is optional for the first implementation if keeping it would delay the playable slice. The pre-post trajectory review is mandatory.

---

## 12. Proposed data model

The implementation should keep mission content declarative and the transition engine pure.

### Mission definition

Conceptual shape:

```text
MissionDefinition
  id
  version
  title
  estimatedMinutes
  initialState
    deadlineConfidence
    stakeholderTrust
    teamCapacity
    launchRisk
  tools[]
  nodes[]
    id
    situation
    prompt
    rationaleRequirement
    options[]
      id
      label
      consequence
      effects
      setFlags[]
      conditionalCopy[]
  finalReview
```

### Runtime state

```text
MissionRun
  missionId
  missionVersion
  runId
  startedAt
  completedAt
  currentNodeId
  projectState
  flags[]
  decisions[]
    nodeId
    optionId
    rationale
    committedAt
    stateBefore
    stateAfter
  toolEvents[]
    toolId
    nodeId
    openedAt
```

### Important rule

`decisions[]` is append-only for the first cohort run. UI selection can change before commit; after commit, the record is immutable.

---

## 13. Storage and evidence isolation

For the simulator treatment, use an isolated browser storage record such as:

`pm01-sim-m01-v1`

Do not overload `pm01-validation-m01-v1` with simulator runtime state and do not make simulator state depend on telemetry.

The existing course state can still store a simple completion reference later, but the full mission run should remain versioned and inspectable independently.

### Fresh-start implication

If this simulator becomes the P01–P05 treatment, the facilitator clean-start contract must require absence of all relevant state:

- `pm01-validation-m01-v1`
- `pm01-state-v1`
- `pm01-sim-m01-v1`

This is a protocol change that belongs to the simulator implementation/release package, not to the current production M01.1 cohort before the redesign ships.

---

## 14. P01–P05 evidence preservation

### Treatment version pinning

Every valid simulator participant record must include:

`treatment = m01-mission-partner-launch-v1`

and the exact production release SHA used for that session.

### Do not mix treatments

Evidence from the existing text/Learning-Lab M01.1 treatment and evidence from the simulator treatment must **not** be pooled into the same five-person cohort decision.

Because no valid P01–P05 participant data currently exists, the project may choose the simulator as the treatment before P01 starts. Once the first valid participant starts a treatment, all remaining participants in that cohort must use the same pinned treatment version unless the cohort is explicitly restarted.

### Baseline and post-case

Keep the existing five validation dimensions unchanged for the first simulator cohort:

- mechanism;
- evidence;
- trade-offs;
- intervention;
- change condition.

Keep blind baseline and integrative post-case structurally unchanged unless a separate validation-design review explicitly changes them.

### Additional simulator evidence

For each participant capture:

- committed option at D1–D4;
- D1 rationale;
- D4 revision rationale;
- tool openings by node;
- state trajectory after each decision;
- whether the learner revised the diagnosis after the falsifying fact;
- trajectory-review reflection;
- facilitator-observed confusion or gaming of meters;
- completion/abandonment point.

These are **interaction and reasoning evidence**, not an automatic learning score.

### Existing cohort decision rule

The simulator does not replace the existing primary cohort gate:

- ≥5 valid sessions;
- ≥3/5 positive individual baseline→post signal;
- ≥3/5 credible real-project transfer;
- qualitative evidence must not contradict the score gains;
- no repeated blocking UX/rubric ambiguity that plausibly explains the result.

Simulator-specific evidence helps explain *why* the treatment did or did not work.

---

## 15. Migration of current M01.1 content

The redesign should reuse learning substance while changing presentation.

| Current M01.1 element | Simulator destination |
|---|---|
| `m01-drill-system` cold decision | D1 diagnosis decision |
| Seven-flow hypothesis scan | Decision Timeline tool + D1/D2 consequence reasoning |
| worked example: external dependency | consequence/debrief content; no pre-reading block |
| `m01-exit-system` | D2 intervention decision |
| `m01-drill-diagnostic` | D3 trade-off / mechanism pressure test |
| Falsifiable causal chain | Hypothesis Comparator tool + D4 falsifying event |
| worked example: repeated QA interpretation | expert debrief example or later mission; not required in first mission body |
| `m01-exit-diagnostic` | D4 revise-or-persist decision |
| six-field workbook | distributed reasoning evidence + optional tools + final trajectory reflection |
| `alternative` field | Hypothesis Comparator and final review |
| `falsifier` field | D4 event and revision rationale |
| `decision` + early signal | D2/D3 consequences and Change Condition tool |
| real-project transfer prompt | preserved after post-case/mission as current field transfer |

### Content removed from the critical path

Long explanatory blocks should not appear before decisions. The simulator should teach through:

- consequence;
- optional tool;
- later evidence;
- post-mission reflection.

Existing prose is source material, not a requirement to preserve paragraphs verbatim.

---

## 16. Completion semantics

A simulator mission is complete only when:

1. D1–D4 all have committed first-choice evidence;
2. D1 rationale is non-empty;
3. D4 revision rationale is non-empty;
4. the pre-post trajectory review has been reached;
5. the mission run persisted successfully.

Opening tools is never required for completion.

No minimum meter threshold is required. A learner can complete a poor trajectory and still produce valid evidence.

The validation route should unlock post-case based on this mission completion evidence when the simulator treatment is active.

---

## 17. Error and recovery behavior

### Persistence failure

If browser storage fails:

- show an explicit blocking warning;
- do not silently advance;
- tell the participant not to continue because evidence may be lost.

This matches the existing validation integrity principle.

### Reload

A reload should restore:

- current node;
- committed decisions;
- project state;
- tool history;
- entered rationale.

A committed decision must never become editable after reload.

### Version mismatch

If stored mission version differs from the loaded definition:

- do not silently migrate an in-progress cohort run;
- show a version mismatch message;
- facilitator should exclude/restart the session according to cohort protocol.

---

## 18. Accessibility requirements

Accessibility is part of the vertical slice, not later polish.

### Keyboard

- every decision can be selected and committed without a mouse;
- tool drawer is keyboard reachable;
- focus returns to the triggering control when a tool closes;
- consequence/continue flow has predictable focus order.

### Semantic controls

- decision choices use native radio inputs or buttons with equivalent semantics;
- project state is readable as text, not canvas-only visualization;
- dialogs use correct dialog semantics and accessible names.

### Meter communication

Never communicate state change by color alone.

Example:

`Launch risk: 63 → 55 (−8, improved)`

Icons/colors may supplement this text but cannot replace it.

### Motion

- no required animation;
- respect `prefers-reduced-motion`;
- meter animation, if used, is decorative and skippable.

### Time

- no countdown timer;
- 7–10 minutes is an observed usability target, not a time limit.

### Readability

- scenario blocks stay short;
- consequence text should normally fit in 2–4 short paragraphs;
- tools use checklist structure rather than dense prose.

---

## 19. Test strategy for implementation

No implementation should be considered complete without tests across four layers.

### A. Mission schema/content tests

Verify:

- exactly one M01 mission in the first slice;
- exactly four decision nodes;
- every node has 3–4 options;
- every option has deterministic effects and consequence copy;
- all meter effects target valid state keys;
- all referenced flags/tools exist;
- no option lacks a next state;
- no forbidden M02 dependency.

### B. Pure transition-engine tests

For every option:

- correct meter deltas apply;
- values clamp to `0..100`;
- correct flags are set;
- input state is not mutated unexpectedly;
- identical state + identical decision produces identical result;
- tool openings never change project meters;
- first committed decision is immutable.

### C. Trajectory tests

Exercise all option combinations or a generated matrix sufficient to prove:

- D1 always reaches D2;
- D2 always reaches D3;
- D3 always reaches D4;
- D4 always reaches trajectory review;
- no dead ends;
- conditional narrative never changes assessment structure;
- no path requires a hidden tool action.

### D. Persistence/validation integration tests

Verify:

- fresh simulator state does not contaminate existing baseline;
- simulator completion is evidence-aware;
- reload restores in-progress mission;
- completed first choices stay locked after reload;
- storage failure blocks advancement visibly;
- post-case remains unavailable before simulator completion;
- pre-post trajectory review does not reveal preferred options or scores;
- treatment version is stored and exportable for facilitator evidence;
- simulator cohort state can be cleared independently.

### E. Accessibility tests

At minimum:

- semantic role/name checks;
- keyboard completion of a representative trajectory;
- focus management for tool dialog and consequence transitions;
- text equivalents for every meter and delta;
- reduced-motion path;
- no critical color-only information.

---

## 20. Success criteria

Success has separate engineering, UX, and learning/evidence gates.

### Engineering gate

- deterministic transition tests pass;
- all four decisions are reachable and persist correctly;
- no `main`, telemetry or M02 dependency is required for the prototype branch;
- simulator can be version-pinned for cohort use;
- baseline blinding is preserved.

### UX gate

From the first valid simulator cohort:

- at least 4/5 learners complete the mission without facilitator explanation of navigation or controls;
- no repeated blocking state-loss/navigation/accessibility issue affects more than one valid session;
- median observed completion should be in or near the 7–10 minute target; slower completion is diagnostic evidence, not automatic failure;
- learners do not consistently interpret the meters as a single score to maximize.

### Learning/product gate

Retain the existing cohort decision thresholds:

- ≥3/5 positive baseline→post prototype signals;
- ≥3/5 credible real-project transfers;
- qualitative reasoning supports rather than contradicts score improvement.

Simulator-specific supporting evidence should show that, for at least 3/5 valid learners:

- consequences caused them to articulate or revise a trade-off, hypothesis, evidence need, or decision condition;
- D4 is understood as a legitimate reason to revise diagnosis rather than as a trick question.

These supporting criteria explain the mechanism; they do not replace the primary cohort gate.

---

## 21. Implementation boundaries

When implementation is separately authorized, the first plan should remain a vertical slice rather than a platform rewrite.

Expected implementation units:

1. declarative `m01` mission content;
2. small pure mission transition engine;
3. mission renderer for briefing/decision/consequence/review;
4. tool drawer/checklist renderer;
5. isolated simulator persistence;
6. validation handoff/completion adapter;
7. tests.

Do not start by rewriting global course navigation or choosing a new frontend framework. The simulator should first prove the interaction and evidence model in isolation.

---

## 22. Self-review: ambiguity and scope resolutions

The following ambiguities were resolved explicitly in this spec.

### “Resources”

Means **team capacity**, not money or headcount. This avoids introducing a finance simulation into M01.

### “7–10 minutes”

A UX target, never a timer or exclusion rule.

### Number of decisions

Exactly **four** for the first slice. Conditional narrative is allowed; conditional extra decisions are not.

### Consequences

Fully deterministic and authored. No random rolls and no LLM generation.

### Project state

Four independent visible meters. No aggregate hidden or visible score.

### Tools

Optional and penalty-free. Tool use is evidence, not a success criterion.

### Final trajectory review

Must exist immediately after D4, but before post-case it is descriptive/reflection-oriented and does not reveal preferred answers. Deeper expert comparison waits until after post-case.

### Evidence and cohort comparability

Simulator treatment must be pinned. Existing Learning-Lab M01.1 sessions and simulator sessions cannot be combined in the same five-person cohort decision.

### Completion

Requires committed decision evidence and required rationales, not healthy meters or “good” decisions.

### Branching

Personalized consequence copy is allowed, but all learners receive the same four decision problems and the same falsifying event structure.

### Migration scope

M01 learning presentation changes; baseline/post-case rubric, real-project transfer and broader course architecture remain unchanged for the first slice unless separately reviewed.

### Accessibility

Required in the first playable slice, not deferred.

### Scope verdict

The design is intentionally narrow enough for one implementation plan:

**one mission + four decisions + four project meters + three optional tools + trajectory review + persistence/evidence integration.**

Anything beyond that — additional missions, M02, AI stakeholders, adaptive difficulty, new framework, server telemetry — requires a separate design decision.

---

## 23. Review questions for the owner

User review should focus on these product choices before implementation:

1. Is “Пять дней до партнёрского запуска” the right first mission context?
2. Are the four state meters the right mental model, especially `Deadline confidence` rather than raw days remaining?
3. Is four decision moments enough to feel like a simulator while remaining within 7–10 minutes?
4. Is the deliberate separation between non-evaluative trajectory review and post-case expert debrief acceptable?
5. Should the simulator become the treatment for P01–P05 before the first real participant, or should the existing published M01.1 cohort be completed first?

No implementation should start until this design is reviewed and explicitly approved.
