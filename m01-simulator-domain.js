(function () {
  'use strict';

  const MIN_RATIONALE_LENGTH = 8;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Number(value)));
  }

  function findDecision(mission, decisionId) {
    return mission.decisions.find((decision) => decision.id === decisionId);
  }

  function findOption(decision, optionId) {
    return decision && decision.options.find((option) => option.id === optionId);
  }

  function rationaleValid(value) {
    return String(value || '').trim().length >= MIN_RATIONALE_LENGTH;
  }

  function initialRun(mission) {
    return {
      treatmentId: mission.id,
      missionVersion: mission.version,
      status: 'in_progress',
      decisionIndex: 0,
      meters: clone(mission.initialState),
      flags: {},
      decisions: [],
      toolsOpened: [],
      events: [],
    };
  }

  function commitDecision(run, mission, decisionId, optionId, rationale) {
    if (!run || run.treatmentId !== mission.id || run.missionVersion !== mission.version) throw new Error('Mission treatment mismatch');
    if (run.decisions.some((decision) => decision.decisionId === decisionId)) throw new Error(`Decision ${decisionId} already committed`);

    const expected = mission.decisions[run.decisionIndex];
    if (!expected || expected.id !== decisionId) throw new Error(`Decision ${decisionId} is out of order`);
    const decision = findDecision(mission, decisionId);
    const option = findOption(decision, optionId);
    if (!option) throw new Error(`Unknown option ${optionId}`);
    const cleanRationale = String(rationale || '').trim();
    if (decision.requiredRationale && !rationaleValid(cleanRationale)) {
      throw new Error(`Decision ${decisionId} requires rationale of at least ${MIN_RATIONALE_LENGTH} characters`);
    }

    const next = clone(run);
    const before = clone(next.meters);
    const delta = {};
    Object.keys(next.meters).forEach((meterId) => {
      const change = Number(option.effects[meterId] || 0);
      delta[meterId] = change;
      next.meters[meterId] = clamp(next.meters[meterId] + change);
    });
    (option.flags || []).forEach((flag) => { next.flags[flag] = true; });

    next.decisions.push({
      decisionId,
      optionId,
      rationale: cleanRationale,
      stateBefore: before,
      stateAfter: clone(next.meters),
      delta,
      flagsAdded: [...(option.flags || [])],
    });
    next.events.push({ type: 'decision_committed', decisionId, optionId });
    next.decisionIndex += 1;
    if (next.decisionIndex >= mission.decisions.length) next.status = 'decisions_complete';
    return next;
  }

  function openTool(run, toolId, decisionId) {
    if (!String(toolId || '').trim()) throw new Error('Tool id is required');
    const next = clone(run);
    next.toolsOpened.push({ toolId, decisionId });
    next.events.push({ type: 'tool_opened', toolId, decisionId });
    return next;
  }

  function isComplete(run, mission) {
    if (!run || run.treatmentId !== mission.id || run.missionVersion !== mission.version) return false;
    if (run.decisions.length !== mission.decisions.length) return false;
    return mission.decisions.every((decision) => {
      const committed = run.decisions.find((item) => item.decisionId === decision.id);
      return Boolean(committed) && (!decision.requiredRationale || rationaleValid(committed.rationale));
    });
  }

  function trajectory(run, mission) {
    return {
      treatmentId: run.treatmentId,
      missionVersion: run.missionVersion,
      decisions: clone(run.decisions),
      toolsOpened: clone(run.toolsOpened),
      flags: clone(run.flags),
      diagnosisRevised: Boolean(run.flags.hypothesis_revised),
      meterHistory: [clone(mission.initialState), ...run.decisions.map((decision) => clone(decision.stateAfter))],
      finalMeters: clone(run.meters),
    };
  }

  window.PM01SimulatorDomain = {
    initialRun,
    commitDecision,
    openTool,
    isComplete,
    trajectory,
  };
})();
