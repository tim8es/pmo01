(function () {
  'use strict';

  const DATA = window.PM01;
  const MASTERY = window.PM01MasteryV7;
  const PRACTICE = window.PM01ModulePracticeV7;
  const STORAGE_KEY = 'pm01-state-v1';
  const SIM_STORAGE_KEY = 'pm01-sim-m01-v1';
  const SIM_TREATMENT = 'm01-mission-partner-launch-v1';

  const allLessons = DATA.modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      moduleId: module.id,
      moduleTitle: module.title,
      moduleIndex,
      lessonIndex,
    }))
  );

  const defaultState = {
    completed: [],
    notes: {},
    criteria: {},
    lastLesson: null,
    diagnostic: {},
    lab: {},
    practice: {},
  };

  let state = loadState();

  function parseJson(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_) { return fallback; }
  }

  function loadState() {
    try {
      const stored = parseJson(localStorage.getItem(STORAGE_KEY), {});
      return {
        ...defaultState,
        ...stored,
        completed: Array.isArray(stored.completed) ? stored.completed : [],
        notes: stored.notes || {},
        diagnostic: stored.diagnostic || {},
        lab: stored.lab || {},
        practice: stored.practice || {},
      };
    } catch (_) {
      return { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderSidebarProgress();
  }

  function readSimState() {
    try { return parseJson(localStorage.getItem(SIM_STORAGE_KEY), null); } catch (_) { return null; }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function moduleById(id) {
    return DATA.modules.find((module) => module.id === id) || null;
  }

  function lessonById(id) {
    return allLessons.find((lesson) => lesson.id === id) || null;
  }

  function ensureLabState(id) {
    state.lab ||= {};
    state.lab[id] ||= { drillAnswers: {}, workbook: {} };
    state.lab[id].drillAnswers ||= {};
    state.lab[id].workbook ||= {};
    return state.lab[id];
  }

  function labReady(lesson) {
    if (!lesson?.learningLab) return { ready: false, answeredDrills: 0, requiredDrills: 0, completedFields: 0, requiredFields: 0 };
    const lessonState = ensureLabState(lesson.id);
    const requiredDrills = (lesson.learningLab.drills || []).filter((drill) => drill.required !== false);
    const requiredFields = (lesson.learningLab.workbookFields || []).filter((field) => field.required !== false);
    const answeredDrills = requiredDrills.filter((drill) => Boolean(lessonState.drillAnswers[drill.id])).length;
    const completedFields = requiredFields.filter((field) => String(lessonState.workbook[field.id] || '').trim()).length;
    return {
      ready: requiredDrills.length > 0 && requiredFields.length > 0 && answeredDrills === requiredDrills.length && completedFields === requiredFields.length,
      answeredDrills,
      requiredDrills: requiredDrills.length,
      completedFields,
      requiredFields: requiredFields.length,
    };
  }

  function isLessonComplete(lesson) {
    return Boolean(lesson && state.completed.includes(lesson.id) && labReady(lesson).ready);
  }

  function m01PracticeComplete() {
    const envelope = readSimState();
    if (!envelope || envelope.treatmentId !== SIM_TREATMENT || envelope.missionVersion !== 1) return false;
    const decisions = envelope.run?.decisions;
    return Boolean(
      Array.isArray(decisions) && decisions.length === 4 &&
      envelope.completedAt && envelope.reviewReachedAt && envelope.screen === 'review'
    );
  }

  function ensurePracticeState(moduleId) {
    state.practice ||= {};
    state.practice[moduleId] ||= { decisions: {}, proof: {}, completedAt: null };
    state.practice[moduleId].decisions ||= {};
    state.practice[moduleId].proof ||= {};
    return state.practice[moduleId];
  }

  function isPracticeComplete(moduleId) {
    if (moduleId === 'm01') return m01PracticeComplete();
    return Boolean(state.practice?.[moduleId]?.completedAt);
  }

  function moduleLessonsComplete(module) {
    return (module?.lessons || []).every((lesson) => isLessonComplete(lessonById(lesson.id)));
  }

  function moduleComplete(module) {
    return moduleLessonsComplete(module) && isPracticeComplete(module.id);
  }

  function moduleProgress(module) {
    const lessonsDone = module.lessons.filter((lesson) => isLessonComplete(lessonById(lesson.id))).length;
    const practiceDone = isPracticeComplete(module.id) ? 1 : 0;
    return { done: lessonsDone + practiceDone, total: module.lessons.length + 1 };
  }

  function completedCount() {
    return allLessons.filter(isLessonComplete).length;
  }

  function completedStepCount() {
    return completedCount() + DATA.modules.filter((module) => isPracticeComplete(module.id)).length;
  }

  function progress() {
    const total = allLessons.length + DATA.modules.length;
    return total ? Math.round((completedStepCount() / total) * 100) : 0;
  }

  function mastery() {
    return MASTERY.derive({ courseState: state, modules: DATA.modules, simState: readSimState() });
  }

  function skillIdForStep(step) {
    if (!step) return 'work';
    if (step.type === 'lesson') return MASTERY.LESSON_SKILLS[step.lesson.id]?.[0] || step.lesson.learningLab?.skillId || 'work';
    if (step.type === 'practice') return PRACTICE.definition(step.module.id)?.decisions?.[0]?.skillId || 'feedback';
    return 'work';
  }

  function nextStep() {
    for (const module of DATA.modules) {
      for (const lessonData of module.lessons) {
        const lesson = lessonById(lessonData.id);
        if (!isLessonComplete(lesson)) {
          return { type: 'lesson', module, lesson, href: `#/lesson/${lesson.id}`, title: lesson.title };
        }
      }
      if (!isPracticeComplete(module.id)) {
        if (module.id === 'm01') {
          return { type: 'm01-practice', module, href: 'simulator.html#/mission/m01', title: 'Итоговая практика M01' };
        }
        return { type: 'practice', module, href: `#/practice/${module.id}`, title: `Итоговая практика ${module.id.toUpperCase()}` };
      }
    }
    const last = DATA.modules.at(-1);
    return { type: 'complete', module: last, href: '#/course', title: 'Курс завершён' };
  }

  function afterLessonHref(lesson) {
    const module = moduleById(lesson.moduleId);
    const isLast = lesson.lessonIndex === module.lessons.length - 1;
    if (!isLast) return `#/lesson/${module.lessons[lesson.lessonIndex + 1].id}`;
    return module.id === 'm01' ? 'simulator.html#/mission/m01' : `#/practice/${module.id}`;
  }

  function afterPracticeHref(moduleId) {
    const index = DATA.modules.findIndex((module) => module.id === moduleId);
    const nextModule = DATA.modules[index + 1];
    return nextModule ? `#/lesson/${nextModule.lessons[0].id}` : '#/course';
  }

  function showToast(message) {
    const toast = document.querySelector('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function setActiveNav(route) {
    document.querySelectorAll('.main-nav a').forEach((link) => {
      const expected = link.dataset.route;
      const active = expected === 'home'
        ? route === 'home'
        : expected === route || (expected === 'course' && ['lesson', 'practice'].includes(route));
      link.classList.toggle('active', active);
    });
  }

  function renderSidebarProgress() {
    const target = document.querySelector('#sidebar-progress');
    if (!target || !MASTERY) return;
    const derived = mastery();
    target.innerHTML = `
      <div class="label-row"><span>Компетенции</span><strong>${derived.counts.proved}/7</strong></div>
      <div class="progress-track" aria-label="Доказано ${derived.counts.proved} из 7 компетенций"><div class="progress-fill" style="width:${Math.round(derived.counts.proved / 7 * 100)}%"></div></div>
      <div class="v7-sidebar-levels"><span>Понял ${derived.counts.understood}</span><span>Применил ${derived.counts.applied}</span><span>Доказал ${derived.counts.proved}</span></div>
      <div class="label-row v7-course-percent"><span>Путь курса</span><strong>${progress()}%</strong></div>`;
  }

  function skillMap(derived) {
    return Object.values(MASTERY.SKILLS).map((meta) => {
      const item = derived.skills[meta.id];
      return `<article class="v7-skill level-${item.level}">
        <div><span>${escapeHtml(meta.name)}</span><strong>${escapeHtml(item.label)}</strong></div>
        <p>${escapeHtml(MASTERY.nextEvidence(meta.id, derived))}</p>
      </article>`;
    }).join('');
  }

  function homeView() {
    const step = nextStep();
    const derived = mastery();
    const skillId = skillIdForStep(step);
    const currentSkill = derived.skills[skillId] || derived.skills.work;
    const moduleIndex = DATA.modules.findIndex((module) => module.id === step.module?.id);
    const complete = step.type === 'complete';

    return `<div class="page v7-home">
      <section class="v7-home-hero">
        <div class="v7-next-card">
          <p class="eyebrow">${complete ? 'Маршрут завершён' : `Следующий шаг · M${String(moduleIndex + 1).padStart(2, '0')}`}</p>
          <h1>${complete ? 'Курс пройден. Теперь закрепляй решения в работе.' : escapeHtml(step.title)}</h1>
          <p class="lead">${complete ? 'Карта компетенций показывает, какие навыки уже подтверждены практикой, а где ещё нужен перенос.' : escapeHtml(step.module?.outcome || '')}</p>
          <div class="v7-actions"><a class="button primary" href="${step.href}">${complete ? 'Открыть учебный путь' : 'Продолжить обучение →'}</a><a class="button subtle" href="#/course">Весь путь</a></div>
        </div>
        <aside class="v7-skill-focus">
          <p class="eyebrow">Навык сейчас</p>
          <h2>${escapeHtml(currentSkill.name)}</h2>
          <div class="v7-level"><strong>${escapeHtml(currentSkill.label)}</strong><span>${currentSkill.level}/3</span></div>
          <div class="v7-next-evidence"><small>Следующее доказательство</small><p>${escapeHtml(MASTERY.nextEvidence(skillId, derived))}</p></div>
        </aside>
      </section>

      <section class="v7-learning-loop">
        <div class="v7-section-head"><div><p class="eyebrow">Как учимся</p><h2>Решение важнее чтения</h2></div><p>Каждый урок начинается с выбора, затем показывает механизм, даёт рабочий инструмент и требует evidence на своём проекте.</p></div>
        <div class="v7-loop"><span>1 · Реши</span><span>2 · Увидь последствия</span><span>3 · Разбери механизм</span><span>4 · Примени</span><span>5 · Докажи</span></div>
      </section>

      <section class="v7-competencies">
        <div class="v7-section-head"><div><p class="eyebrow">Карта компетенций</p><h2>Не проценты, а доказанные навыки</h2></div><p>Уровень растёт только от решений, заполненной рабочей карты и итоговой практики.</p></div>
        <div class="v7-skill-map">${skillMap(derived)}</div>
      </section>
    </div>`;
  }

  function stepStatus(done, available) {
    if (done) return 'Готово';
    if (available) return 'Сейчас';
    return 'Дальше';
  }

  function courseView() {
    const derived = mastery();
    const current = nextStep();
    return `<div class="page v7-course">
      <section class="v7-course-head">
        <div><p class="eyebrow">Учебный путь</p><h1>10 модулей.<br>Тридцать реальных шагов.</h1><p class="lead">В каждом модуле два урока и одна итоговая практика. Урок учит технике, практика проверяет перенос без подсказки.</p></div>
        <div class="v7-course-proof"><strong>${derived.counts.proved}/7</strong><span>компетенций доказано</span><strong>${completedStepCount()}/30</strong><span>шагов завершено</span></div>
      </section>
      <div class="v7-module-list">${DATA.modules.map((module, moduleIndex) => {
        const moduleDone = moduleComplete(module);
        const lessonsDone = module.lessons.map((lesson) => isLessonComplete(lessonById(lesson.id)));
        const practiceDone = isPracticeComplete(module.id);
        const practiceReady = lessonsDone.every(Boolean);
        const isCurrent = current.module?.id === module.id;
        const practiceHref = module.id === 'm01' ? 'simulator.html#/mission/m01' : `#/practice/${module.id}`;
        const skills = [...new Set(module.lessons.flatMap((lesson) => MASTERY.LESSON_SKILLS[lesson.id] || []))];
        return `<article class="v7-module ${moduleDone ? 'complete' : isCurrent ? 'current' : ''}">
          <div class="v7-module-top"><span class="v7-module-index">${String(moduleIndex + 1).padStart(2, '0')}</span><div><p class="eyebrow">${moduleDone ? 'Завершено' : isCurrent ? 'Текущий модуль' : 'Модуль'}</p><h2>${escapeHtml(module.title)}</h2><p>${escapeHtml(module.outcome)}</p></div></div>
          <ol class="v7-module-steps">
            ${module.lessons.map((lesson, lessonIndex) => `<li class="${lessonsDone[lessonIndex] ? 'done' : ''}"><span>${lessonsDone[lessonIndex] ? '✓' : lessonIndex + 1}</span><a href="#/lesson/${lesson.id}">${escapeHtml(lesson.title)}</a><small>${stepStatus(lessonsDone[lessonIndex], isCurrent && current.type === 'lesson' && current.lesson?.id === lesson.id)}</small></li>`).join('')}
            <li class="${practiceDone ? 'done' : ''}"><span>${practiceDone ? '✓' : '3'}</span>${practiceReady ? `<a href="${practiceHref}">Итоговая практика</a>` : `<strong>Итоговая практика</strong>`}<small>${practiceReady ? stepStatus(practiceDone, isCurrent && ['practice', 'm01-practice'].includes(current.type)) : 'После 2 уроков'}</small></li>
          </ol>
          <div class="v7-module-skills">${skills.map((id) => `<span>${escapeHtml(MASTERY.SKILLS[id]?.name || id)}</span>`).join('')}</div>
        </article>`;
      }).join('')}</div>
    </div>`;
  }

  function renderLabFeedback(drill, answerId) {
    const option = drill?.options?.find((item) => item.id === answerId);
    if (!option) return `<div class="lab-feedback" aria-live="polite" data-lab-feedback="${escapeHtml(drill?.id || '')}"><span>Сначала выбери вариант.</span></div>`;
    const score = Number(option.score || 0);
    const label = score >= 3 ? 'Сильный ход' : score >= 2 ? 'Рабочий, но неполный' : 'Рискованный ход';
    return `<div class="lab-feedback ${score >= 3 ? 'strong' : 'needs-work'}" aria-live="polite" data-lab-feedback="${escapeHtml(drill.id)}"><strong>${label}</strong><p>${escapeHtml(option.feedback || '')}</p></div>`;
  }

  function renderLabDrill(drill, lessonState, index) {
    if (!drill) return '';
    const answer = lessonState.drillAnswers[drill.id];
    const cold = drill.stage === 'cold' || index === 0;
    const frozen = Boolean(cold && answer);
    return `<section class="lab-drill" id="${cold ? 'lab-cold' : `lab-drill-${index + 1}`}">
      <p class="lab-step">${cold ? '01 · Сначала реши' : `0${Math.min(index + 4, 9)} · Повторная попытка`}</p>
      <h2>${escapeHtml(drill.title || 'Решение')}</h2>
      <p class="lab-situation">${escapeHtml(drill.situation || '')}</p>
      <fieldset><legend>${escapeHtml(drill.prompt || 'Что сделаешь?')}</legend><div class="lab-options">${(drill.options || []).map((option) => `<label class="lab-option ${answer === option.id ? 'selected' : ''}"><input type="radio" name="lab-${drill.id}" value="${option.id}" data-lab-drill="${drill.id}" ${answer === option.id ? 'checked' : ''} ${frozen ? 'disabled' : ''}><span>${escapeHtml(option.label)}</span></label>`).join('')}</div></fieldset>
      ${renderLabFeedback(drill, answer)}
      ${frozen ? '<p class="v7-frozen-note">Первое решение зафиксировано. Это сохраняет честность тренировки.</p>' : ''}
    </section>`;
  }

  function renderTerms(terms) {
    if (!terms?.length) return '';
    return `<details class="v7-terms"><summary>Ключевые термины · ${terms.length}</summary><dl>${terms.map((item) => `<div><dt>${escapeHtml(item.term)}</dt><dd>${escapeHtml(item.meaning)}</dd></div>`).join('')}</dl></details>`;
  }

  function renderLearningLab(lesson, done) {
    const lab = lesson.learningLab;
    const lessonState = ensureLabState(lesson.id);
    const readiness = labReady(lesson);
    return `<section class="learning-lab" id="practice">
      <header class="lab-intro"><p class="eyebrow">Практический урок</p><h2>Навык урока</h2><p>${escapeHtml(lab.skill)}</p></header>
      <section class="v7-mission"><p class="lab-step">Цель</p><p>${escapeHtml(lab.mission || '')}</p>${renderTerms(lab.terms)}</section>
      ${(lab.drills || []).slice(0, 1).map((drill, index) => renderLabDrill(drill, lessonState, index)).join('')}
      <section class="lab-worked" id="lab-worked"><p class="lab-step">02 · Сверь мышление</p><h2>${escapeHtml(lab.workedExample.title)}</h2><ol>${(lab.workedExample.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></section>
      <section class="lab-technique" id="lab-technique"><p class="lab-step">03 · Техника</p><h2>${escapeHtml(lab.technique.name)}</h2><p class="lab-purpose">${escapeHtml(lab.technique.purpose)}</p><ol>${(lab.technique.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol><div class="lab-model">${escapeHtml(lab.technique.model)}</div>${lesson.body?.length ? `<details class="v7-theory"><summary>Почему это работает</summary>${lesson.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</details>` : ''}</section>
      ${(lab.drills || []).slice(1).map((drill, index) => renderLabDrill(drill, lessonState, index + 1)).join('')}
      <section class="lab-workbook" id="lab-workbook"><p class="lab-step">05 · Рабочий инструмент</p><h2>${escapeHtml(lab.workbookTitle)}</h2><p>Не отмечай галочки. Зафиксируй факты, которые можно проверить или использовать в решении.</p><div class="lab-fields">${(lab.workbookFields || []).map((field) => `<label class="lab-field"><strong>${escapeHtml(field.label)}</strong><span>${escapeHtml(field.prompt)}</span><textarea data-lab-field="${field.id}" rows="3">${escapeHtml(lessonState.workbook[field.id] || '')}</textarea></label>`).join('')}</div></section>
      <section class="lab-transfer"><p class="lab-step">06 · Перенос</p><h2>Перенеси на реальную работу</h2><p>${escapeHtml(lab.transferPrompt)}</p></section>
      <section class="lab-finish"><p class="completion-status ${readiness.ready ? 'ready' : ''}" id="completion-status">${readiness.answeredDrills}/${readiness.requiredDrills} решений · ${readiness.completedFields}/${readiness.requiredFields} evidence${readiness.ready ? ' · можно завершать урок' : ' · заверши обязательные решения и рабочую карту'}</p><label for="lesson-notes"><strong>Личные заметки</strong><span class="field-help">Необязательно.</span></label><textarea class="notes" id="lesson-notes" placeholder="Что изменилось в твоём решении?">${escapeHtml(state.notes[lesson.id] || '')}</textarea><div class="lesson-actions">${done ? `<a class="button primary" href="${afterLessonHref(lesson)}">Продолжить →</a>` : `<button class="button primary" id="complete-lesson" ${readiness.ready ? '' : 'disabled'}>Завершить урок →</button>`}<button class="button" id="save-notes">Сохранить заметки</button></div></section>
    </section>`;
  }

  function lessonView(id) {
    const lesson = lessonById(id);
    if (!lesson) return notFoundView();
    state.lastLesson = id;
    ensureLabState(id);
    saveState();
    const index = allLessons.findIndex((item) => item.id === id);
    const previous = allLessons[index - 1];
    const done = isLessonComplete(lesson);
    const derived = mastery();
    const skillId = MASTERY.LESSON_SKILLS[id]?.[0] || lesson.learningLab?.skillId || 'work';
    const skill = derived.skills[skillId];

    return `<div class="page v7-lesson-shell">
      <article>
        <header class="lesson-header"><p class="eyebrow">${escapeHtml(lesson.moduleTitle)} · ${lesson.lessonIndex + 1}/2</p><h1>${escapeHtml(lesson.title)}</h1><p class="lead">${escapeHtml(lesson.thesis)}</p><div class="v7-lesson-band"><strong>${escapeHtml(skill.name)} · ${escapeHtml(skill.label)}</strong><span>${lesson.minutes} минут · решение + техника + evidence</span></div></header>
        ${renderLearningLab(lesson, done)}
      </article>
      <aside class="lesson-aside"><nav class="toc" aria-label="Разделы урока"><small>В ЭТОМ УРОКЕ</small><a href="#/lesson/${id}" data-scroll="lab-cold">Решение</a><a href="#/lesson/${id}" data-scroll="lab-technique">Техника</a><a href="#/lesson/${id}" data-scroll="lab-workbook">Evidence</a></nav><div class="lesson-nav">${previous ? `<a class="button subtle" href="#/lesson/${previous.id}">← Предыдущий</a>` : ''}<a class="button subtle" href="#/course">Учебный путь</a></div></aside>
    </div>`;
  }

  function practiceDecision(definition, practiceState, decision, index) {
    const selectedId = practiceState.decisions[decision.id];
    const selected = decision.options.find((option) => option.id === selectedId);
    return `<section class="v7-practice-decision"><p class="lab-step">D${index + 1} · ${escapeHtml(MASTERY.SKILLS[decision.skillId]?.name || decision.skillId)}</p><h2>${escapeHtml(decision.title)}</h2><p class="lab-situation">${escapeHtml(decision.situation)}</p><fieldset><legend>${escapeHtml(decision.prompt)}</legend><div class="v7-practice-options">${decision.options.map((option) => `<label class="v7-practice-option ${selectedId === option.id ? 'selected' : ''}"><input type="radio" name="practice-${decision.id}" value="${option.id}" data-practice-decision="${decision.id}" ${selectedId === option.id ? 'checked' : ''} ${selectedId ? 'disabled' : ''}><span>${escapeHtml(option.label)}</span></label>`).join('')}</div></fieldset>${selected ? `<div class="v7-practice-feedback ${selected.strong ? 'strong' : ''}"><strong>${selected.strong ? 'Сильный ход' : 'Есть что усилить'}</strong><p>${escapeHtml(selected.feedback)}</p></div>` : ''}</section>`;
  }

  function practiceView(moduleId) {
    const module = moduleById(moduleId);
    if (!module || moduleId === 'm01') return notFoundView();
    const definition = PRACTICE.definition(moduleId);
    if (!definition) return notFoundView();
    const ready = moduleLessonsComplete(module);
    const practiceState = ensurePracticeState(moduleId);

    if (!ready) {
      return `<div class="page v7-practice"><section class="v7-practice-head"><p class="eyebrow">${moduleId.toUpperCase()} · Итоговая практика</p><h1>Сначала заверши два урока модуля</h1><p class="lead">Итоговая практика проверяет перенос без подсказки, поэтому открывается после evidence в обоих уроках.</p><div class="v7-actions">${module.lessons.map((lesson) => `<a class="button" href="#/lesson/${lesson.id}">${escapeHtml(lesson.title)}</a>`).join('')}</div></section></div>`;
    }

    const complete = PRACTICE.isComplete(definition, practiceState);
    const currentProof = complete ? PRACTICE.proofFor(definition, practiceState.decisions) : {};
    const mergedProof = complete ? PRACTICE.mergeProof(practiceState, currentProof) : practiceState.proof;
    const proved = Object.keys(mergedProof || {}).filter((id) => mergedProof[id]);
    const missing = [...new Set(definition.decisions.map((decision) => decision.skillId))].filter((id) => !mergedProof?.[id]);

    return `<div class="page v7-practice">
      <header class="v7-practice-head"><p class="eyebrow">${moduleId.toUpperCase()} · Итоговая практика</p><h1>${escapeHtml(module.title)}</h1><p class="lead">${escapeHtml(definition.lead)}</p><p>Два решения. Без числовой оценки. Навык получает «Доказал» только если выбран сильный ход.</p></header>
      <div class="v7-practice-list">${definition.decisions.map((decision, index) => practiceDecision(definition, practiceState, decision, index)).join('')}</div>
      ${complete ? `<section class="v7-practice-review"><div><p class="eyebrow">Что доказано</p><h2>${proved.length ? proved.map((id) => escapeHtml(MASTERY.SKILLS[id]?.name || id)).join(' · ') : 'Пока без уровня «Доказал»'}</h2></div><div><p class="eyebrow">Что усилить</p><p>${missing.length ? missing.map((id) => `${escapeHtml(MASTERY.SKILLS[id]?.name || id)} — вернись к связанному уроку и повтори практику.`).join('<br>') : 'Все навыки этого модуля подтверждены.'}</p></div><div class="v7-actions"><a class="button primary" href="${afterPracticeHref(moduleId)}">Дальше →</a><button class="button subtle" type="button" data-practice-reset>Пройти ещё раз</button></div></section>` : '<p class="v7-practice-progress">Зафиксируй оба решения, чтобы получить итоговый разбор.</p>'}
    </div>`;
  }

  function diagnosticView() {
    const choices = [
      { score: 0, label: 'Нет — это происходит случайно или никогда' },
      { score: 1, label: 'Иногда — зависит от конкретного человека' },
      { score: 2, label: 'Часто — есть практика, но она нестабильна' },
      { score: 3, label: 'Системно — есть правило, владелец и обратная связь' },
    ];
    return `<div class="page"><p class="eyebrow">Необязательная самопроверка</p><h1>Где проект теряет управляемость?</h1><p class="lead">Оцени последние четыре недели. Это не меняет порядок курса — только помогает увидеть слабый поток.</p><div class="diagnostic-grid section"><form id="diagnostic-form">${DATA.diagnostics.map((item, index) => `<fieldset class="question-card"><legend>${index + 1}. ${escapeHtml(item.q)}</legend><div class="options">${choices.map((choice) => `<label class="option"><input type="radio" name="q${index}" value="${choice.score}" data-flow="${item.flow}" ${String(state.diagnostic[index]) === String(choice.score) ? 'checked' : ''}><span>${choice.label}</span></label>`).join('')}</div></fieldset>`).join('')}</form><aside class="diagnostic-result" id="diagnostic-result"></aside></div></div>`;
  }

  function renderDiagnosticResult() {
    const target = document.querySelector('#diagnostic-result');
    if (!target) return;
    const answers = Object.keys(state.diagnostic);
    if (answers.length < DATA.diagnostics.length) {
      target.innerHTML = `<p class="eyebrow">Результат</p><h3>${answers.length}/${DATA.diagnostics.length} ответов</h3><p class="result-empty">Ответь на все вопросы. Ответы сохраняются автоматически.</p>`;
      return;
    }
    const scores = Object.fromEntries(DATA.flows.map((flow) => [flow.id, []]));
    DATA.diagnostics.forEach((item, index) => scores[item.flow].push(Number(state.diagnostic[index])));
    const results = DATA.flows.map((flow) => ({ ...flow, score: Math.round(scores[flow.id].reduce((a, b) => a + b, 0) / (scores[flow.id].length * 3) * 100) }));
    const weakest = [...results].sort((a, b) => a.score - b.score)[0];
    target.innerHTML = `<p class="eyebrow">Зона внимания</p><h3>${escapeHtml(weakest.name)}: ${weakest.score}%</h3><p class="result-empty">Обрати особое внимание на этот поток в основном маршруте.</p>${results.map((result) => `<div class="score-row"><div><span>${escapeHtml(result.name)}</span><strong>${result.score}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${result.score}%;background:${result.color}"></div></div></div>`).join('')}<a class="button primary" style="width:100%;margin-top:12px" href="#/course">К учебному пути</a>`;
  }

  function toolkitView() {
    return `<div class="page"><p class="eyebrow">Инструменты</p><h1>Шаблон нужен только тогда, когда меняет решение</h1><p class="lead">Скачай Markdown, заполни фактами проекта и используй в реальной рабочей ситуации.</p><div class="tool-grid">${DATA.tools.map((tool, index) => `<article class="tool-card"><span class="tool-number">TOOL ${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(tool.name)}</h3><p>${escapeHtml(tool.description)}</p><button class="button subtle download-tool" data-index="${index}">Скачать .md ↓</button></article>`).join('')}</div></div>`;
  }

  function notFoundView() {
    return `<div class="page empty-state"><p class="eyebrow">404</p><h1>Такой страницы нет</h1><p class="lead" style="margin-inline:auto">Вернись к учебному пути.</p><a class="button primary" href="#/course">Открыть путь</a></div>`;
  }

  function updateLabCompletionGate(id) {
    const lesson = lessonById(id);
    if (!lesson) return;
    const readiness = labReady(lesson);
    const button = document.querySelector('#complete-lesson');
    const status = document.querySelector('#completion-status');
    if (button) button.disabled = !readiness.ready;
    if (status) {
      status.textContent = `${readiness.answeredDrills}/${readiness.requiredDrills} решений · ${readiness.completedFields}/${readiness.requiredFields} evidence${readiness.ready ? ' · можно завершать урок' : ' · заверши обязательные решения и рабочую карту'}`;
      status.classList.toggle('ready', readiness.ready);
    }
  }

  function bindLessonEvents(id) {
    const lesson = lessonById(id);
    document.querySelectorAll('[data-scroll]').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelector(`#${link.dataset.scroll}`)?.scrollIntoView({ behavior: 'smooth' });
    }));

    document.querySelectorAll('[data-lab-drill]').forEach((input) => input.addEventListener('change', (event) => {
      const drillId = event.target.dataset.labDrill;
      const drill = lesson?.learningLab?.drills?.find((item) => item.id === drillId);
      const lessonState = ensureLabState(id);
      if (drill?.stage === 'cold' && lessonState.drillAnswers[drillId]) return;
      lessonState.drillAnswers[drillId] = event.target.value;
      saveState();
      if (drill?.stage === 'cold') {
        document.querySelectorAll(`[data-lab-drill="${drillId}"]`).forEach((item) => { item.disabled = true; });
      }
      const feedback = document.querySelector(`[data-lab-feedback="${drillId}"]`);
      if (feedback && drill) feedback.outerHTML = renderLabFeedback(drill, event.target.value);
      updateLabCompletionGate(id);
    }));

    document.querySelectorAll('[data-lab-field]').forEach((field) => field.addEventListener('input', (event) => {
      const lessonState = ensureLabState(id);
      lessonState.workbook[event.target.dataset.labField] = event.target.value;
      saveState();
      updateLabCompletionGate(id);
    }));

    document.querySelector('#save-notes')?.addEventListener('click', () => {
      state.notes[id] = document.querySelector('#lesson-notes')?.value || '';
      saveState();
      showToast('Заметки сохранены');
    });

    document.querySelector('#complete-lesson')?.addEventListener('click', () => {
      if (!labReady(lesson).ready) {
        updateLabCompletionGate(id);
        showToast('Сначала заверши решения и рабочую карту');
        return;
      }
      state.notes[id] = document.querySelector('#lesson-notes')?.value || '';
      if (!state.completed.includes(id)) state.completed = [...state.completed, id];
      saveState();
      showToast('Урок завершён');
      location.href = afterLessonHref(lesson);
    });
  }

  function bindPracticeEvents(moduleId) {
    const definition = PRACTICE.definition(moduleId);
    const practiceState = ensurePracticeState(moduleId);
    document.querySelectorAll('[data-practice-decision]').forEach((input) => input.addEventListener('change', (event) => {
      const decisionId = event.target.dataset.practiceDecision;
      if (practiceState.decisions[decisionId]) return;
      practiceState.decisions[decisionId] = event.target.value;
      if (PRACTICE.isComplete(definition, practiceState)) {
        const proof = PRACTICE.proofFor(definition, practiceState.decisions);
        practiceState.proof = PRACTICE.mergeProof(practiceState, proof);
        practiceState.completedAt ||= new Date().toISOString();
      }
      saveState();
      render();
    }));
    document.querySelector('[data-practice-reset]')?.addEventListener('click', () => {
      practiceState.decisions = {};
      practiceState.completedAt = null;
      saveState();
      render();
    });
  }

  function bindViewEvents(route, id) {
    if (route === 'lesson') bindLessonEvents(id);
    if (route === 'practice') bindPracticeEvents(id);
    if (route === 'diagnostic') {
      document.querySelector('#diagnostic-form')?.addEventListener('change', (event) => {
        const index = Number(event.target.name.slice(1));
        state.diagnostic[index] = Number(event.target.value);
        saveState();
        renderDiagnosticResult();
      });
      renderDiagnosticResult();
    }
    if (route === 'toolkit') {
      document.querySelectorAll('.download-tool').forEach((button) => button.addEventListener('click', () => {
        const tool = DATA.tools[Number(button.dataset.index)];
        const blob = new Blob([tool.content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = tool.file;
        link.click();
        URL.revokeObjectURL(url);
        showToast(`Скачан ${tool.file}`);
      }));
    }
  }

  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!parts.length) return { route: 'home' };
    if (parts[0] === 'lesson') return { route: 'lesson', id: parts[1] };
    if (parts[0] === 'practice') return { route: 'practice', id: parts[1] };
    if (parts[0] === 'validation' && parts[1] === 'm01' && parts.length === 2) return { route: 'validation-m01' };
    if (['course', 'diagnostic', 'toolkit'].includes(parts[0])) return { route: parts[0] };
    return { route: 'not-found' };
  }

  function render() {
    const { route, id } = parseRoute();
    if (route === 'validation-m01') return;
    const views = {
      home: homeView,
      course: courseView,
      lesson: () => lessonView(id),
      practice: () => practiceView(id),
      diagnostic: diagnosticView,
      toolkit: toolkitView,
      'not-found': notFoundView,
    };
    const main = document.querySelector('#main');
    if (!main) return;
    main.innerHTML = views[route]();
    setActiveNav(route);
    renderSidebarProgress();
    bindViewEvents(route, id);
    window.PM01ThemeV7?.bind?.();
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    document.querySelector('#mobile-nav')?.classList.remove('open');
    document.querySelector('#menu-button')?.setAttribute('aria-expanded', 'false');
  }

  document.querySelector('#menu-button')?.addEventListener('click', (event) => {
    const nav = document.querySelector('#mobile-nav');
    const open = nav?.classList.toggle('open') || false;
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('pageshow', () => renderSidebarProgress());
  window.PM01AppV7 = Object.freeze({ render, parseRoute, nextStep, labReady, isLessonComplete });
  render();
})();
