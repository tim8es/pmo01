(function () {
  'use strict';

  const LEVELS = Object.freeze([
    Object.freeze({ level: 0, label: 'Не встречал' }),
    Object.freeze({ level: 1, label: 'Понял' }),
    Object.freeze({ level: 2, label: 'Применил' }),
    Object.freeze({ level: 3, label: 'Доказал' }),
  ]);

  const SKILLS = Object.freeze({
    value: Object.freeze({ id: 'value', name: 'Ценность', question: 'Можешь связать работу команды с наблюдаемым изменением для пользователя или бизнеса?' }),
    work: Object.freeze({ id: 'work', name: 'Работа', question: 'Видишь, как результат проходит систему от идеи до использования?' }),
    information: Object.freeze({ id: 'information', name: 'Информация', question: 'Замечаешь, где важная информация задерживается или искажается?' }),
    decisions: Object.freeze({ id: 'decisions', name: 'Решения', question: 'Можешь локализовать решение, владельца и факт, который должен изменить курс?' }),
    dependencies: Object.freeze({ id: 'dependencies', name: 'Зависимости', question: 'Видишь, что реально блокирует следующие ценные действия?' }),
    uncertainty: Object.freeze({ id: 'uncertainty', name: 'Неопределённость', question: 'Умеешь выбрать неизвестное, которое нужно проверить до дорогого решения?' }),
    feedback: Object.freeze({ id: 'feedback', name: 'Обратная связь', question: 'Есть ли ранний сигнал, который покажет, что решение не работает?' }),
  });

  const LESSON_SKILLS = Object.freeze({
    'project-system': Object.freeze(['work', 'dependencies']),
    'system-diagnostic': Object.freeze(['decisions']),
    'outcome-tree': Object.freeze(['value']),
    'assumption-map': Object.freeze(['uncertainty']),
  });

  function normalizeCourseState(courseState) {
    return {
      completed: Array.isArray(courseState?.completed) ? courseState.completed : [],
      lab: courseState?.lab && typeof courseState.lab === 'object' ? courseState.lab : {},
    };
  }

  function lessonById(modules, id) {
    return (modules || []).flatMap((module) => module.lessons || []).find((lesson) => lesson.id === id) || null;
  }

  function labEvidence(lesson, courseState) {
    if (!lesson?.learningLab) {
      return { encountered: false, applied: false, answeredDrills: 0, requiredDrills: 0, completedFields: 0, requiredFields: 0 };
    }

    const state = normalizeCourseState(courseState);
    const stored = state.lab[lesson.id] || {};
    const drillAnswers = stored.drillAnswers || {};
    const workbook = stored.workbook || {};
    const requiredDrills = (lesson.learningLab.drills || []).filter((drill) => drill.required !== false);
    const requiredFields = (lesson.learningLab.workbookFields || []).filter((field) => field.required !== false);
    const answeredDrills = requiredDrills.filter((drill) => Boolean(drillAnswers[drill.id])).length;
    const completedFields = requiredFields.filter((field) => String(workbook[field.id] || '').trim().length > 0).length;
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

  function challengeProof(challengeState) {
    const decisions = challengeState?.decisions || {};
    return {
      value: decisions['value-chain'] === 'strong-value',
      uncertainty: decisions['assumption-priority'] === 'strong-assumption',
    };
  }

  function levelRecord(level) {
    const safeLevel = Math.max(0, Math.min(3, Number(level) || 0));
    return LEVELS[safeLevel];
  }

  function derive({ courseState = {}, challengeState = {}, modules = [] } = {}) {
    const skills = Object.fromEntries(Object.values(SKILLS).map((skill) => [skill.id, {
      ...skill,
      level: 0,
      label: LEVELS[0].label,
      evidence: [],
    }]));

    Object.entries(LESSON_SKILLS).forEach(([lessonId, skillIds]) => {
      const lesson = lessonById(modules, lessonId);
      const evidence = labEvidence(lesson, courseState);
      if (!evidence.encountered && !evidence.applied) return;

      skillIds.forEach((skillId) => {
        const skill = skills[skillId];
        if (!skill) return;
        const candidateLevel = evidence.applied ? 2 : 1;
        if (candidateLevel > skill.level) {
          skill.level = candidateLevel;
          skill.label = levelRecord(candidateLevel).label;
        }
        skill.evidence.push({
          type: evidence.applied ? 'application' : 'decision',
          lessonId,
          answeredDrills: evidence.answeredDrills,
          requiredDrills: evidence.requiredDrills,
          completedFields: evidence.completedFields,
          requiredFields: evidence.requiredFields,
        });
      });
    });

    const proof = challengeProof(challengeState);
    for (const skillId of ['value', 'uncertainty']) {
      if (!proof[skillId]) continue;
      skills[skillId].level = 3;
      skills[skillId].label = LEVELS[3].label;
      skills[skillId].evidence.push({ type: 'proof', challengeId: 'm02' });
    }

    return { skills, proof };
  }

  function nextEvidence(skillId, derived) {
    const skill = derived?.skills?.[skillId];
    if (!skill || skill.level <= 0) return 'Ответь на первое решение в связанном уроке.';
    if (skill.level === 1) return 'Заверши рабочую карту и зафиксируй применение техники.';
    if (skill.level === 2 && skillId === 'value') return 'Пройди итоговый challenge M02 сильным решением по цепочке ценности.';
    if (skill.level === 2 && skillId === 'uncertainty') return 'Пройди итоговый challenge M02 и правильно выбери, какое допущение проверять первым.';
    if (skill.level === 2) return 'Пройди итоговую практику модуля, когда она станет доступна.';
    return 'Навык подтверждён итоговым challenge.';
  }

  window.PM01MasteryV5 = Object.freeze({ LEVELS, SKILLS, LESSON_SKILLS, derive, nextEvidence, labEvidence });
})();
