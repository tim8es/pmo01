const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadSimulator() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('m01-simulator-data.js', 'utf8'), context, { filename: 'm01-simulator-data.js' });
  vm.runInContext(fs.readFileSync('m01-simulator-domain.js', 'utf8'), context, { filename: 'm01-simulator-domain.js' });
  return {
    mission: context.window.PM01SimulatorData.mission,
    domain: context.window.PM01SimulatorDomain,
  };
}

test('mission defines exactly four deterministic decision moments with 3-4 options each', () => {
  const { mission } = loadSimulator();
  assert.equal(mission.id, 'm01-mission-partner-launch-v1');
  assert.equal(mission.decisions.length, 4);
  for (const decision of mission.decisions) {
    assert.ok(decision.options.length >= 3 && decision.options.length <= 4);
    for (const option of decision.options) {
      for (const value of Object.values(option.effects)) assert.equal(Number.isInteger(value), true);
    }
  }
});

test('initial run exposes four bounded meters and pinned treatment id', () => {
  const { mission, domain } = loadSimulator();
  const run = domain.initialRun(mission);
  assert.equal(run.treatmentId, 'm01-mission-partner-launch-v1');
  assert.deepEqual(JSON.parse(JSON.stringify(run.meters)), { deadline: 58, trust: 64, capacity: 72, risk: 63 });
  for (const value of Object.values(run.meters)) assert.ok(value >= 0 && value <= 100);
});

test('decision commits are append-only, immutable and clamp meter values', () => {
  const { mission, domain } = loadSimulator();
  const run = domain.initialRun(mission);
  const first = domain.commitDecision(run, mission, 'd1', 'decision-timeline', 'Need evidence first');
  assert.equal(first.decisions.length, 1);
  assert.equal(first.decisions[0].optionId, 'decision-timeline');
  assert.equal(first.flags.timeline_reconstructed, true);
  assert.throws(() => domain.commitDecision(first, mission, 'd1', 'hard-deadline', 'replace'), /already committed/i);

  const extremeMission = JSON.parse(JSON.stringify(mission));
  extremeMission.decisions[1].options[0].effects = { deadline: 1000, trust: -1000, capacity: 1000, risk: -1000 };
  const clamped = domain.commitDecision(first, extremeMission, 'd2', extremeMission.decisions[1].options[0].id, '');
  assert.deepEqual(JSON.parse(JSON.stringify(clamped.meters)), { deadline: 100, trust: 0, capacity: 100, risk: 0 });
});

test('opening tools records evidence without changing project meters', () => {
  const { mission, domain } = loadSimulator();
  const run = domain.initialRun(mission);
  const opened = domain.openTool(run, 'decision-timeline', 'd1');
  assert.deepEqual(JSON.parse(JSON.stringify(opened.meters)), JSON.parse(JSON.stringify(run.meters)));
  assert.equal(opened.toolsOpened.length, 1);
  assert.equal(opened.toolsOpened[0].toolId, 'decision-timeline');
});

test('required rationale contract rejects fewer than 8 trimmed characters without committing evidence', () => {
  const { mission, domain } = loadSimulator();
  const run = domain.initialRun(mission);
  assert.throws(
    () => domain.commitDecision(run, mission, 'd1', 'decision-timeline', '1234567'),
    /rationale/i,
  );
  assert.equal(run.decisions.length, 0);
  assert.equal(run.decisionIndex, 0);
  const accepted = domain.commitDecision(run, mission, 'd1', 'decision-timeline', '12345678');
  assert.equal(accepted.decisions[0].rationale, '12345678');
});

test('completion requires all four decisions and required rationales', () => {
  const { mission, domain } = loadSimulator();
  let run = domain.initialRun(mission);
  run = domain.commitDecision(run, mission, 'd1', 'decision-timeline', 'Need evidence first');
  run = domain.commitDecision(run, mission, 'd2', 'decision-contract', '');
  run = domain.commitDecision(run, mission, 'd3', 'split-decision', '');
  assert.equal(domain.isComplete(run, mission), false);
  assert.throws(() => domain.commitDecision(run, mission, 'd4', 'revise-diagnosis', ''), /rationale/i);
  assert.throws(() => domain.commitDecision(run, mission, 'd4', 'revise-diagnosis', 'short'), /rationale/i);
  run = domain.commitDecision(run, mission, 'd4', 'revise-diagnosis', 'Security dependency changes the diagnosis');
  assert.equal(domain.isComplete(run, mission), true);
});

test('trajectory returns decision path and meter snapshots without aggregate score', () => {
  const { mission, domain } = loadSimulator();
  let run = domain.initialRun(mission);
  run = domain.commitDecision(run, mission, 'd1', 'decision-timeline', 'Need evidence first');
  const view = domain.trajectory(run, mission);
  assert.equal(view.treatmentId, mission.id);
  assert.equal(view.decisions.length, 1);
  assert.equal(Object.prototype.hasOwnProperty.call(view, 'score'), false);
  assert.ok(Array.isArray(view.meterHistory));
});
