(function () {
  "use strict";

  const DATA = window.PM01;
  const allLessons = DATA.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title }))
  );
  const storageKey = "pm01-state-v1";
  const defaultState = { completed: [], notes: {}, criteria: {}, lastLesson: null, diagnostic: {}, lab: {} };
  let state = loadState();

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey)) || {};
      return { ...defaultState, ...stored, lab: stored.lab || {} };
    } catch (_) {
      return { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
    renderSidebarProgress();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function progress() {
    return allLessons.length ? Math.round((state.completed.length / allLessons.length) * 100) : 0;
  }

  function renderSidebarProgress() {
    const target = document.querySelector("#sidebar-progress");
    if (!target) return;
    target.innerHTML = `
      <div class="label-row"><span>Прогресс</span><strong>${progress()}%</strong></div>
      <div class="progress-track" aria-label="Пройдено ${progress()}%"><div class="progress-fill" style="width:${progress()}%"></div></div>
      <div class="label-row" style="margin-top:9px"><span>${state.completed.length} из ${allLessons.length} уроков</span></div>`;
  }

  function setActiveNav(route) {
    document.querySelectorAll(".main-nav a").forEach((link) => {
      const expected = link.dataset.route;
      const active = expected === "home" ? route === "home" : route === expected || (expected === "course" && route === "lesson");
      link.classList.toggle("active", active);
    });
  }

  function showToast(message) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function moduleCompletion(module) {
    const done = module.lessons.filter((lesson) => state.completed.includes(lesson.id)).length;
    const total = module.lessons.length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }

  function nextLesson() {
    if (state.lastLesson && !state.completed.includes(state.lastLesson)) {
      return allLessons.find((lesson) => lesson.id === state.lastLesson) || allLessons[0];
    }
    return allLessons.find((lesson) => !state.completed.includes(lesson.id)) || allLessons.at(-1);
  }

  function moduleTargetLesson(module) {
    return module.lessons.find((lesson) => !state.completed.includes(lesson.id)) || module.lessons.at(-1);
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
    const requiredDrills = lesson.learningLab.drills.filter((drill) => drill.required !== false);
    const requiredFields = lesson.learningLab.workbookFields.filter((field) => field.required !== false);
    const answeredDrills = requiredDrills.filter((drill) => Boolean(lessonState.drillAnswers[drill.id])).length;
    const completedFields = requiredFields.filter((field) => String(lessonState.workbook[field.id] || "").trim().length > 0).length;
    return {
      ready: answeredDrills === requiredDrills.length && completedFields === requiredFields.length,
      answeredDrills,
      requiredDrills: requiredDrills.length,
      completedFields,
      requiredFields: requiredFields.length,
    };
  }

  function homeView() {
    const next = nextLesson();
    const nextIndex = allLessons.findIndex((lesson) => lesson.id === next.id) + 1;
    return `
      <div class="page">
        <section class="hero">
          <p class="eyebrow">Практика управления проектами · senior+</p>
          <h1>Управляй системой,<br><span class="accent">а не списком задач</span></h1>
          <p class="lead">Курс учит находить причину проблем проекта, принимать решения и проверять их на реальной работе. Иди по урокам по порядку — практика встроена в каждый шаг.</p>
          <div class="hero-actions">
            <a class="button primary" href="#/lesson/${next.id}">${progress() ? "Продолжить" : "Начать обучение"}</a>
            <a class="button" href="#/course">Посмотреть путь</a>
            <a class="button subtle" href="#/diagnostic">Самопроверка · необязательно</a>
          </div>
          <div class="stat-grid">
            <div class="stat"><strong>10</strong><span>модулей по порядку</span></div>
            <div class="stat"><strong>20</strong><span>уроков с практикой</span></div>
            <div class="stat"><strong>8</strong><span>рабочих шаблонов</span></div>
            <div class="stat"><strong>1</strong><span>итоговая работа</span></div>
          </div>
        </section>

        <section class="section">
          <div class="section-heading"><div><p class="eyebrow">Модель курса</p><h2>Семь потоков проекта</h2></div><p>Это семь мест, где чаще всего ломается работа проекта. В каждом модуле ты научишься замечать один из таких разрывов и исправлять его.</p></div>
          <div class="system-map">${DATA.flows.map((flow, i) => `<div class="system-node" style="--node:${flow.color}"><span>0${i + 1}</span><strong>${flow.name}</strong></div>`).join("")}</div>
        </section>

        <section class="section next-card">
          <div>
            <p class="eyebrow" style="color:var(--ink)">Твой следующий шаг · урок ${String(nextIndex).padStart(2, "0")}</p>
            <h2>${next.title}</h2>
            <p>${next.thesis}</p>
          </div>
          <div class="next-meta">
            <span class="mono">${next.minutes} минут · ${next.moduleTitle}</span>
            <a class="button" href="#/lesson/${next.id}">Продолжить →</a>
          </div>
        </section>

        <section class="section">
          <div class="section-heading"><div><p class="eyebrow">Основной путь</p><h2>Один маршрут: урок → практика → следующий урок</h2></div><a class="button subtle" href="#/course">Все 10 модулей</a></div>
          <div class="module-grid">${DATA.modules.slice(0, 4).map(moduleCard).join("")}</div>
        </section>
      </div>`;
  }

  function moduleCard(module, index = DATA.modules.indexOf(module)) {
    const completion = moduleCompletion(module);
    const target = moduleTargetLesson(module);
    return `<article class="module-card" data-number="${String(index + 1).padStart(2, "0")}">
      <span class="module-kicker">МОДУЛЬ ${String(index + 1).padStart(2, "0")} · ${module.duration}</span>
      <h3>${module.title}</h3><p>${module.outcome}</p>
      <div class="module-footer"><span class="mono muted">${completion.done}/${completion.total}</span><a href="#/lesson/${target.id}">${completion.done === completion.total ? "Повторить" : "Продолжить"} →</a></div>
    </article>`;
  }

  function courseView() {
    const hours = DATA.modules.reduce((sum, module) => {
      const values = module.duration.match(/\d+/g)?.map(Number) || [0, 0];
      const min = values[0] || 0;
      const max = values[1] ?? min;
      return [sum[0] + min, sum[1] + max];
    }, [0, 0]);
    const currentModuleIndex = DATA.modules.findIndex((module) => moduleCompletion(module).done < module.lessons.length);
    return `<div class="page">
      <section class="course-intro">
        <div><p class="eyebrow">Основной путь</p><h1>10 модулей.<br>Иди по порядку.</h1><p class="lead">Начни с первого незавершённого урока. В M01 решения и рабочая карта проверяются прямо внутри урока. Проверки и диагностика дополняют путь, но не создают второй курс.</p></div>
        <div class="course-metrics"><strong>${hours[0]}–${hours[1]} ч</strong><p>ориентир по времени</p><strong>${progress()}%</strong><p>пройдено</p><strong>${state.completed.length}/${allLessons.length}</strong><p>уроков завершено</p></div>
      </section>
      <div class="path-note"><strong>Как двигаться:</strong><span>1. Разбери кейс</span><span>2. Примени технику</span><span>3. Заполни рабочий инструмент</span><span>4. Проверь перенос на проект</span></div>
      <div class="module-list">${DATA.modules.map((module, index) => {
        const completion = moduleCompletion(module);
        const target = moduleTargetLesson(module);
        const finished = completion.done === completion.total;
        const current = !finished && (currentModuleIndex === index || currentModuleIndex === -1);
        const status = finished ? "Завершено" : current ? "Сейчас" : "Дальше";
        return `<article class="module-row ${finished ? "completed" : current ? "current" : "upcoming"}"><span class="module-index">${String(index + 1).padStart(2, "0")}</span><div><span class="module-status">${status}</span><h2>${module.title}</h2></div><p>${module.outcome}</p><a href="#/lesson/${target.id}">${finished ? "Повторить" : current ? "Продолжить" : "Открыть"} →</a></article>`;
      }).join("")}</div>
    </div>`;
  }

  function renderLabFeedback(drill, answerId) {
    const option = drill.options?.find((item) => item.id === answerId);
    if (!option) return `<div class="lab-feedback" aria-live="polite" data-lab-feedback="${drill.id}"><span>Выбери вариант, чтобы получить разбор.</span></div>`;
    const label = Number(option.score) >= 3 ? "Сильный ход" : Number(option.score) >= 2 ? "Неполный диагноз" : "Слабый ход";
    return `<div class="lab-feedback ${Number(option.score) >= 3 ? "strong" : "needs-work"}" aria-live="polite" data-lab-feedback="${drill.id}"><strong>${label}</strong><p>${escapeHtml(option.feedback)}</p></div>`;
  }

  function renderLabDrill(drill, lessonState, isCold = false) {
    if (!drill) return "";
    const answer = lessonState.drillAnswers[drill.id];
    return `<section class="lab-drill" ${isCold ? 'id="lab-cold"' : ""}>
      <p class="lab-step">${isCold ? "01 · Сначала реши" : "04 · Exit check"}</p>
      <h2>${escapeHtml(drill.title || "Decision drill")}</h2>
      <p class="lab-situation">${escapeHtml(drill.situation || "")}</p>
      <fieldset>
        <legend>${escapeHtml(drill.prompt || "Что сделаешь?")}</legend>
        <div class="lab-options">${(drill.options || []).map((option) => `<label class="lab-option"><input type="radio" name="lab-${drill.id}" value="${option.id}" data-lab-drill="${drill.id}" ${answer === option.id ? "checked" : ""}><span>${escapeHtml(option.label)}</span></label>`).join("")}</div>
      </fieldset>
      ${renderLabFeedback(drill, answer)}
    </section>`;
  }

  function renderLearningLab(lesson, next, done) {
    const lab = lesson.learningLab;
    const lessonState = ensureLabState(lesson.id);
    const readiness = labReady(lesson);
    const coldDrill = lab.drills.find((drill) => drill.stage === "cold") || lab.drills[0];
    const laterDrills = lab.drills.filter((drill) => drill !== coldDrill);
    return `<section class="learning-lab" id="practice">
      <header class="lab-intro">
        <p class="eyebrow">Learning Lab</p>
        <h2>Навык урока</h2>
        <p>${escapeHtml(lab.skill)}</p>
      </header>

      ${renderLabDrill(coldDrill, lessonState, true)}

      <section class="lab-worked" id="lab-worked">
        <p class="lab-step">02 · Сверь мышление</p>
        <h2>${escapeHtml(lab.workedExample.title)}</h2>
        <ol>${lab.workedExample.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
      </section>

      <section class="lab-technique" id="lab-technique">
        <p class="lab-step">03 · Техника</p>
        <h2>${escapeHtml(lab.technique.name)}</h2>
        <p class="lab-purpose">${escapeHtml(lab.technique.purpose)}</p>
        <ol>${lab.technique.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        <div class="lab-model">${escapeHtml(lab.technique.model)}</div>
      </section>

      ${laterDrills.map((drill) => renderLabDrill(drill, lessonState)).join("")}

      <section class="lab-workbook" id="lab-workbook">
        <p class="lab-step">05 · Рабочий инструмент</p>
        <h2>${escapeHtml(lab.workbookTitle)}</h2>
        <p>Заполни поля фактами. Ответы сохраняются в этом браузере автоматически.</p>
        <div class="lab-fields">${lab.workbookFields.map((field) => `<label class="lab-field"><strong>${escapeHtml(field.label)}</strong><span>${escapeHtml(field.prompt)}</span><textarea data-lab-field="${field.id}" rows="3">${escapeHtml(lessonState.workbook[field.id] || "")}</textarea></label>`).join("")}</div>
      </section>

      <section class="lab-transfer">
        <p class="lab-step">06 · Перенос</p>
        <h2>Примени к реальному проекту</h2>
        <p>${escapeHtml(lab.transferPrompt)}</p>
      </section>

      <section class="lab-finish">
        <p class="completion-status ${readiness.ready ? "ready" : ""}" id="completion-status">${readiness.answeredDrills}/${readiness.requiredDrills} решений · ${readiness.completedFields}/${readiness.requiredFields} полей${readiness.ready ? " · можно завершать урок" : " · заверши обязательные решения и рабочую карту"}</p>
        <label for="lesson-notes"><strong>Личные заметки</strong><span class="field-help">Необязательно: вывод, вопрос или решение, которое хочешь сохранить.</span></label>
        <textarea class="notes" id="lesson-notes" placeholder="Что изменилось в твоём понимании?">${escapeHtml(state.notes[lesson.id] || "")}</textarea>
        <div class="lesson-actions">
          ${done
            ? `<a class="button primary" href="${next ? `#/lesson/${next.id}` : "#/course"}">${next ? "Продолжить к следующему уроку" : "Вернуться к программе"} →</a>`
            : `<button class="button primary" id="complete-lesson" ${readiness.ready ? "" : "disabled"}>Завершить урок и продолжить →</button>`}
          <button class="button" id="save-notes">Сохранить заметки</button>
        </div>
      </section>
    </section>`;
  }

  function renderLegacyPractice(lesson, next, done, checked, ready) {
    const required = lesson.criteria.length;
    return `<section class="practice" id="practice">
      <p class="eyebrow">Практика</p><h2>Примени к своему проекту</h2>
      <ol>${lesson.practice.map((step) => `<li>${step}</li>`).join("")}</ol>
      <h3>Проверь результат</h3>
      <p class="practice-help">Отметь пункт только если действительно сделал его. Это не тест — чекбоксы просто помогают понять, готов ли ты идти дальше.</p>
      <div class="criteria">${lesson.criteria.map((criterion, criterionIndex) => `<label class="criterion"><input type="checkbox" data-criterion="${criterionIndex}" ${checked.includes(criterionIndex) ? "checked" : ""}><span>${criterion}</span></label>`).join("")}</div>
      <p class="completion-status ${ready ? "ready" : ""}" id="completion-status">${checked.length}/${required} выполнено${ready ? " · можно завершать урок" : " · выполни все пункты, чтобы открыть следующий шаг"}</p>
      <label for="lesson-notes"><strong>Заметки</strong><span class="field-help">Можно сохранить примеры, решения или выводы.</span></label>
      <textarea class="notes" id="lesson-notes" placeholder="Что заметил? Что решил? Что изменилось?">${escapeHtml(state.notes[lesson.id] || "")}</textarea>
      <div class="lesson-actions">
        ${done
          ? `<a class="button primary" href="${next ? `#/lesson/${next.id}` : "#/course"}">${next ? "Продолжить к следующему уроку" : "Вернуться к программе"} →</a>`
          : `<button class="button primary" id="complete-lesson" ${ready ? "" : "disabled"}>Завершить урок и продолжить →</button>`}
        <button class="button" id="save-notes">Сохранить заметки</button>
      </div>
    </section>`;
  }

  function lessonView(id) {
    const lesson = allLessons.find((item) => item.id === id);
    if (!lesson) return notFoundView();
    state.lastLesson = id;
    if (lesson.learningLab) ensureLabState(id);
    saveState();
    const index = allLessons.findIndex((item) => item.id === id);
    const previous = allLessons[index - 1];
    const next = allLessons[index + 1];
    const checked = state.criteria[id] || [];
    const done = state.completed.includes(id);
    const ready = lesson.learningLab ? labReady(lesson).ready : checked.length >= lesson.criteria.length;

    return `<div class="page lesson-layout">
      <article>
        <header class="lesson-header">
          <p class="eyebrow">${lesson.moduleTitle} · урок ${String(index + 1).padStart(2, "0")}/${allLessons.length}</p>
          <h1>${lesson.title}</h1>
          <p class="lead">${lesson.thesis}</p>
          <div class="meta"><span>${lesson.minutes} минут</span><span>${done ? "завершён ✓" : lesson.learningLab ? "кейс + техника + инструмент" : "теория + практика"}</span></div>
        </header>

        ${lesson.learningLab ? "" : `<section class="lesson-block" id="idea"><h2>Главная мысль</h2>${lesson.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}</section>`}
        ${lesson.learningLab ? renderLearningLab(lesson, next, done) : `
          <blockquote class="insight">${lesson.thesis}</blockquote>
          <section class="lesson-block" id="model"><h2>Как это работает</h2><div class="model-card">${lesson.model}</div></section>
          ${renderLegacyPractice(lesson, next, done, checked, ready)}`}
      </article>

      <aside class="lesson-aside">
        <nav class="toc" aria-label="Разделы урока"><small>В ЭТОМ УРОКЕ</small>${lesson.learningLab
          ? `<a href="#/lesson/${id}" data-scroll="lab-cold">Кейс</a><a href="#/lesson/${id}" data-scroll="lab-technique">Техника</a><a href="#/lesson/${id}" data-scroll="lab-workbook">Рабочий инструмент</a>`
          : `<a href="#/lesson/${id}" data-scroll="idea">Главная мысль</a><a href="#/lesson/${id}" data-scroll="model">Как это работает</a><a href="#/lesson/${id}" data-scroll="practice">Практика</a>`}</nav>
        <div class="lesson-nav">
          ${previous ? `<a class="button subtle" href="#/lesson/${previous.id}">← Предыдущий урок</a>` : ""}
          <a class="button subtle" href="#/course">Все модули</a>
        </div>
      </aside>
    </div>`;
  }

  function diagnosticView() {
    const choices = [
      { score: 0, label: "Нет — это происходит случайно или никогда" },
      { score: 1, label: "Иногда — зависит от конкретного человека" },
      { score: 2, label: "Часто — есть практика, но она нестабильна" },
      { score: 3, label: "Системно — есть правило, владелец и обратная связь" }
    ];
    return `<div class="page">
      <p class="eyebrow">Необязательная самопроверка</p><h1>Где проект теряет управляемость?</h1>
      <p class="lead">Оцени, как проект работал последние четыре недели. Результат покажет слабое место, на которое стоит обратить внимание. Порядок курса при этом не меняется.</p>
      <div class="diagnostic-grid section">
        <form id="diagnostic-form">${DATA.diagnostics.map((item, index) => `<fieldset class="question-card"><legend>${index + 1}. ${item.q}</legend><div class="options">${choices.map((choice) => `<label class="option"><input type="radio" name="q${index}" value="${choice.score}" data-flow="${item.flow}" ${String(state.diagnostic[index]) === String(choice.score) ? "checked" : ""}><span>${choice.label}</span></label>`).join("")}</div></fieldset>`).join("")}</form>
        <aside class="diagnostic-result" id="diagnostic-result"></aside>
      </div>
    </div>`;
  }

  function renderDiagnosticResult() {
    const target = document.querySelector("#diagnostic-result");
    if (!target) return;
    const answers = Object.keys(state.diagnostic);
    if (answers.length < DATA.diagnostics.length) {
      target.innerHTML = `<p class="eyebrow">Результат</p><h3>${answers.length}/${DATA.diagnostics.length} ответов</h3><p class="result-empty">Ответь на все вопросы. Ответы сохраняются в этом браузере автоматически.</p>`;
      return;
    }
    const scores = Object.fromEntries(DATA.flows.map((flow) => [flow.id, []]));
    DATA.diagnostics.forEach((item, index) => scores[item.flow].push(Number(state.diagnostic[index])));
    const results = DATA.flows.map((flow) => ({ ...flow, score: Math.round(scores[flow.id].reduce((a, b) => a + b, 0) / (scores[flow.id].length * 3) * 100) }));
    const weakest = [...results].sort((a, b) => a.score - b.score)[0];
    const moduleMap = { value: 2, work: 4, information: 8, decisions: 7, dependencies: 3, uncertainty: 6, feedback: 10 };
    const recommended = DATA.modules[moduleMap[weakest.id] - 1];
    target.innerHTML = `<p class="eyebrow">Зона внимания</p><h3>${weakest.name}: ${weakest.score}%</h3><p class="result-empty">Слабее всего сейчас выглядит поток «${weakest.name}». Продолжай основной путь и обрати особое внимание на модуль «${recommended.title}».</p>${results.map((result) => `<div class="score-row"><div><span>${result.name}</span><strong>${result.score}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${result.score}%;background:${result.color}"></div></div></div>`).join("")}<a class="button primary" style="width:100%;margin-top:12px" href="#/course">Вернуться к основному пути</a>`;
  }

  function toolkitView() {
    return `<div class="page"><p class="eyebrow">Шаблоны для работы</p><h1>Инструменты,<br>которые помогают принять решение</h1><p class="lead">Скачай нужный Markdown-шаблон, заполни его фактами проекта и используй в реальной рабочей ситуации.</p>
      <div class="tool-grid">${DATA.tools.map((tool, index) => `<article class="tool-card"><span class="tool-number">TOOL ${String(index + 1).padStart(2, "0")}</span><h3>${tool.name}</h3><p>${tool.description}</p><button class="button subtle download-tool" data-index="${index}">Скачать .md ↓</button></article>`).join("")}</div>
      <section class="section"><div class="section-heading"><div><p class="eyebrow">Правило</p><h2>Шаблон нужен только тогда, когда помогает решить задачу</h2></div></div><div class="principles"><div class="principle"><strong>Понятно, кому нужен</strong><p>До заполнения ясно, кто и какое решение примет с его помощью.</p></div><div class="principle"><strong>Понятно, когда устареет</strong><p>Ненужный документ удаляют или обновляют, а не хранят ради процесса.</p></div><div class="principle"><strong>Один источник</strong><p>Не копируй одну и ту же информацию вручную в несколько мест.</p></div><div class="principle"><strong>Только нужные поля</strong><p>Оставляй поле, если без него уже возникали ошибки или плохие решения.</p></div></div></section>
    </div>`;
  }

  function notFoundView() {
    return `<div class="page empty-state"><p class="eyebrow">404</p><h1>Такой страницы нет</h1><p class="lead" style="margin-inline:auto">Вернись к учебному пути и продолжи с текущего шага.</p><a class="button primary" href="#/course">Открыть учебный путь</a></div>`;
  }

  function updateLessonCompletionGate(id) {
    const criteria = document.querySelectorAll("[data-criterion]");
    const checked = document.querySelectorAll("[data-criterion]:checked").length;
    const button = document.querySelector("#complete-lesson");
    const status = document.querySelector("#completion-status");
    const ready = checked >= criteria.length;
    if (button) button.disabled = !ready;
    if (status) {
      status.textContent = `${checked}/${criteria.length} выполнено${ready ? " · можно завершать урок" : " · выполни все пункты, чтобы открыть следующий шаг"}`;
      status.classList.toggle("ready", ready);
    }
    state.criteria[id] = [...document.querySelectorAll("[data-criterion]:checked")].map((item) => Number(item.dataset.criterion));
    saveState();
  }

  function updateLabCompletionGate(id) {
    const lesson = allLessons.find((item) => item.id === id);
    if (!lesson?.learningLab) return;
    const readiness = labReady(lesson);
    const button = document.querySelector("#complete-lesson");
    const status = document.querySelector("#completion-status");
    if (button) button.disabled = !readiness.ready;
    if (status) {
      status.textContent = `${readiness.answeredDrills}/${readiness.requiredDrills} решений · ${readiness.completedFields}/${readiness.requiredFields} полей${readiness.ready ? " · можно завершать урок" : " · заверши обязательные решения и рабочую карту"}`;
      status.classList.toggle("ready", readiness.ready);
    }
  }

  function bindViewEvents(route, id) {
    if (route === "lesson") {
      const lesson = allLessons.find((item) => item.id === id);
      document.querySelectorAll("[data-scroll]").forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          document.querySelector(`#${link.dataset.scroll}`)?.scrollIntoView({ behavior: "smooth" });
        });
      });

      document.querySelectorAll("[data-criterion]").forEach((checkbox) => {
        checkbox.addEventListener("change", () => updateLessonCompletionGate(id));
      });

      document.querySelectorAll("[data-lab-drill]").forEach((input) => {
        input.addEventListener("change", (event) => {
          const drillId = event.target.dataset.labDrill;
          const lessonState = ensureLabState(id);
          lessonState.drillAnswers[drillId] = event.target.value;
          const drill = lesson?.learningLab?.drills.find((item) => item.id === drillId);
          const feedback = document.querySelector(`[data-lab-feedback="${drillId}"]`);
          if (feedback && drill) feedback.outerHTML = renderLabFeedback(drill, event.target.value);
          saveState();
          updateLabCompletionGate(id);
        });
      });

      document.querySelectorAll("[data-lab-field]").forEach((field) => {
        field.addEventListener("input", (event) => {
          const lessonState = ensureLabState(id);
          lessonState.workbook[event.target.dataset.labField] = event.target.value;
          saveState();
          updateLabCompletionGate(id);
        });
      });

      document.querySelector("#save-notes")?.addEventListener("click", () => {
        state.notes[id] = document.querySelector("#lesson-notes")?.value || "";
        saveState();
        showToast("Заметки сохранены");
      });

      document.querySelector("#complete-lesson")?.addEventListener("click", () => {
        state.notes[id] = document.querySelector("#lesson-notes")?.value || "";
        if (lesson?.learningLab) {
          if (!labReady(lesson).ready) {
            updateLabCompletionGate(id);
            showToast("Сначала заверши решения и рабочую карту");
            return;
          }
        } else {
          const criteriaCount = document.querySelectorAll("[data-criterion]").length;
          if ((state.criteria[id] || []).length < criteriaCount) {
            updateLessonCompletionGate(id);
            showToast("Сначала выполни все пункты практики");
            return;
          }
        }
        if (!state.completed.includes(id)) state.completed = [...state.completed, id];
        saveState();
        const index = allLessons.findIndex((item) => item.id === id);
        const next = allLessons[index + 1];
        showToast("Урок завершён");
        location.hash = next ? `#/lesson/${next.id}` : "#/course";
      });
    }

    if (route === "diagnostic") {
      document.querySelector("#diagnostic-form")?.addEventListener("change", (event) => {
        const index = Number(event.target.name.slice(1));
        state.diagnostic[index] = Number(event.target.value);
        saveState();
        renderDiagnosticResult();
      });
      renderDiagnosticResult();
    }

    if (route === "toolkit") {
      document.querySelectorAll(".download-tool").forEach((button) => button.addEventListener("click", () => {
        const tool = DATA.tools[Number(button.dataset.index)];
        const blob = new Blob([tool.content], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = tool.file;
        link.click();
        URL.revokeObjectURL(url);
        showToast(`Скачан ${tool.file}`);
      }));
    }
  }

  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (!parts.length) return { route: "home" };
    if (parts[0] === "lesson") return { route: "lesson", id: parts[1] };
    if (parts[0] === "validation" && parts[1] === "m01" && parts.length === 2) return { route: "validation-m01" };
    if (["course", "diagnostic", "toolkit"].includes(parts[0])) return { route: parts[0] };
    return { route: "not-found" };
  }

  function render() {
    const { route, id } = parseRoute();
    if (route === "validation-m01") return;
    const views = { home: homeView, course: courseView, lesson: () => lessonView(id), diagnostic: diagnosticView, toolkit: toolkitView, "not-found": notFoundView };
    document.querySelector("#main").innerHTML = views[route]();
    setActiveNav(route);
    renderSidebarProgress();
    bindViewEvents(route, id);
    document.querySelector("#main")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    document.querySelector("#mobile-nav")?.classList.remove("open");
    document.querySelector("#menu-button")?.setAttribute("aria-expanded", "false");
  }

  document.querySelector("#menu-button")?.addEventListener("click", (event) => {
    const nav = document.querySelector("#mobile-nav");
    const open = nav?.classList.toggle("open") || false;
    event.currentTarget.setAttribute("aria-expanded", String(open));
  });
  window.addEventListener("hashchange", render);
  render();
})();