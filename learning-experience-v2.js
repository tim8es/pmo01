(function () {
  'use strict';

  const COURSE_STATE_KEY = 'pm01-state-v1';
  const SIM_STATE_KEY = 'pm01-sim-m01-v1';
  const COMPANY_KEY = 'pm01-company-context-v1';

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

  function masteryModel(state) {
    const sim = simState();
    const decisions = sim?.run?.decisions || [];
    const d1 = decisions.some((item) => item.decisionId === 'd1');
    const d4 = decisions.find((item) => item.decisionId === 'd4');
    const projectLab = state.lab?.['project-system'] || {};
    const diagnosticLab = state.lab?.['system-diagnostic'] || {};
    const hasProjectLab = Object.keys(projectLab.workbook || {}).some((key) => String(projectLab.workbook[key] || '').trim());
    const hasDiagnosticLab = Object.keys(diagnosticLab.workbook || {}).some((key) => String(diagnosticLab.workbook[key] || '').trim());
    return [
      {
        name: 'Системный диагноз',
        level: d1 ? 3 : state.completed.includes('project-system') ? 2 : hasProjectLab ? 1 : 0,
        detail: 'От симптома к проверяемому механизму'
      },
      {
        name: 'Конкурирующие гипотезы',
        level: d4 ? 3 : state.completed.includes('system-diagnostic') ? 2 : hasDiagnosticLab ? 1 : 0,
        detail: 'Сравнивать объяснения по evidence'
      },
      {
        name: 'Пересмотр решения',
        level: d4?.rationale ? 3 : decisions.length >= 2 ? 2 : state.completed.includes('system-diagnostic') ? 1 : 0,
        detail: 'Менять модель, когда меняются факты'
      }
    ];
  }

  function masteryCard(skill) {
    const labels = ['Не начато', 'Разобрано', 'Отработано', 'Проверено в миссии'];
    return `<article class="lx-mastery-card">
      <div class="lx-mastery-pips" aria-label="${escapeHtml(labels[skill.level])}">${[1,2,3].map((n) => `<span class="${n <= skill.level ? 'filled' : ''}"></span>`).join('')}</div>
      <h3>${escapeHtml(skill.name)}</h3><p>${escapeHtml(skill.detail)}</p><small>${escapeHtml(labels[skill.level])}</small>
    </article>`;
  }

  function journalEntries(state) {
    const all = lessons();
    return Object.entries(state.notes || {})
      .filter(([, value]) => String(value || '').trim())
      .map(([id, value]) => ({ lesson: all.find((item) => item.id === id), value: String(value).trim() }))
      .filter((entry) => entry.lesson)
      .slice(-3).reverse();
  }

  function projectMapProgress(state) {
    const labs = ['project-system', 'system-diagnostic'];
    let completed = 0; let total = 0;
    labs.forEach((id) => {
      const workbook = state.lab?.[id]?.workbook || {};
      const lesson = lessons().find((item) => item.id === id);
      const fields = lesson?.learningLab?.workbookFields || [];
      total += fields.length;
      completed += fields.filter((field) => String(workbook[field.id] || '').trim()).length;
    });
    return { completed, total };
  }

  function nextLessonModel(state) {
    const all = lessons();
    if (!all.length) return null;
    const done = new Set(state.completed);
    const last = state.lastLesson ? all.find((item) => item.id === state.lastLesson) : null;
    const next = last && !done.has(last.id) ? last : all.find((item) => !done.has(item.id)) || all.at(-1);
    const module = window.PM01.modules.find((item) => item.id === next.moduleId);
    const index = all.findIndex((item) => item.id === next.id);
    return { next, module, index, all, done };
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
        <div class="lx-section-head"><p class="eyebrow">Как устроено обучение</p><h2>Не читать про PM. Тренировать решения.</h2><p>Каждый сильный урок начинается с ситуации, в которой нужно выбрать ход до объяснения теории. Затем ты видишь последствия, разбираешь модель и пробуешь ещё раз.</p></div>
        <div class="lx-loop-grid">
          <article><span>01</span><strong>Решение</strong><p>Сначала выбери действие на реалистичном кейсе.</p></article>
          <article><span>02</span><strong>Последствие</strong><p>Увидь trade-off и то, что твой ход изменил в системе.</p></article>
          <article><span>03</span><strong>Разбор</strong><p>Сравни гипотезы и получи модель, а не “правильный ответ”.</p></article>
          <article><span>04</span><strong>Перенос</strong><p>Применяй навык на своём проекте или готовом учебном контексте.</p></article>
        </div>
        <div class="lx-company-strip"><div><strong>Нет подходящего рабочего проекта?</strong><p>Выбери масштаб компании — упражнения и симуляции дадут готовый контекст.</p></div>${companyChoices(false)}</div>`;
      hero.insertAdjacentElement('afterend', promise);
      const nextCard = page.querySelector('.next-card');
      if (nextCard) promise.insertAdjacentElement('afterend', nextCard);
      bindCompanyChoices(promise);
      return;
    }

    const model = nextLessonModel(state);
    if (!model) return;
    page.classList.add('lx-returning-home');
    if (page.querySelector('.lx-cockpit')) return;

    const progress = Math.round((state.completed.filter((id) => model.all.some((lesson) => lesson.id === id)).length / model.all.length) * 100);
    const moduleDone = model.module.lessons.filter((lesson) => state.completed.includes(lesson.id)).length;
    const mastery = masteryModel(state);
    const journal = journalEntries(state);
    const projectMap = projectMapProgress(state);
    const company = currentCompany();
    const sim = simState();
    const simComplete = Boolean(sim?.completedAt || sim?.reviewReachedAt || sim?.run?.decisions?.length >= 4);

    const cockpit = document.createElement('section');
    cockpit.className = 'lx-cockpit';
    cockpit.innerHTML = `
      <div class="lx-cockpit-top">
        <div class="lx-cockpit-main">
          <p class="eyebrow">Твоя следующая задача</p>
          <div class="lx-course-position">Модуль ${String(window.PM01.modules.indexOf(model.module) + 1).padStart(2, '0')} · ${moduleDone}/${model.module.lessons.length} уроков · общий прогресс ${progress}%</div>
          <h1>${escapeHtml(model.next.title)}</h1>
          <p class="lead">${escapeHtml(model.next.thesis)}</p>
          <div class="lx-cockpit-actions"><a class="button primary" href="#/lesson/${encodeURIComponent(model.next.id)}">Продолжить обучение →</a><a class="button subtle" href="#/course">Весь путь</a></div>
        </div>
        <aside class="lx-mission-card">
          <p class="eyebrow">Module Mission · M01</p><h2>${simComplete ? 'Миссия завершена' : 'Пять дней до запуска'}</h2>
          <p>${escapeHtml(company.label)} · ${escapeHtml(company.summary)}</p>
          <a class="button ${simComplete ? 'subtle' : 'primary'}" href="simulator.html#/mission/m01">${simComplete ? 'Повторить миссию' : 'Открыть миссию'} →</a>
        </aside>
      </div>
      <div class="lx-dashboard-grid">
        <section class="lx-dashboard-panel lx-skills"><div class="lx-panel-head"><div><p class="eyebrow">Mastery · M01</p><h2>Навыки, а не XP</h2></div><small>Уровень растёт только когда есть evidence из упражнения или миссии.</small></div><div class="lx-mastery-grid">${mastery.map(masteryCard).join('')}</div></section>
        <section class="lx-dashboard-panel"><p class="eyebrow">Project Map</p><h2>${projectMap.total ? `${projectMap.completed}/${projectMap.total}` : '0'} полей</h2><p>Структурированные ответы из практики. Это рабочая карта, а не конспект.</p><a href="#/lesson/project-system">Продолжить карту →</a></section>
        <section class="lx-dashboard-panel"><p class="eyebrow">Decision Journal</p><h2>${journal.length ? `${journal.length} последних записи` : 'Пока пусто'}</h2>${journal.length ? `<div class="lx-journal-list">${journal.map((entry) => `<a href="#/lesson/${entry.lesson.id}"><strong>${escapeHtml(entry.lesson.title)}</strong><span>${escapeHtml(entry.value.slice(0, 92))}${entry.value.length > 92 ? '…' : ''}</span></a>`).join('')}</div>` : '<p>Не конспектируй всё. Сохраняй только решение, вывод или вопрос, к которому реально хочешь вернуться.</p>'}</section>
      </div>`;
    page.insertBefore(cockpit, page.firstChild);
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
      if (label) label.textContent = 'Decision Journal · необязательно';
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
    if (label) label.textContent = 'Decision Journal · необязательно';
    if (help) help.textContent = 'Не пересказывай урок. Сохрани только то, что изменит следующее решение.';
  }

  function enhanceLearningPath() {
    if (!(location.hash || '').startsWith('#/course')) return;
    const firstRow = document.querySelector('#main .module-row');
    if (!firstRow || firstRow.querySelector('.lx-mission-badge')) return;
    const target = firstRow.querySelector('h2')?.parentElement;
    if (!target) return;
    const badge = document.createElement('div');
    badge.className = 'lx-mission-badge';
    badge.innerHTML = '<strong>Финал блока: интерактивная миссия</strong><span>4 решения · последствия · разбор траектории</span>';
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
      context.innerHTML = `<div><p class="eyebrow">Контекст компании</p><h3>${escapeHtml(profile.label)} · ${escapeHtml(profile.scale)}</h3><p>${escapeHtml(profile.summary)}</p></div>${companyChoices(locked)}${locked ? '<small>Тип компании зафиксирован на время текущего run, чтобы контекст не менялся посреди решений.</small>' : '<small>Выбор меняет организационный контекст, но не скрытую “сложность” и не влияет на базовые метрики миссии.</small>'}`;
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
    document.querySelectorAll('.lx-company-choices').forEach((node) => node.remove());
    document.querySelectorAll('.lx-sim-context, .lx-context-lens').forEach((node) => node.remove());
    document.querySelectorAll('.lx-transfer-practice, .lx-legacy-context').forEach((node) => node.remove());
    const cockpit = document.querySelector('.lx-cockpit');
    if (cockpit) cockpit.remove();
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
