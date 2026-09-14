(function () {
  'use strict';

  const LEVELS = Object.freeze([
    Object.freeze({ level: 0, label: 'Не встречал' }),
    Object.freeze({ level: 1, label: 'Понял' }),
    Object.freeze({ level: 2, label: 'Применил' }),
    Object.freeze({ level: 3, label: 'Доказал' }),
  ]);

  const SKILLS = Object.freeze({
    value: Object.freeze({ id: 'value', name: 'Ценность', question: 'Связана ли работа команды с наблюдаемым изменением для пользователя или бизнеса?' }),
    work: Object.freeze({ id: 'work', name: 'Работа', question: 'Виден ли реальный поток работы, очередь и ограничение системы?' }),
    information: Object.freeze({ id: 'information', name: 'Информация', question: 'Доходит ли важный сигнал до нужного человека достаточно рано?' }),
    decisions: Object.freeze({ id: 'decisions', name: 'Решения', question: 'Ясны ли выбор, владелец, срок и условие пересмотра?' }),
    dependencies: Object.freeze({ id: 'dependencies', name: 'Зависимости', question: 'Понятно ли, что блокирует следующие ценные действия?' }),
    uncertainty: Object.freeze({ id: 'uncertainty', name: 'Неопределённость', question: 'Проверяется ли самое опасное неизвестное до дорогого обязательства?' }),
    feedback: Object.freeze({ id: 'feedback', name: 'Обратная связь', question: 'Есть ли ранний сигнал, позволяющий скорректировать решение?' }),
  });

  const LESSON_SKILLS = Object.freeze({
    'project-system': Object.freeze(['work', 'dependencies']),
    'system-diagnostic': Object.freeze(['decisions']),
    'outcome-tree': Object.freeze(['value']),
    'assumption-map': Object.freeze(['uncertainty']),
    'dependency-graph': Object.freeze(['dependencies']),
    'critical-chain': Object.freeze(['dependencies', 'work']),
    queueing: Object.freeze(['work']),
    toc: Object.freeze(['work']),
    forecasting: Object.freeze(['uncertainty']),
    cone: Object.freeze(['uncertainty']),
    'risk-kill': Object.freeze(['uncertainty']),
    optionality: Object.freeze(['uncertainty', 'decisions']),
    'decision-latency': Object.freeze(['decisions']),
    escalation: Object.freeze(['decisions']),
    'bad-news': Object.freeze(['information']),
    'confidence-status': Object.freeze(['information']),
    'coordination-tax': Object.freeze(['work', 'information']),
    'ownership-incentives': Object.freeze(['decisions']),
    'operating-cadence': Object.freeze(['feedback']),
    capstone: Object.freeze(['feedback', 'value']),
  });

  const M01_PROOF = Object.freeze({
    d1: Object.freeze({ optionId: 'decision-timeline', skills: Object.freeze(['work', 'dependencies']) }),
    d2: Object.freeze({ optionId: 'decision-contract', skills: Object.freeze(['decisions']) }),
    d3: Object.freeze({ optionId: 'split-decision', skills: Object.freeze(['work']) }),
    d4: Object.freeze({ optionId: 'revise-diagnosis', skills: Object.freeze(['decisions']) }),
  });

  function lessonById(modules, id) {
    return (modules || []).flatMap(module => module.lessons || []).find(lesson => lesson.id === id) || null;
  }

  function normalizeCourseState(courseState) {
    return {
      completed: Array.isArray(courseState?.completed) ? courseState.completed : [],
      lab: courseState?.lab && typeof courseState.lab === 'object' ? courseState.lab : {},
    };
  }

  function labEvidence(lesson, courseState) {
    if (!lesson?.learningLab) return { encountered: false, applied: false, answeredDrills: 0, requiredDrills: 0, completedFields: 0, requiredFields: 0 };
    const state = normalizeCourseState(courseState);
    const stored = state.lab[lesson.id] || {};
    const answers = stored.drillAnswers || {};
    const workbook = stored.workbook || {};
    const requiredDrills = (lesson.learningLab.drills || []).filter(drill => drill.required !== false);
    const requiredFields = (lesson.learningLab.workbookFields || []).filter(field => field.required !== false);
    const answeredDrills = requiredDrills.filter(drill => Boolean(answers[drill.id])).length;
    const completedFields = requiredFields.filter(field => String(workbook[field.id] || '').trim().length > 0).length;
    const allDrills = requiredDrills.length > 0 && answeredDrills === requiredDrills.length;
    const allFields = requiredFields.length > 0 && completedFields === requiredFields.length;
    return {
      encountered: answeredDrills > 0,
      applied: state.completed.includes(lesson.id) && allDrills && allFields,
      answeredDrills,
      requiredDrills: requiredDrills.length,
      completedFields,
      requiredFields: requiredFields.length,
    };
  }

  function levelRecord(level) {
    return LEVELS[Math.max(0, Math.min(3, Number(level) || 0))];
  }

  function applyLevel(skills, skillId, level, evidence) {
    const skill = skills[skillId];
    if (!skill) return;
    if (level > skill.level) {
      skill.level = level;
      skill.label = levelRecord(level).label;
    }
    if (evidence) skill.evidence.push(evidence);
  }

  function practiceProof(skills, practiceState, definitions) {
    const moduleStates = practiceState?.modules || practiceState || {};
    Object.entries(moduleStates).forEach(([moduleId, state]) => {
      const historicalProof = state?.proof && typeof state.proof === 'object' ? state.proof : {};
      Object.entries(historicalProof).forEach(([skillId, proved]) => {
        if (proved) applyLevel(skills, skillId, 3, { type: 'proof-history', moduleId });
      });

      if (!state?.completedAt) return;
      const definition = definitions?.[moduleId];
      if (!definition) return;
      const decisions = state.decisions || {};
      (definition.decisions || []).forEach(decision => {
        const option = (decision.options || []).find(item => item.id === decisions[decision.id]);
        if (!option?.strong) return;
        (decision.skills || []).forEach(skillId => applyLevel(skills, skillId, 3, { type: 'proof', moduleId, decisionId: decision.id }));
      });
    });
  }

  function m01Proof(skills, simState) {
    if (!simState?.reviewReachedAt && !simState?.completedAt) return;
    const records = simState?.run?.decisions || [];
    records.forEach(record => {
      const proof = M01_PROOF[record.decisionId];
      if (!proof || record.optionId !== proof.optionId) return;
      proof.skills.forEach(skillId => applyLevel(skills, skillId, 3, { type: 'proof', moduleId: 'm01', decisionId: record.decisionId }));
    });
  }

  function derive({ courseState = {}, practiceState = {}, simState = null, modules = [], practices = null } = {}) {
    const skills = Object.fromEntries(Object.values(SKILLS).map(skill => [skill.id, {
      ...skill,
      level: 0,
      label: LEVELS[0].label,
      evidence: [],
    }]));

    Object.entries(LESSON_SKILLS).forEach(([lessonId, skillIds]) => {
      const lesson = lessonById(modules, lessonId);
      const evidence = labEvidence(lesson, courseState);
      if (!evidence.encountered && !evidence.applied) return;
      const level = evidence.applied ? 2 : 1;
      skillIds.forEach(skillId => applyLevel(skills, skillId, level, {
        type: evidence.applied ? 'application' : 'decision',
        lessonId,
        answeredDrills: evidence.answeredDrills,
        requiredDrills: evidence.requiredDrills,
        completedFields: evidence.completedFields,
        requiredFields: evidence.requiredFields,
      }));
    });

    const definitions = practices || window.PM01ModulePracticeV6?.PRACTICES || {};
    practiceProof(skills, practiceState, definitions);
    m01Proof(skills, simState);

    const values = Object.values(skills);
    return {
      skills,
      counts: {
        understood: values.filter(skill => skill.level >= 1).length,
        applied: values.filter(skill => skill.level >= 2).length,
        proved: values.filter(skill => skill.level >= 3).length,
      },
    };
  }

  function nextEvidence(skillId, derived) {
    const skill = derived?.skills?.[skillId];
    if (!skill || skill.level <= 0) return 'Прими первое решение в уроке, связанном с этой компетенцией.';
    if (skill.level === 1) return 'Заверши рабочую карту урока и зафиксируй применение на конкретном проекте.';
    if (skill.level === 2) return 'Пройди итоговую практику связанного модуля сильным решением.';
    return 'Компетенция подтверждена итоговой практикой. Ищи перенос в следующем модуле.';
  }

  window.PM01MasteryV6 = Object.freeze({ LEVELS, SKILLS, LESSON_SKILLS, M01_PROOF, derive, nextEvidence, labEvidence });
})();
