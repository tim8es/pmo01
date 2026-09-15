(function () {
  'use strict';

  const LEVELS = Object.freeze([
    Object.freeze({ level: 0, label: 'Не встречал' }),
    Object.freeze({ level: 1, label: 'Понял' }),
    Object.freeze({ level: 2, label: 'Применил' }),
    Object.freeze({ level: 3, label: 'Доказал' }),
  ]);

  const SKILLS = Object.freeze({
    value: Object.freeze({ id: 'value', name: 'Ценность' }),
    work: Object.freeze({ id: 'work', name: 'Работа' }),
    information: Object.freeze({ id: 'information', name: 'Информация' }),
    decisions: Object.freeze({ id: 'decisions', name: 'Решения' }),
    dependencies: Object.freeze({ id: 'dependencies', name: 'Зависимости' }),
    uncertainty: Object.freeze({ id: 'uncertainty', name: 'Неопределённость' }),
    feedback: Object.freeze({ id: 'feedback', name: 'Обратная связь' }),
  });

  const LESSON_SKILLS = Object.freeze({
    'project-system': Object.freeze(['work', 'dependencies']),
    'system-diagnostic': Object.freeze(['decisions']),
    'outcome-tree': Object.freeze(['value']),
    'assumption-map': Object.freeze(['uncertainty']),
    'dependency-graph': Object.freeze(['dependencies']),
    'critical-chain': Object.freeze(['dependencies']),
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

  function lessonById(modules, id) {
    return (modules || []).flatMap((module) => module.lessons || []).find((lesson) => lesson.id === id) || null;
  }

  function labEvidence(lesson, courseState) {
    if (!lesson?.learningLab) return { encountered: false, applied: false };
    const labState = courseState?.lab?.[lesson.id] || {};
    const answers = labState.drillAnswers || {};
    const workbook = labState.workbook || {};
    const drills = (lesson.learningLab.drills || []).filter((item) => item.required !== false);
    const fields = (lesson.learningLab.workbookFields || []).filter((item) => item.required !== false);
    const answered = drills.filter((item) => Boolean(answers[item.id])).length;
    const filled = fields.filter((item) => String(workbook[item.id] || '').trim()).length;
    const ready = drills.length > 0 && fields.length > 0 && answered === drills.length && filled === fields.length;
    return {
      encountered: answered > 0,
      applied: Boolean(ready && (courseState?.completed || []).includes(lesson.id)),
      answered,
      drills: drills.length,
      filled,
      fields: fields.length,
    };
  }

  function apply(skills, skillId, level, evidence) {
    const target = skills[skillId];
    if (!target) return;
    if (level > target.level) {
      target.level = level;
      target.label = LEVELS[level].label;
    }
    if (evidence) target.evidence.push(evidence);
  }

  function practiceEvidence(skills, courseState) {
    const practice = courseState?.practice || {};
    for (const [moduleId, practiceState] of Object.entries(practice)) {
      for (const [skillId, proved] of Object.entries(practiceState?.proof || {})) {
        if (proved) apply(skills, skillId, 3, { type: 'module-practice', moduleId });
      }
    }
  }

  function m01Evidence(skills, simState) {
    if (!simState || (!simState.reviewReachedAt && !simState.completedAt)) return;
    const mapping = {
      d1: { option: 'decision-timeline', skills: ['work', 'dependencies'] },
      d2: { option: 'decision-contract', skills: ['decisions'] },
      d3: { option: 'split-decision', skills: ['work'] },
      d4: { option: 'revise-diagnosis', skills: ['decisions'] },
    };
    for (const record of simState?.run?.decisions || []) {
      const rule = mapping[record.decisionId];
      if (!rule || record.optionId !== rule.option) continue;
      rule.skills.forEach((skillId) => apply(skills, skillId, 3, { type: 'm01-practice', decisionId: record.decisionId }));
    }
  }

  function derive({ courseState = {}, modules = [], simState = null } = {}) {
    const skills = Object.fromEntries(Object.values(SKILLS).map((skill) => [skill.id, {
      ...skill,
      level: 0,
      label: LEVELS[0].label,
      evidence: [],
    }]));

    for (const [lessonId, skillIds] of Object.entries(LESSON_SKILLS)) {
      const lesson = lessonById(modules, lessonId);
      const evidence = labEvidence(lesson, courseState);
      const level = evidence.applied ? 2 : evidence.encountered ? 1 : 0;
      if (!level) continue;
      skillIds.forEach((skillId) => apply(skills, skillId, level, { type: level === 2 ? 'application' : 'decision', lessonId }));
    }

    practiceEvidence(skills, courseState);
    m01Evidence(skills, simState);

    const values = Object.values(skills);
    return {
      skills,
      counts: {
        understood: values.filter((item) => item.level >= 1).length,
        applied: values.filter((item) => item.level >= 2).length,
        proved: values.filter((item) => item.level >= 3).length,
      },
    };
  }

  function nextEvidence(skillId, derived) {
    const skill = derived?.skills?.[skillId];
    if (!skill || skill.level === 0) return 'Прими первое решение в связанном уроке.';
    if (skill.level === 1) return 'Заполни рабочую карту урока фактами и заверши перенос на проект.';
    if (skill.level === 2) return 'Подтверди навык сильным решением в итоговой практике модуля.';
    return 'Навык подтверждён. Переноси его в следующие рабочие ситуации.';
  }

  window.PM01MasteryV7 = Object.freeze({ LEVELS, SKILLS, LESSON_SKILLS, derive, nextEvidence, labEvidence });
})();
