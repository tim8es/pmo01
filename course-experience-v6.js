(function () {
  'use strict';

  const COURSE_KEY = 'pm01-state-v1';
  const SIM_KEY = 'pm01-sim-m01-v1';
  const COMPANY_KEY = 'pm01-company-context-v1';
  const M01_TREATMENT = 'm01-mission-partner-launch-v1';
  const M01_VERSION = 1;
  const SKILL_ORDER = ['value', 'work', 'information', 'decisions', 'dependencies', 'uncertainty', 'feedback'];

  const COMPANY_PROFILES = Object.freeze({
    small: Object.freeze({ label: 'Малый бизнес', scale: '20–80 человек', summary: 'Мало резервной мощности: решения проще по механике, но зависимость от конкретных людей выше.', lenses: Object.freeze({ d1: 'Параллельные варианты быстро съедают резерв команды.', d2: 'Явный контракт решения снижает зависимость от памяти одного человека.', d3: 'Даже небольшое позднее расширение объёма может перегрузить единственный QA-ресурс.', d4: 'Редкие внешние проверки делают поздний опровергающий факт особенно дорогим.' }) }),
    medium: Object.freeze({ label: 'Средний бизнес', scale: '200–1500 человек', summary: 'Несколько функций и очередей работ: основные потери возникают на передачах между командами и неясной ответственности.', lenses: Object.freeze({ d1: 'Решение проходит через несколько функций и владельцев.', d2: 'Владелец следующего обязательства важнее абстрактного владельца всего проекта.', d3: 'Позднее расширение объёма создаёт каскад последствий сразу в нескольких командах.', d4: 'Новый факт часто требует пересмотра межкомандной зависимости.' }) }),
    large: Object.freeze({ label: 'Крупный бизнес', scale: '5000+ человек', summary: 'Формальные согласования, регуляторные требования и окна изменений повышают цену позднего решения.', lenses: Object.freeze({ d1: 'Техническая готовность не равна формальному обязательству.', d2: 'Нужен явный маршрут согласований и финального утверждения.', d3: 'Позднее расширение объёма способно заново открыть согласования и потерять окно запуска.', d4: 'Опровергающий факт может полностью изменить допустимый объём работ и цикл согласования.' }) }),
  });

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; }
  }
  function escapeHtml(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }
  function modules() { return window.PM01?.modules || []; }
  function lessons() { return modules().flatMap(module => (module.lessons || []).map(lesson => ({ ...lesson, moduleId: module.id, moduleTitle: module.title }))); }
  function courseState() {
    const raw = readJson(COURSE_KEY, {});
    return { completed: Array.isArray(raw.completed) ? raw.completed : [], lastLesson: raw.lastLesson || null, lab: raw.lab || {}, notes: raw.notes || {} };
  }
  function simState() { return readJson(SIM_KEY, null); }
  function practiceState() { return window.PM01ModulePracticeV6?.getState?.() || { modules: {} }; }

  function evidenceReady(lesson, state = courseState()) {
    const evidence = window.PM01MasteryV6?.labEvidence?.(lesson, state);
    return Boolean(evidence?.applied);
  }
  function lessonComplete(lesson, state = courseState()) { return evidenceReady(lesson, state); }
  function moduleProgress(module, state = courseState()) {
    const done = (module?.lessons || []).filter(lesson => lessonComplete(lesson, state)).length;
    const total = module?.lessons?.length || 0;
    return { done, total, complete: total > 0 && done === total };
  }
  function m01CaseComplete() {
    const sim = simState();
    return Boolean(sim && sim.treatmentId === M01_TREATMENT && sim.missionVersion === M01_VERSION && (sim.reviewReachedAt || sim.completedAt));
  }
  function modulePracticeComplete(moduleId) {
    if (moduleId === 'm01') return m01CaseComplete();
    return Boolean(window.PM01ModulePracticeV6?.isComplete?.(moduleId));
  }
  function moduleComplete(module, state = courseState()) { return moduleProgress(module, state).complete && modulePracticeComplete(module.id); }

  function deriveMastery(state = courseState()) {
    return window.PM01MasteryV6?.derive?.({
      courseState: state,
      practiceState: practiceState(),
      simState: simState(),
      modules: modules(),
      practices: window.PM01ModulePracticeV6?.PRACTICES || {},
    }) || { skills: {}, counts: { understood: 0, applied: 0, proved: 0 } };
  }

  function currentStep(state = courseState()) {
    for (const module of modules()) {
      const lesson = (module.lessons || []).find(item => !lessonComplete(item, state));
      if (lesson) return { kind: 'lesson', module, lesson, title: lesson.title, href: `#/lesson/${encodeURIComponent(lesson.id)}`, action: state.lastLesson ? 'Продолжить обучение →' : 'Начать обучение →' };
      if (!modulePracticeComplete(module.id)) {
        return module.id === 'm01'
          ? { kind: 'practice', module, title: 'Итоговый кейс M01', href: 'simulator.html#/mission/m01', action: 'Перейти к итоговому кейсу →' }
          : { kind: 'practice', module, title: `Итоговая практика ${module.id.toUpperCase()}`, href: `#/practice/${module.id}`, action: 'Перейти к итоговой практике →' };
      }
    }
    return { kind: 'complete', module: modules().at(-1), title: 'Основной путь завершён', href: '#/course', action: 'Посмотреть карту компетенций →' };
  }

  function stepSkillIds(step) {
    if (step.kind === 'lesson') return window.PM01MasteryV6?.LESSON_SKILLS?.[step.lesson.id] || ['feedback'];
    if (step.module?.id === 'm01') return ['decisions', 'work'];
    const practice = window.PM01ModulePracticeV6?.PRACTICES?.[step.module?.id];
    return [...new Set((practice?.decisions || []).flatMap(decision => decision.skills || []))];
  }

  function primarySkill(step, derived) {
    const ids = stepSkillIds(step);
    return ids.map(id => derived.skills?.[id]).filter(Boolean).sort((a, b) => a.level - b.level)[0] || derived.skills?.feedback || { id: 'feedback', name: 'Обратная связь', label: 'Не встречал', level: 0 };
  }

  function nextEvidence(step, skill, derived) {
    if (step.kind === 'practice') return `Пройди ${step.title} и выбери сильный ход по компетенции «${skill.name}».`;
    return window.PM01MasteryV6?.nextEvidence?.(skill.id, derived) || 'Заверши практику текущего урока.';
  }

  function currentCompanyId() {
    try { const value = localStorage.getItem(COMPANY_KEY); return COMPANY_PROFILES[value] ? value : 'medium'; } catch (_) { return 'medium'; }
  }
  function simulatorContextLocked() {
    const sim = simState();
    return Boolean(sim?.reviewReachedAt || sim?.completedAt || (sim?.run?.decisions || []).length || Number(sim?.run?.decisionIndex || 0) > 0);
  }
  function invalidateCompanySurfaces() {
    const page = document.querySelector('#main .page[data-v6-home="1"]');
    if (page) page.removeAttribute('data-v6-home');
    document.querySelector('.v6-sim-context')?.remove();
    document.querySelector('.v6-context-lens')?.remove();
  }
  function setCompany(id) {
    if (!COMPANY_PROFILES[id]) return;
    if (document.querySelector('#main .sim-shell') && simulatorContextLocked()) return;
    try { localStorage.setItem(COMPANY_KEY, id); } catch (_) {}
    document.documentElement.dataset.companyContext = id;
    invalidateCompanySurfaces();
    requestAnimationFrame(enhanceAll);
  }
  function companyChoices({ locked = false } = {}) {
    const selected = currentCompanyId();
    return `<div class="v6-company-choices" role="group" aria-label="Контекст компании">${Object.entries(COMPANY_PROFILES).map(([id, profile]) => `<button type="button" class="v6-company-choice ${selected === id ? 'selected' : ''}" data-v6-company="${id}" aria-pressed="${selected === id}" ${locked ? 'disabled aria-disabled="true"' : ''}><strong>${escapeHtml(profile.label)}</strong><span>${escapeHtml(profile.scale)}</span></button>`).join('')}</div>`;
  }
  function bindCompany(root) {
    root.querySelectorAll('[data-v6-company]:not(:disabled)').forEach(button => button.addEventListener('click', () => setCompany(button.dataset.v6Company)));
  }

  function skillMapMarkup(derived) {
    const api = window.PM01MasteryV6?.SKILLS || {};
    return `<div class="v6-skill-map">${SKILL_ORDER.map(id => {
      const skill = derived.skills?.[id] || { ...api[id], level: 0, label: 'Не встречал' };
      return `<article class="v6-skill level-${skill.level}"><div><span>${escapeHtml(api[id]?.name || id)}</span><strong>${escapeHtml(skill.label)}</strong></div><p>${escapeHtml(api[id]?.question || '')}</p></article>`;
    }).join('')}</div>`;
  }

  function stepMeta(step, state) {
    if (step.kind === 'complete') return `10/10 модулей · ${modules().length * 3} учебных шага`;
    const index = Math.max(0, modules().indexOf(step.module));
    const progress = moduleProgress(step.module, state);
    const practiceDone = modulePracticeComplete(step.module.id);
    const stepNumber = progress.done < progress.total ? progress.done + 1 : 3;
    return `Модуль ${String(index + 1).padStart(2, '0')} из ${modules().length} · шаг ${stepNumber}/3${practiceDone ? ' · итоговая практика пройдена' : ''}`;
  }

  function enhanceHome() {
    if (!['#/', '#', ''].includes(location.hash || '#/')) return;
    const page = document.querySelector('#main .page');
    if (!page || page.dataset.v6Home === '1') return;
    const state = courseState();
    const step = currentStep(state);
    const derived = deriveMastery(state);
    const skill = primarySkill(step, derived);
    const profile = COMPANY_PROFILES[currentCompanyId()];
    page.dataset.v6Home = '1';
    page.innerHTML = `<section class="course-home-v6"><div class="v6-home-grid"><div class="v6-next"><p class="eyebrow">Продолжить обучение</p><p class="v6-meta">${escapeHtml(stepMeta(step, state))}</p><h1>${escapeHtml(step.title)}</h1><p class="lead">${escapeHtml(step.kind === 'lesson' ? (step.lesson.learningLab?.mission || step.lesson.thesis) : step.kind === 'practice' ? 'Собери два урока модуля в одном решении и проверь перенос без подсказки.' : 'Все модули и итоговые практики пройдены. Карта ниже показывает, какие компетенции подтверждены доказательствами.')}</p><div class="v6-actions"><a class="button primary" href="${step.href}">${escapeHtml(step.action)}</a><a class="button subtle" href="#/course">Учебный путь</a></div></div><aside class="v6-focus"><p class="eyebrow">Навык сейчас</p><div class="v6-focus-state"><strong>${escapeHtml(skill.name)}</strong><span>${escapeHtml(skill.label)}</span></div><p>${escapeHtml(skill.question || '')}</p><div class="v6-evidence"><small>Следующее доказательство</small><strong>${escapeHtml(nextEvidence(step, skill, derived))}</strong></div></aside></div><section class="course-learning-loop"><div class="v6-section-head"><div><p class="eyebrow">Один учебный цикл</p><h2>Решение → разбор → инструмент → перенос → итоговая практика</h2></div><p>Завершённый урок даёт применение. Уровень «Доказал» появляется только после итогового кейса модуля.</p></div><div class="v6-loop"><span>1 · Реши до объяснения</span><span>2 · Сверь механизм</span><span>3 · Заполни рабочий артефакт</span><span>4 · Перенеси на проект</span><span>5 · Докажи в новом кейсе</span></div></section><section class="v6-competencies"><div class="v6-section-head"><div><p class="eyebrow">Карта компетенций</p><h2>${derived.counts?.proved || 0}/7 доказано · ${derived.counts?.applied || 0}/7 применено</h2></div><p>Это не очки: уровень растёт только от решений и доказательств.</p></div>${skillMapMarkup(derived)}</section><section class="v6-context"><div><p class="eyebrow">Контекст практики</p><h2>${escapeHtml(profile.label)} · ${escapeHtml(profile.scale)}</h2><p>${escapeHtml(profile.summary)} Выбор меняет организационную линзу, но не скрытую сложность кейса.</p></div>${companyChoices()}</section></section>`;
    bindCompany(page);
  }

  function modulePracticeLabel(module) { return module.id === 'm01' ? 'Итоговый кейс M01' : `Итоговая практика ${module.id.toUpperCase()}`; }
  function practiceHref(module) { return module.id === 'm01' ? 'simulator.html#/mission/m01' : `#/practice/${module.id}`; }

  function enhanceCourse() {
    if (!(location.hash || '').startsWith('#/course')) return;
    const page = document.querySelector('#main .page');
    if (!page || page.dataset.v6Course === '1') return;
    const state = courseState();
    const derived = deriveMastery(state);
    page.dataset.v6Course = '1';
    page.innerHTML = `<section class="course-path-v6"><header class="v6-course-head"><div><p class="eyebrow">Учебный путь</p><h1>10 модулей · одна механика</h1><p class="lead">В каждом модуле: два урока с решением и рабочим артефактом, затем итоговая практика на перенос. Процент страниц больше не является главным сигналом прогресса.</p></div><div class="v6-course-proof"><strong>${derived.counts?.proved || 0}/7</strong><span>компетенций доказано</span><strong>${derived.counts?.applied || 0}/7</strong><span>применено</span></div></header><div class="v6-module-list">${modules().map((module, index) => {
      const progress = moduleProgress(module, state);
      const practiceDone = modulePracticeComplete(module.id);
      const complete = progress.complete && practiceDone;
      const firstOpen = modules().find(item => !moduleComplete(item, state));
      const current = firstOpen?.id === module.id;
      const skills = [...new Set((module.lessons || []).flatMap(lesson => window.PM01MasteryV6?.LESSON_SKILLS?.[lesson.id] || []))];
      return `<article class="v6-module ${complete ? 'complete' : current ? 'current' : 'upcoming'}"><div class="v6-module-top"><span class="v6-module-index">${String(index + 1).padStart(2, '0')}</span><div><p class="eyebrow">${complete ? 'Завершено' : current ? 'Сейчас' : 'Дальше'}</p><h2>${escapeHtml(module.title)}</h2><p>${escapeHtml(module.outcome)}</p></div></div><ol class="v6-module-steps">${(module.lessons || []).map((lesson, lessonIndex) => `<li class="${lessonComplete(lesson, state) ? 'done' : ''}"><span>${lessonIndex + 1}</span><a href="#/lesson/${encodeURIComponent(lesson.id)}">${escapeHtml(lesson.title)}</a><small>${lessonComplete(lesson, state) ? 'Применил' : 'Урок + практика'}</small></li>`).join('')}<li class="module-practice-step ${practiceDone ? 'done' : ''}"><span>3</span>${progress.complete || practiceDone ? `<a href="${practiceHref(module)}">${escapeHtml(modulePracticeLabel(module))}</a>` : `<strong>${escapeHtml(modulePracticeLabel(module))}</strong>`}<small>${practiceDone ? 'Пройдено' : progress.complete ? 'Готово' : 'После 2/2 уроков'}</small></li></ol><div class="v6-module-skills">${skills.map(id => `<span>${escapeHtml(window.PM01MasteryV6?.SKILLS?.[id]?.name || id)}</span>`).join('')}</div></article>`;
    }).join('')}</div></section>`;
  }

  function currentLesson() {
    const match = (location.hash || '').match(/^#\/lesson\/([^/?#]+)/);
    if (!match) return null;
    const id = decodeURIComponent(match[1]);
    return lessons().find(lesson => lesson.id === id) || null;
  }

  function enhanceLesson() {
    const lesson = currentLesson();
    if (!lesson) return;
    const article = document.querySelector('#main .lesson-layout > article');
    const lab = document.querySelector('#main .learning-lab');
    if (!article || !lab) return;
    const module = modules().find(item => item.id === lesson.moduleId);
    const index = module?.lessons?.findIndex(item => item.id === lesson.id) ?? 0;
    const skillIds = window.PM01MasteryV6?.LESSON_SKILLS?.[lesson.id] || [];

    if (!article.querySelector('.v6-lesson-band')) {
      const band = document.createElement('div');
      band.className = 'v6-lesson-band';
      band.innerHTML = `<span>${escapeHtml(module?.id?.toUpperCase() || '')} · урок ${index + 1}/2</span><strong>${skillIds.map(id => window.PM01MasteryV6?.SKILLS?.[id]?.name || id).join(' + ')}</strong><span>Дальше: ${index === 0 ? 'урок 2/2' : modulePracticeLabel(module)}</span>`;
      article.insertBefore(band, article.firstChild);
    }

    const eyebrow = lab.querySelector('.lab-intro .eyebrow');
    if (eyebrow) eyebrow.textContent = 'Практика решения';
    if (!lab.querySelector('.v6-lab-context')) {
      const context = document.createElement('section');
      context.className = 'v6-lab-context';
      const terms = lesson.learningLab?.terms || [];
      context.innerHTML = `<div class="v6-mission"><p class="lab-step">Цель</p><p>${escapeHtml(lesson.learningLab?.mission || lesson.thesis)}</p></div>${terms.length ? `<details><summary>Термины этого урока</summary><dl>${terms.map(item => `<div><dt>${escapeHtml(item.term)}</dt><dd>${escapeHtml(item.meaning)}</dd></div>`).join('')}</dl></details>` : ''}`;
      lab.querySelector('.lab-intro')?.insertAdjacentElement('afterend', context);
    }

    const drillCount = lab.querySelectorAll('.lab-drill').length;
    if (drillCount <= 1) {
      const workbookStep = lab.querySelector('.lab-workbook .lab-step');
      const transferStep = lab.querySelector('.lab-transfer .lab-step');
      if (workbookStep) workbookStep.textContent = '04 · Рабочий артефакт';
      if (transferStep) transferStep.textContent = '05 · Перенос';
    }
    lab.querySelectorAll('.lab-step').forEach(node => { node.textContent = node.textContent.replace('Exit check', 'Проверка переноса'); });

    enhanceLastLessonFlow(lesson, module);
  }

  function rawEvidenceReady(lesson, raw) {
    const stored = raw.lab?.[lesson.id] || {};
    const requiredDrills = (lesson.learningLab?.drills || []).filter(item => item.required !== false);
    const requiredFields = (lesson.learningLab?.workbookFields || []).filter(item => item.required !== false);
    return requiredDrills.length > 0 && requiredDrills.every(item => Boolean(stored.drillAnswers?.[item.id])) && requiredFields.length > 0 && requiredFields.every(item => String(stored.workbook?.[item.id] || '').trim());
  }

  function enhanceLastLessonFlow(lesson, module) {
    if (!module || module.lessons?.at(-1)?.id !== lesson.id) return;
    const targetHref = practiceHref(module);
    const done = lessonComplete(lesson, courseState());
    const button = document.querySelector('#complete-lesson');
    if (done && !modulePracticeComplete(module.id)) {
      const primary = document.querySelector('.lab-finish .lesson-actions .button.primary');
      if (primary?.tagName === 'A') { primary.href = targetHref; primary.textContent = `Перейти: ${modulePracticeLabel(module)} →`; }
    }
    if (!button || button.dataset.v6FinalBound === '1') return;
    button.dataset.v6FinalBound = '1';
    button.addEventListener('click', event => {
      const raw = readJson(COURSE_KEY, {});
      if (!rawEvidenceReady(lesson, raw)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      raw.completed = Array.isArray(raw.completed) ? raw.completed : [];
      if (!raw.completed.includes(lesson.id)) raw.completed.push(lesson.id);
      raw.notes ||= {};
      raw.notes[lesson.id] = document.querySelector('#lesson-notes')?.value || raw.notes[lesson.id] || '';
      raw.lastLesson = lesson.id;
      if (!writeJson(COURSE_KEY, raw)) return;
      if (module.id === 'm01') location.href = targetHref;
      else location.hash = targetHref;
    }, { capture: true });
  }

  function enhanceSidebar() {
    const target = document.querySelector('#sidebar-progress');
    if (!target || !window.PM01MasteryV6) return;
    const derived = deriveMastery(courseState());
    target.innerHTML = `<div class="label-row"><span>Компетенции</span><strong>${derived.counts.proved}/7 доказано</strong></div><div class="v6-sidebar-bars"><span>${derived.counts.applied}/7 применено</span><span>${derived.counts.understood}/7 понято</span></div>`;
  }

  function enhanceSimulator() {
    const host = document.querySelector('#main .sim-shell');
    if (!host) return;
    const sim = simState();
    const profile = COMPANY_PROFILES[currentCompanyId()];
    const locked = simulatorContextLocked();
    if (!host.querySelector('.v6-sim-context')) {
      const context = document.createElement('section');
      context.className = 'v6-sim-context';
      context.innerHTML = `<div><p class="eyebrow">Контекст компании</p><h3>${escapeHtml(profile.label)} · ${escapeHtml(profile.scale)}</h3><p>${escapeHtml(profile.summary)}</p>${locked ? '<small class="v6-context-lock">Контекст зафиксирован после первого решения, чтобы условия кейса не менялись по ходу прохождения.</small>' : '<small class="v6-context-lock">Выбери масштаб до первого решения. Он меняет организационную линзу, но не скрытые метрики.</small>'}</div>${companyChoices({ locked })}`;
      host.querySelector('.sim-header')?.insertAdjacentElement('afterend', context);
      bindCompany(context);
    }
    const situation = host.querySelector('.sim-situation');
    if (situation) {
      const index = sim?.run?.decisionIndex ?? 0;
      const decisionId = ['d1', 'd2', 'd3', 'd4'][index] || 'd4';
      const existing = situation.querySelector('.v6-context-lens');
      if (!existing || existing.dataset.decisionId !== decisionId) {
        existing?.remove();
        const lens = document.createElement('aside');
        lens.className = 'v6-context-lens';
        lens.dataset.decisionId = decisionId;
        lens.innerHTML = `<strong>Что меняет масштаб</strong><p>${escapeHtml(profile.lenses[decisionId])}</p>`;
        situation.appendChild(lens);
      }
    }
  }

  function enhanceAll() {
    document.documentElement.dataset.companyContext = currentCompanyId();
    enhanceHome();
    enhanceCourse();
    enhanceLesson();
    enhanceSidebar();
    enhanceSimulator();
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
    window.addEventListener('storage', event => { if ([COURSE_KEY, SIM_KEY, COMPANY_KEY, 'pm01-module-practice-v6'].includes(event.key)) { invalidateCompanySurfaces(); requestAnimationFrame(enhanceAll); } });
  }

  window.PM01ExperienceV6 = Object.freeze({ currentStep, moduleComplete, deriveMastery });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
