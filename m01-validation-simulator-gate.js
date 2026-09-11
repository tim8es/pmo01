(function () {
  'use strict';

  const simulatorStorageKey = 'pm01-sim-m01-v1';
  const legacyStorageKey = 'pm01-state-v1';
  const treatmentId = 'm01-mission-partner-launch-v1';
  const missionVersion = 1;
  const m01LessonIds = ['project-system', 'system-diagnostic'];
  const expectedDecisionIds = ['d1', 'd2', 'd3', 'd4'];

  function currentRoute() {
    return location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  }

  function parse(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function decisionEvidenceValid(decisions) {
    if (!Array.isArray(decisions) || decisions.length !== expectedDecisionIds.length) return false;
    if (!expectedDecisionIds.every((id, index) => decisions[index] && decisions[index].decisionId === id)) return false;
    const rationaleIds = new Set(['d1', 'd4']);
    return decisions.every((decision) => {
      if (!decision || !decision.optionId) return false;
      if (!rationaleIds.has(decision.decisionId)) return true;
      return String(decision.rationale || '').trim().length >= 8;
    });
  }

  function simulatorComplete(rawGet) {
    const envelope = parse(rawGet(simulatorStorageKey), null);
    if (!envelope) return false;
    if (envelope.treatmentId !== treatmentId || envelope.missionVersion !== missionVersion) return false;
    if (!envelope.run || !decisionEvidenceValid(envelope.run.decisions)) return false;
    return Boolean(envelope.completedAt && envelope.reviewReachedAt && envelope.screen === 'review');
  }

  function sanitizedLegacyState(rawGet) {
    const legacy = parse(rawGet(legacyStorageKey), {});
    const completed = Array.isArray(legacy.completed)
      ? legacy.completed.filter((id) => !m01LessonIds.includes(id))
      : [];
    const lab = { ...(legacy.lab || {}) };
    m01LessonIds.forEach((id) => { delete lab[id]; });
    return { ...legacy, completed, lab };
  }

  function syntheticEvidenceFor(id) {
    const lessons = (window.PM01 && window.PM01.modules || []).flatMap((module) => module.lessons || []);
    const lesson = lessons.find((item) => item.id === id);
    const learningLab = lesson && lesson.learningLab;
    if (!learningLab) return { drillAnswers: {}, workbook: {} };
    const drillAnswers = {};
    const workbook = {};
    learningLab.drills.filter((item) => item.required !== false).forEach((drill) => {
      drillAnswers[drill.id] = drill.options && drill.options[0] ? drill.options[0].id : 'simulator-evidence';
    });
    learningLab.workbookFields.filter((item) => item.required !== false).forEach((field) => {
      workbook[field.id] = 'simulator-evidence';
    });
    return { drillAnswers, workbook };
  }

  function installGate() {
    const storage = localStorage;
    const original = storage.getItem.bind(storage);
    const gatedGetItem = function (key) {
      if (key !== legacyStorageKey || currentRoute() !== 'validation/m01') return original(key);
      const virtualState = sanitizedLegacyState(original);
      if (!simulatorComplete(original)) return JSON.stringify(virtualState);
      const lab = { ...(virtualState.lab || {}) };
      m01LessonIds.forEach((id) => { lab[id] = syntheticEvidenceFor(id); });
      return JSON.stringify({
        ...virtualState,
        completed: [...new Set([...(virtualState.completed || []), ...m01LessonIds])],
        lab,
      });
    };

    try {
      Object.defineProperty(storage, 'getItem', { configurable: true, value: gatedGetItem });
    } catch (_) {
      try { storage.getItem = gatedGetItem; } catch (_) { /* no-op: tests surface failure */ }
    }

    window.PM01SimulatorGate = {
      storageKey: simulatorStorageKey,
      treatmentId,
      missionVersion,
      isComplete: () => simulatorComplete(original),
    };
  }

  installGate();
})();
