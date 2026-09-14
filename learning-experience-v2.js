(function () {
  'use strict';

  const COURSE_STATE_KEY = 'pm01-state-v1';
  const SIM_STATE_KEY = 'pm01-sim-m01-v1';
  const COMPANY_KEY = 'pm01-company-context-v1';
  const FINAL_CASE_TREATMENT_ID = 'm01-mission-partner-launch-v1';
  const FINAL_CASE_VERSION = 1;

  const COMPANY_PROFILES = {
    small: {
      id: 'small',
      label: 'Малый бизнес',
      scale: '20–80 человек',
      summary: 'Решения быстрые, людей мало, почти любой специалист — критическая зависимость.',
      project: 'B2B SaaS-команда из 34 человек запускает новую биллинговую интеграцию для ключевого клиента. Основатель участвует в продуктовых решениях, backend знает один ведущий разработчик, QA — один человек. До запуска три недели.',
      lenses: {
        d1: 'Основатель доступен сегодня, но команда почти не имеет резервной мощности: лишний параллельный вариант сразу съедает capacity.',
        d2: 'Решения часто живут в чатах и устных договорённостях — формальный decision contract непривычен, но резко снижает зависимость от памяти людей.',
        d3: 'Новое поле уберёт около трёх часов ручной работы в день, но отдельного QA-ресурса под расширение scope нет.',
        d4: 'Security проверяет внешний консультант раз в неделю: поздно найденная зависимость может стоить целого окна запуска.'
      }
    },
    medium: {
      id: 'medium',
      label: 'Средний бизнес',
      scale: '200–1500 человек',
      summary: 'Несколько команд и функций: главная сложность — handoff, ownership и конкурирующие приоритеты.',
      project: 'Маркетплейс на 650 сотрудников меняет партнёрский API. В запуске участвуют product, platform, legal, support и data. У каждой функции свой руководитель и backlog. До обязательного миграционного окна пять недель.',
      lenses: {
        d1: 'Техническая команда не может единолично закрыть решение: данные проходят через product, legal и владельца партнёрства.',
        d2: 'Проблема чаще возникает на handoff между функциями, чем внутри одной команды; owner следующего обязательства важнее общего owner проекта.',
        d3: 'Дополнительный scope полезен бизнесу, но затронет QA, support и data contracts — downstream impact шире одной команды.',
        d4: 'Security blocker может находиться в соседней платформенной команде, поэтому пересмотр диагноза должен учитывать межкомандную зависимость.'
      }
    },
    large: {
      id: 'large',
      label: 'Крупный бизнес',
      scale: '5000+ человек',
      summary: 'Высокая цена изменений: governance, compliance, change windows и длинные цепочки решений.',
      project: 'Финансовая компания на 11 000 сотрудников меняет интеграцию внешнего партнёра. Архитектура, информационная безопасность, legal, закупки и бизнес-владелец участвуют в согласовании. Production change разрешён только в фиксированные окна.',
      lenses: {
        d1: 'Даже технически готовое решение не считается обязательством без прохождения governance; ожидание часто скрывается между комитетами и владельцами sign-off.',
        d2: 'Один “владелец решения” не заменяет required approvals, поэтому нужен явный decision interface: кто даёт какой sign-off и к какой дате.',
        d3: 'Любой late scope способен заново открыть security/change approval и потерять ближайшее production window.',
        d4: 'Новый security-факт может полностью изменить допустимый scope запуска; игнорировать falsifier особенно дорого из-за длинного цикла повторного согласования.'
      }
    }
  };

  function safeParse(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
  }

  function courseState() {
    const raw = safeParse(COURSE_STATE_KEY, {});
    return {
      completed: Array.isArray(raw.completed) ? raw.completed : [],
      lastLesson: raw.lastLesson || null,
      notes: raw.notes || {},
      lab: raw.lab || {},
    };
  }

  function simState() { return safeParse(SIM_STATE_KEY, null); }

  function simulationComplete() {
    const sim = simState();
    const validTreatment = sim?.treatmentId === FINAL_CASE_TREATMENT_ID && sim?.missionVersion === FINAL_CASE_VERSION;
    return Boolean(validTreatment && (sim?.reviewReachedAt || sim?.completedAt));
  }

  function currentCompanyId() {
    try {
      const value = localStorage.getItem(COMPANY_KEY);
      return COMPANY_PROFILES[value] ? value : 'medium';
    } catch (_) { return 'medium'; }
  }

  function currentCompany() { return COMPANY_PROFILES[currentCompanyId()]; }

  function setCompany(id) {
    if (!COMPANY_PROFILES[id]) return;
    try { localStorage.setItem(COMPANY_KEY, id); } catch (_) {}
    document.documentElement.dataset.companyContext = id;
    refreshDynamicCompanyContent();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function lessons() {
    const modules = window.PM01?.modules || [];
    return modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title })));
  }

  function lessonEvidenceReady(lesson, state) {
    if (!lesson?.learningLab) return true;
    const stored = state.lab?.[lesson.id] || {};
    const drillAnswers = stored.drillAnswers || {};
    const workbook = stored.workbook || {};
    const requiredDrills = lesson.learningLab.drills.filter((drill) => drill.required !== false);
    const requiredFields = lesson.learningLab.workbookFields.filter((field) => field.required !== false);
    return requiredDrills.every((drill) => Boolean(drillAnswers[drill.id]))
      && requiredFields.every((field) => String(workbook[field.id] || '').trim().length > 0);
  }

  function lessonComplete(lesson, state) {
    return Boolean(lesson && state.completed.includes(lesson.id) && lessonEvidenceReady(lesson, state));
  }

  function companyChoices(locked) {
    const selected = currentCompanyId();
    return `<div class="lx-company-choices" role="group" aria-label="Тип компании">${Object.values(COMPANY_PROFILES).map((profile) => `
      <button type="button" class="lx-company-choice ${selected === profile.id ? 'selected' : ''}" data-company-profile="${profile.id}" ${locked ? 'disabled' : ''} aria-pressed="${selected === profile.id}">
        <strong>${escapeHtml(profile.label)}</strong><span>${escapeHtml(profile.scale)}</span>
      </button>`).join('')}</div>`;
  }

  function bindCompanyChoices(root) {
    root.querySelectorAll('[data-company-profile]').forEach((button) => {
      if (button.dataset.boundCompany === '1') return;
      button.dataset.boundCompany = '1';
      button.addEventListener('click', () => setCompany(button.dataset.companyProfile));
    });
  }

  function hasStartedCourse(state) {
    return Boolean(state.lastLesson || state.completed.length || Object.keys(state.notes || {}).length || Object.keys(state.lab || {}).length);
  }

  function moduleProgress(module, state) {
    const done = module.lessons.filter((lesson) => lessonComplete(lesson, state)).length;
    return { done, total: module.lessons.length, complete: done === module.lessons.length };
  }

  function nextUnfinishedLesson(state, afterLessonId) {
    const all = lessons();
    const start = afterLessonId ? Math.max(0, all.findIndex((lesson) => lesson.id === afterLessonId) + 1) : 0;
    return all.slice(start).find((lesson) => !lessonComplete(lesson, state))
      || all.find((lesson) => !lessonComplete(lesson, state))
      || all.at(-1);
  }

  function learningStep(state) {
    const modules = window.PM01?.modules || [];
    const m01 = modules.find((module) => module.id === 'm01');
    const m01Progress = m01 ? moduleProgress(m01, state) : { done: 0, total: 0, complete: false };
    const caseComplete = simulationComplete();

    if (m01 && m01Progress.complete && !caseComplete) {
      return { kind: 'final-case', module: m01, m01Progress, caseComplete };
    }

    const all = lessons();
    const last = state.lastLesson ? all.find((lesson) => lesson.id === state.lastLesson) : null;
    const next = last && !lessonComplete(last, state) ? last : nextUnfinishedLesson(state);
    const module = modules.find((item) => item.id === next?.moduleId) || modules.at(-1);
    return { kind: 'lesson', lesson: next, module, m01Progress, caseComplete };
  }

  function afterCurrent(step, state) {
    if (step.kind === 'final-case') {
      const next = nextUnfinishedLesson(state, 'system-diagnostic');
      return next && next.moduleId !== 'm01'
        ? { title: next.title, meta: `${next.moduleTitle} · ${next.minutes || ''} мин` }
        : { title: 'Следующий модуль', meta: 'После разбора итогового кейса' };
    }

    const module = step.module;
    const index = module?.lessons?.findIndex((lesson) => lesson.id === step.lesson?.id) ?? -1;
    const nextInModule = index >= 0 ? module.lessons[index + 1] : null;
    if (nextInModule && !lessonComplete(nextInModule, state)) {
      return { title: nextInModule.title, meta: `${module.title} · следующий урок` };
    }
    if (module?.id === 'm01' && moduleProgress(module, state).done + (lessonComplete(step.lesson, state) ? 0 : 1) >= module.lessons.length) {
      return { title: 'Итоговый кейс M01', meta: 'Применить оба навыка · 7–10 минут' };
    }
    const next = nextUnfinishedLesson(state, step.lesson?.id);
    return next && next.id !== step.lesson?.id
      ? { title: next.title, meta: `${next.moduleTitle} · ${next.minutes || ''} мин` }
      : { title: 'Следующий шаг откроется после урока', meta: 'Сохрани evidence практики' };
  }

  function roadmap(state) {
    const modules = window.PM01?.modules || [];
    return `<div class="path-note" aria-label="Прогресс по модулям"><strong>Учебный путь</strong>${modules.map((module, index) => {
      const progress = moduleProgress(module, state);
      const marker = progress.complete ? '✓' : `${progress.done}/${progress.total}`;
      return `<span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(module.title)} · ${marker}</span>`;
    }).join('')}</div>`;
  }

  function enhanceHome() {
    const hash = location.hash || '#/';
    if (!['#/', '#', ''].includes(hash)) return;
    const page = document.querySelector('#main .page');
    if (!page) return;
    const state = courseState();

    if (!hasStartedCourse(state)) {
      if (page.querySelector('.lx-learning-promise')) return;
      const hero = page.querySelector('.hero');
      if (!hero) return;
      const promise = document.createElement('section');
      promise.className = 'lx-learning-promise';
      promise.innerHTML = `
        <div class="lx-section-head"><p class="eyebrow">Как устроено обучение</p><h2>Не читать про PM. Тренировать решения.</h2><p>Урок даёт ситуацию, попытку, разбор и рабочую технику. В конце модуля — итоговый кейс, где нужно применить несколько навыков вместе.</p></div>
        <div class="lx-loop-grid">
          <article><span>01</span><strong>Решение</strong><p>Сначала выбери действие на реалистичном кейсе.</p></article>
          <article><span>02</span><strong>Последствие</strong><p>Увидь trade-off и то, что твой ход изменил в системе.</p></article>
          <article><span>03</span><strong>Разбор</strong><p>Сверь мышление с сильным вариантом и моделью.</p></article>
          <article><span>04</span><strong>Перенос</strong><p>Примени навык к своему проекту или готовому контексту.</p></article>
        </div>
        <div class="lx-company-strip"><div><strong>Нет подходящего рабочего проекта?</strong><p>Выбери масштаб компании — упражнения и итоговый кейс дадут готовый контекст.</p></div>${companyChoices(false)}</div>`;
      hero.insertAdjacentElement('afterend', promise);
      const nextCard = page.querySelector('.next-card');
      if (nextCard) promise.insertAdjacentElement('afterend', nextCard);
      bindCompanyChoices(promise);
      return;
    }

    page.classList.add('lx-returning-home');
    if (page.querySelector('.lx-course-home')) return;

    const step = learningStep(state);
    if (!step?.module) return;
    const all = lessons();
    const completedLessons = all.filter((lesson) => lessonComplete(lesson, state)).length;
    const overallProgress = all.length ? Math.round((completedLessons / all.length) * 100) : 0;
    const moduleIndex = window.PM01.modules.indexOf(step.module);
    const moduleState = moduleProgress(step.module, state);
    const next = afterCurrent(step, state);

    const title = step.kind === 'final-case' ? 'Итоговый кейс M01' : step.lesson.title;
    const lead = step.kind === 'final-case'
      ? 'Применить оба навыка M01 в одном запуске: найти механизм проблемы, сделать решение явным и пересмотреть диагноз при новом факте.'
      : step.lesson.thesis;
    const href = step.kind === 'final-case' ? 'simulator.html#/mission/m01' : `#/lesson/${encodeURIComponent(step.lesson.id)}`;
    const action = step.kind === 'final-case' ? 'Начать итоговый кейс →' : 'Продолжить обучение →';

    const home = document.createElement('section');
    home.className = 'lx-course-home lx-cockpit';
    home.innerHTML = `
      <div class="returning-home-main">
        <div class="returning-home-copy">
          <p class="eyebrow">Продолжить обучение</p>
          <p class="returning-context">Модуль ${String(moduleIndex + 1).padStart(2, '0')} из ${window.PM01.modules.length} · ${moduleState.done}/${moduleState.total} уроков · общий прогресс ${overallProgress}%</p>
          <h1>${escapeHtml(title)}</h1>
          <p class="lead">${escapeHtml(lead)}</p>
          <div class="returning-actions"><a class="button primary" href="${href}">${action}</a><a class="button subtle" href="#/course">Учебный путь</a></div>
        </div>
        <aside class="returning-progress" aria-label="Текущий модуль">
          <strong>${moduleState.done}/${moduleState.total}</strong>
          <span>уроков в модуле</span>
          <div class="returning-progress-track" aria-hidden="true"><span style="width:${moduleState.total ? Math.round(moduleState.done / moduleState.total * 100) : 0}%"></span></div>
          <p>${escapeHtml(step.module.outcome || step.module.title)}</p>
        </aside>
      </div>
      <div class="returning-next-grid">
        <div><span>Сейчас</span><strong>${escapeHtml(step.module.title)}</strong><small>${step.kind === 'final-case' ? '2/2 уроков завершено · финальная практика модуля' : `${moduleState.done}/${moduleState.total} уроков завершено`}</small></div>
        <div><span>Что дальше</span><strong>${escapeHtml(next.title)}</strong><small>${escapeHtml(next.meta)}</small></div>
      </div>
      <section class="section lx-course-roadmap"><div class="section-heading"><div><p class="eyebrow">Карта курса</p><h2>10 модулей, один маршрут</h2></div><a class="button subtle" href="#/course">Открыть весь путь</a></div>${roadmap(state)}</section>`;
    page.insertBefore(home, page.firstChild);
  }

  function enhanceM01Lesson() {
    const match = (location.hash || '').match(/^#\/lesson\/(project-system|system-diagnostic)/);
    if (!match) return;
    const page = document.querySelector('#main .lesson-layout');
    if (!page) return;
    const header = page.querySelector('.lesson-header');
    if (header && !page.querySelector('.lx-lesson-flow')) {
      const rail = document.createElement('nav');
      rail.className = 'lx-lesson-flow';
      rail.setAttribute('aria-label', 'Этапы практики');
      rail.innerHTML = [
        ['01', 'Решение'], ['02', 'Разбор'], ['03', 'Модель'], ['04', 'Повтор'], ['05', 'Рабочая карта'], ['06', 'Перенос']
      ].map(([n, label]) => `<span><b>${n}</b>${label}</span>`).join('');
      header.insertAdjacentElement('afterend', rail);
    }

    const transfer = page.querySelector('.lab-transfer');
    if (transfer && !transfer.querySelector('.lx-transfer-practice')) {
      const profile = currentCompany();
      const block = document.createElement('div');
      block.className = 'lx-transfer-practice';
      block.innerHTML = `<div class="lx-transfer-head"><div><strong>Нет своего проекта? Используй учебный.</strong><p>Не пропускай перенос. Выбери один контекст и ответь на те же вопросы, как будто ты отвечаешь за результат.</p></div>${companyChoices(false)}</div><article class="lx-case-card" data-company-case><span>${escapeHtml(profile.label)} · ${escapeHtml(profile.scale)}</span><p>${escapeHtml(profile.project)}</p></article><ol><li>Назови главную гипотезу и сильную альтернативу.</li><li>Какой факт различит эти объяснения?</li><li>Какое минимальное действие сделаешь и при каком сигнале пересмотришь его?</li></ol>`;
      transfer.appendChild(block);
      bindCompanyChoices(block);
    }

    const finish = page.querySelector('.lab-finish');
    if (finish) {
      const label = finish.querySelector('label[for="lesson-notes"] strong');
      const help = finish.querySelector('label[for="lesson-notes"] .field-help');
      const textarea = finish.querySelector('#lesson-notes');
      if (label) label.textContent = 'Заметка к решению · необязательно';
      if (help) help.textContent = 'Сохрани только решение, вывод или вопрос, к которому хочешь вернуться позже.';
      if (textarea) textarea.placeholder = 'Например: “В следующий раз сначала восстановлю timeline решения, а не добавлю буфер к сроку”.';
    }
  }

  function enhanceLegacyPractice() {
    const hash = location.hash || '';
    if (!hash.startsWith('#/lesson/') || /project-system|system-diagnostic/.test(hash)) return;
    const practice = document.querySelector('#main .practice');
    if (!practice || practice.querySelector('.lx-legacy-context')) return;
    const profile = currentCompany();
    const block = document.createElement('div');
    block.className = 'lx-legacy-context';
    block.innerHTML = `<p class="eyebrow">Контекст для практики</p><h3>Можно работать на своём проекте — или на готовом учебном.</h3><p>Если у тебя сейчас нет подходящей рабочей ситуации, используй этот контекст и выполняй шаги ниже буквально по нему.</p>${companyChoices(false)}<article class="lx-case-card" data-company-case><span>${escapeHtml(profile.label)} · ${escapeHtml(profile.scale)}</span><p>${escapeHtml(profile.project)}</p></article>`;
    practice.insertBefore(block, practice.querySelector('ol'));
    bindCompanyChoices(block);

    const label = practice.querySelector('label[for="lesson-notes"] strong');
    const help = practice.querySelector('label[for="lesson-notes"] .field-help');
    if (label) label.textContent = 'Заметка к решению · необязательно';
    if (help) help.textContent = 'Не пересказывай урок. Сохрани только то, что изменит следующее решение.';
  }

  function enhanceLearningPath() {
    if (!(location.hash || '').startsWith('#/course')) return;
    const firstRow = document.querySelector('#main .module-row');
    if (!firstRow || firstRow.querySelector('.lx-final-case-step')) return;
    const target = firstRow.querySelector('h2')?.parentElement;
    if (!target) return;

    const state = courseState();
    const m01 = window.PM01?.modules?.find((module) => module.id === 'm01');
    const progress = m01 ? moduleProgress(m01, state) : { done: 0, total: 2, complete: false };
    const done = simulationComplete();
    const status = done ? 'Пройден' : progress.complete ? 'Готов к прохождению' : 'Доступен после 2/2 уроков';
    const action = progress.complete || done
      ? `<a href="simulator.html#/mission/m01">${done ? 'Повторить кейс' : 'Открыть кейс'} →</a>`
      : '';

    const badge = document.createElement('div');
    badge.className = 'lx-final-case-step lx-mission-badge';
    badge.innerHTML = `<strong>3. Итоговый кейс M01 · ${status}</strong><span>Применить оба навыка в одном реалистичном запуске: 4 решения, последствия и разбор.</span>${action}`;
    target.appendChild(badge);
  }

  function enhanceSimulator() {
    if (!document.body.querySelector('.sim-standalone-nav')) return;
    const main = document.querySelector('#main');
    if (!main) return;
    const sim = simState();
    const locked = Boolean(sim?.startedAt || sim?.run?.decisions?.length);
    const profile = currentCompany();

    const host = main.querySelector('.sim-shell');
    if (!host) return;
    if (!host.querySelector('.lx-sim-context')) {
      const context = document.createElement('section');
      context.className = 'lx-sim-context';
      context.innerHTML = `<div><p class="eyebrow">Контекст компании</p><h3>${escapeHtml(profile.label)} · ${escapeHtml(profile.scale)}</h3><p>${escapeHtml(profile.summary)}</p></div>${companyChoices(locked)}${locked ? '<small>Тип компании зафиксирован на время текущего прохождения, чтобы контекст не менялся посреди решений.</small>' : '<small>Выбор меняет организационный контекст, но не скрытую “сложность” и не влияет на базовые метрики итогового кейса.</small>'}`;
      const header = host.querySelector('.sim-briefing, .sim-header');
      header?.insertAdjacentElement('afterend', context);
      bindCompanyChoices(context);
    }

    const situation = host.querySelector('.sim-situation');
    if (situation && !situation.querySelector('.lx-context-lens')) {
      const index = sim?.run?.decisionIndex ?? 0;
      const decisionId = ['d1', 'd2', 'd3', 'd4'][index] || 'd4';
      const lens = document.createElement('aside');
      lens.className = 'lx-context-lens';
      lens.innerHTML = `<strong>Что меняет масштаб</strong><p>${escapeHtml(profile.lenses[decisionId])}</p>`;
      situation.appendChild(lens);
    }
  }

  function refreshDynamicCompanyContent() {
    document.querySelector('.lx-learning-promise')?.remove();
    document.querySelectorAll('.lx-company-choices').forEach((node) => node.remove());
    document.querySelectorAll('.lx-sim-context, .lx-context-lens').forEach((node) => node.remove());
    document.querySelectorAll('.lx-transfer-practice, .lx-legacy-context').forEach((node) => node.remove());
    requestAnimationFrame(enhanceAll);
  }

  function enhanceAll() {
    document.documentElement.dataset.companyContext = currentCompanyId();
    enhanceHome();
    enhanceM01Lesson();
    enhanceLegacyPractice();
    enhanceLearningPath();
    enhanceSimulator();
  }

  function start() {
    enhanceAll();
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; enhanceAll(); });
    });
    const main = document.querySelector('#main');
    if (main) observer.observe(main, { childList: true, subtree: true });
    window.addEventListener('hashchange', () => requestAnimationFrame(enhanceAll));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();