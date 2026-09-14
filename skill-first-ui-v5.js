(function () {
  'use strict';

  const COURSE_KEY = 'pm01-state-v1';
  const SIM_KEY = 'pm01-sim-m01-v1';
  const M01_TREATMENT = 'm01-mission-partner-launch-v1';
  const M01_VERSION = 1;

  const SKILL_ORDER = ['value', 'work', 'information', 'decisions', 'dependencies', 'uncertainty', 'feedback'];
  const STEP_SKILL = {
    'project-system': 'work',
    'system-diagnostic': 'decisions',
    'outcome-tree': 'value',
    'assumption-map': 'uncertainty',
    'dependency-graph': 'dependencies',
    'critical-chain': 'dependencies',
    queueing: 'work',
    toc: 'work',
    forecasting: 'uncertainty',
    cone: 'uncertainty',
    'risk-kill': 'uncertainty',
    optionality: 'uncertainty',
    'decision-latency': 'decisions',
    escalation: 'decisions',
    'bad-news': 'information',
    'confidence-status': 'information',
    'coordination-tax': 'work',
    'ownership-incentives': 'decisions',
    'operating-cadence': 'feedback',
    capstone: 'feedback',
  };

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
  }

  function courseState() {
    const raw = readJson(COURSE_KEY, {});
    return {
      completed: Array.isArray(raw.completed) ? raw.completed : [],
      lastLesson: raw.lastLesson || null,
      lab: raw.lab || {},
      notes: raw.notes || {},
    };
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function modules() {
    return window.PM01?.modules || [];
  }

  function lessons() {
    return modules().flatMap((module) => (module.lessons || []).map((lesson) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title })));
  }

  function lessonComplete(lesson, state) {
    if (!lesson) return false;
    if (lesson.learningLab && window.PM01MasteryV5?.labEvidence) {
      return window.PM01MasteryV5.labEvidence(lesson, state).applied;
    }
    return state.completed.includes(lesson.id);
  }

  function moduleProgress(module, state) {
    const done = (module?.lessons || []).filter((lesson) => lessonComplete(lesson, state)).length;
    const total = module?.lessons?.length || 0;
    return { done, total, complete: total > 0 && done === total };
  }

  function m01CaseComplete() {
    const state = readJson(SIM_KEY, null);
    return Boolean(
      state
      && state.treatmentId === M01_TREATMENT
      && state.missionVersion === M01_VERSION
      && (state.reviewReachedAt || state.completedAt)
    );
  }

  function m02ChallengeComplete() {
    return Boolean(window.PM01M02ChallengeV5?.isComplete?.());
  }

  function hasStarted(state) {
    return Boolean(state.lastLesson || state.completed.length || Object.keys(state.lab || {}).length || m01CaseComplete() || m02ChallengeComplete());
  }

  function firstIncompleteLesson(state) {
    return lessons().find((lesson) => !lessonComplete(lesson, state)) || lessons().at(-1) || null;
  }

  function currentStep(state) {
    const allModules = modules();
    const m01 = allModules.find((module) => module.id === 'm01');
    const m02 = allModules.find((module) => module.id === 'm02');
    const m01Progress = moduleProgress(m01, state);
    const m02Progress = moduleProgress(m02, state);

    if (m01Progress.complete && !m01CaseComplete()) {
      return { kind: 'm01-case', module: m01, title: 'Итоговый кейс M01', href: 'simulator.html#/mission/m01', action: 'Начать итоговый кейс →' };
    }

    if (m02Progress.complete && !m02ChallengeComplete()) {
      return { kind: 'm02-challenge', module: m02, title: 'Итоговый challenge M02', href: '#/challenge/m02', action: 'Доказать навыки M02 →' };
    }

    const all = lessons();
    const last = state.lastLesson ? all.find((lesson) => lesson.id === state.lastLesson) : null;
    const target = last && !lessonComplete(last, state) ? last : firstIncompleteLesson(state);
    const module = allModules.find((item) => item.id === target?.moduleId) || allModules.at(-1) || null;
    return target ? { kind: 'lesson', lesson: target, module, title: target.title, href: `#/lesson/${encodeURIComponent(target.id)}`, action: 'Продолжить обучение →' } : null;
  }

  function challengeState() {
    return window.PM01M02ChallengeV5?.getState?.() || {};
  }

  function mastery(state) {
    return window.PM01MasteryV5?.derive?.({ courseState: state, challengeState: challengeState(), modules: modules() }) || { skills: {} };
  }

  function stepSkill(step, derived) {
    if (step?.kind === 'm02-challenge') {
      if ((derived.skills?.value?.level || 0) < 3) return 'value';
      if ((derived.skills?.uncertainty?.level || 0) < 3) return 'uncertainty';
      return 'value';
    }
    if (step?.kind === 'm01-case') return 'decisions';
    return STEP_SKILL[step?.lesson?.id] || 'feedback';
  }

  function nextEvidence(skillId, derived, step) {
    if (step?.kind === 'm02-challenge') {
      return skillId === 'uncertainty'
        ? 'Выбери неизвестное по цене ошибки и близости необратимого решения.'
        : 'Свяжи output с изменением поведения и проверь слабейшую причинную связь.';
    }
    if (step?.kind === 'm01-case') return 'Пройди четыре решения M01 и открой финальный разбор траектории.';
    return window.PM01MasteryV5?.nextEvidence?.(skillId, derived) || 'Заверши практику текущего урока.';
  }

  function currentLead(step) {
    if (step.kind === 'm01-case') return 'Собери навыки M01 в одном запуске: диагностируй механизм, зафиксируй решение и пересмотри модель при новом evidence.';
    if (step.kind === 'm02-challenge') return 'Два решения без общего балла: отдельно докажи, что умеешь проверять цепочку ценности и приоритизировать неизвестность до commitment.';
    return step.lesson?.learningLab?.mission || step.lesson?.thesis || step.module?.outcome || '';
  }

  function moduleMeta(step, state) {
    const module = step.module;
    const index = Math.max(0, modules().indexOf(module));
    const progress = moduleProgress(module, state);
    const doneLessons = lessons().filter((lesson) => lessonComplete(lesson, state)).length;
    const totalLessons = lessons().length;
    const percent = totalLessons ? Math.round(doneLessons / totalLessons * 100) : 0;
    return `Модуль ${String(index + 1).padStart(2, '0')} из ${modules().length} · ${progress.done}/${progress.total} уроков · ${percent}% курса`;
  }

  function skillMapMarkup(derived) {
    const skillApi = window.PM01MasteryV5?.SKILLS || {};
    return `<ul class="sf-skill-map" aria-label="Карта навыков">${SKILL_ORDER.map((id) => {
      const base = skillApi[id] || { name: id };
      const state = derived.skills?.[id] || { level: 0, label: 'Не встречал' };
      return `<li class="sf-skill-item level-${state.level}" data-skill="${id}"><span>${escapeHtml(base.name)}</span><strong>${escapeHtml(state.label)}</strong></li>`;
    }).join('')}</ul>`;
  }

  function enhanceSidebar(derived) {
    const target = document.querySelector('#sidebar-progress');
    if (!target) return;
    const values = Object.values(derived.skills || {});
    const proved = values.filter((skill) => skill.level >= 3).length;
    const applied = values.filter((skill) => skill.level >= 2).length;
    target.innerHTML = `<div class="label-row"><span>Навыки</span><strong>${proved}/7 доказано</strong></div><div class="sf-sidebar-evidence"><span>${applied}/7 применено</span><span>${values.filter((skill) => skill.level >= 1).length}/7 понято</span></div>`;
  }

  function enhanceHome() {
    const hash = location.hash || '#/';
    if (!['#/', '#', ''].includes(hash)) return;
    const page = document.querySelector('#main .page');
    if (!page) return;
    const state = courseState();
    if (!hasStarted(state)) return;

    const step = currentStep(state);
    if (!step?.module) return;
    const derived = mastery(state);
    enhanceSidebar(derived);

    if (page.querySelector('.skill-first-home-v5')) return;
    page.querySelector('.lx-course-home')?.remove();

    const skillId = stepSkill(step, derived);
    const skill = derived.skills?.[skillId] || { name: skillId, label: 'Не встречал', level: 0, question: '' };
    const supporting = step.kind === 'm02-challenge' ? 'В challenge связаны два навыка: Ценность + Неопределённость.' : skill.question;

    const home = document.createElement('section');
    home.className = 'lx-course-home skill-first-home-v5';
    home.innerHTML = `
      <div class="sf-home-main">
        <div class="sf-mission">
          <p class="eyebrow">Продолжить обучение</p>
          <p class="sf-course-meta">${escapeHtml(moduleMeta(step, state))}</p>
          <h1>${escapeHtml(step.title)}</h1>
          <p class="lead">${escapeHtml(currentLead(step))}</p>
          <div class="sf-actions"><a class="button primary" href="${step.href}">${escapeHtml(step.action)}</a><a class="button subtle" href="#/course">Учебный путь</a></div>
        </div>
        <aside class="sf-skill-focus">
          <p class="eyebrow">Навык сейчас</p>
          <div class="sf-skill-state"><strong>${escapeHtml(skill.name)}</strong><span>${escapeHtml(skill.label)}</span></div>
          <p>${escapeHtml(supporting || '')}</p>
          <div class="sf-next-evidence"><small>Следующее доказательство</small><strong>${escapeHtml(nextEvidence(skillId, derived, step))}</strong></div>
        </aside>
      </div>
      <section class="sf-map-section"><div class="sf-section-head"><div><p class="eyebrow">Карта навыков</p><h2>Не сколько страниц пройдено, а что уже доказано</h2></div><p>Уровень растёт только от decision evidence, рабочего артефакта и итоговой практики.</p></div>${skillMapMarkup(derived)}</section>`;
    page.insertBefore(home, page.firstChild);
  }

  function currentLesson() {
    const match = (location.hash || '').match(/^#\/lesson\/([^/?#]+)/);
    if (!match) return null;
    const id = decodeURIComponent(match[1]);
    return lessons().find((lesson) => lesson.id === id) || null;
  }

  function enhanceLabContext() {
    const lesson = currentLesson();
    const learningLab = lesson?.learningLab;
    if (!learningLab?.mission && !learningLab?.terms?.length) return;
    const lab = document.querySelector('#main .learning-lab');
    if (!lab || lab.querySelector('.sf-lab-context')) return;
    const intro = lab.querySelector('.lab-intro');
    if (!intro) return;

    const context = document.createElement('section');
    context.className = 'sf-lab-context';
    context.innerHTML = `
      ${learningLab.mission ? `<div class="sf-lab-mission"><p class="lab-step">Цель урока</p><p>${escapeHtml(learningLab.mission)}</p></div>` : ''}
      ${learningLab.terms?.length ? `<div class="sf-lab-terms"><p class="lab-step">Словарь на этот урок</p><dl>${learningLab.terms.map((item) => `<div><dt>${escapeHtml(item.term)}</dt><dd>${escapeHtml(item.meaning)}</dd></div>`).join('')}</dl></div>` : ''}`;
    intro.insertAdjacentElement('afterend', context);
  }

  function m02Ready(state = courseState()) {
    const m02 = modules().find((module) => module.id === 'm02');
    return moduleProgress(m02, state).complete;
  }

  function enhanceM02CompletionFlow() {
    const lesson = currentLesson();
    if (lesson?.id !== 'assumption-map') return;
    const button = document.querySelector('#complete-lesson');
    if (!button || button.dataset.sfM02Bound === '1') return;
    button.dataset.sfM02Bound = '1';
    button.addEventListener('click', () => {
      setTimeout(() => {
        if (m02Ready() && !m02ChallengeComplete()) location.hash = '#/challenge/m02';
      }, 0);
    });
  }

  function enhanceCoursePath() {
    if (!(location.hash || '').startsWith('#/course')) return;
    const rows = document.querySelectorAll('#main .module-row');
    const row = rows[1];
    if (!row || row.querySelector('.sf-m02-challenge-step')) return;
    const state = courseState();
    const ready = m02Ready(state);
    const done = m02ChallengeComplete();
    const label = done ? 'Доказательство получено' : ready ? 'Готов к прохождению' : 'После 2/2 уроков';
    const card = document.createElement('div');
    card.className = 'sf-m02-challenge-step';
    card.innerHTML = `<span>3 · Итоговый challenge M02</span><strong>${escapeHtml(label)}</strong><small>Ценность + неопределённость в одном launch-case.</small>${ready || done ? `<a href="#/challenge/m02">${done ? 'Повторить challenge' : 'Доказать навыки'} →</a>` : ''}`;
    (row.querySelector('div') || row).appendChild(card);
  }

  function enhanceAll() {
    if (location.hash === '#/challenge/m02') {
      window.PM01M02ChallengeV5?.render?.();
      return;
    }
    enhanceHome();
    enhanceLabContext();
    enhanceM02CompletionFlow();
    enhanceCoursePath();
    const derived = mastery(courseState());
    enhanceSidebar(derived);
  }

  function start() {
    enhanceAll();
    const main = document.querySelector('#main');
    if (main && typeof MutationObserver !== 'undefined') {
      let queued = false;
      new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; enhanceAll(); });
      }).observe(main, { childList: true, subtree: true });
    }
    window.addEventListener('hashchange', () => requestAnimationFrame(enhanceAll));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
