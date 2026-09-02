(function () {
  "use strict";

  const DATA = window.PM01;
  const allLessons = DATA.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title }))
  );
  const storageKey = "pm01-state-v1";
  const defaultState = { completed: [], notes: {}, criteria: {}, lastLesson: null, diagnostic: {} };
  let state = loadState();

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      return { ...defaultState, ...stored };
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
    return Math.round((state.completed.length / allLessons.length) * 100);
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
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function moduleCompletion(module) {
    const done = module.lessons.filter((lesson) => state.completed.includes(lesson.id)).length;
    return { done, total: module.lessons.length, percent: Math.round((done / module.lessons.length) * 100) };
  }

  function nextLesson() {
    if (state.lastLesson && !state.completed.includes(state.lastLesson)) {
      return allLessons.find((lesson) => lesson.id === state.lastLesson) || allLessons[0];
    }
    return allLessons.find((lesson) => !state.completed.includes(lesson.id)) || allLessons.at(-1);
  }

  function homeView() {
    const next = nextLesson();
    const nextIndex = allLessons.findIndex((lesson) => lesson.id === next.id) + 1;
    return `
      <div class="page">
        <section class="hero">
          <p class="eyebrow">Практическая программа · уровень senior+</p>
          <h1>Инженерия<br><span class="accent">исполнения</span></h1>
          <p class="lead">Научись управлять не задачами и статусами, а системой: потоком ценности, решений, информации, зависимостей и риска.</p>
          <div class="hero-actions">
            <a class="button primary" href="#/lesson/${next.id}">${progress() ? "Продолжить обучение" : "Начать с первого урока"}</a>
            <a class="button" href="#/diagnostic">Пройти диагностику</a>
          </div>
          <div class="stat-grid">
            <div class="stat"><strong>10</strong><span>модулей</span></div>
            <div class="stat"><strong>20</strong><span>полевых уроков</span></div>
            <div class="stat"><strong>8</strong><span>рабочих шаблонов</span></div>
            <div class="stat"><strong>2–4</strong><span>недели на capstone</span></div>
          </div>
        </section>

        <section class="section">
          <div class="section-heading"><div><p class="eyebrow">Основная модель</p><h2>Семь потоков проекта</h2></div><p>Любая системная проблема проекта проявляется как задержка, разрыв или искажение одного из этих потоков.</p></div>
          <div class="system-map">${DATA.flows.map((flow, i) => `<div class="system-node" style="--node:${flow.color}"><span>0${i + 1}</span><strong>${flow.name}</strong></div>`).join("")}</div>
        </section>

        <section class="section next-card">
          <div>
            <p class="eyebrow" style="color:var(--ink)">Следующий шаг · урок ${String(nextIndex).padStart(2, "0")}</p>
            <h2>${next.title}</h2>
            <p>${next.thesis}</p>
          </div>
          <div class="next-meta">
            <span class="mono">${next.minutes} минут · ${next.moduleTitle}</span>
            <a class="button" href="#/lesson/${next.id}">Открыть урок →</a>
          </div>
        </section>

        <section class="section">
          <div class="section-heading"><div><p class="eyebrow">Маршрут</p><h2>Не линейный курс, а система практики</h2></div><a class="button subtle" href="#/course">Вся программа</a></div>
          <div class="module-grid">${DATA.modules.slice(0, 4).map(moduleCard).join("")}</div>
        </section>
      </div>`;
  }

  function moduleCard(module, index = DATA.modules.indexOf(module)) {
    const completion = moduleCompletion(module);
    return `<article class="module-card" data-number="${String(index + 1).padStart(2, "0")}">
      <span class="module-kicker">МОДУЛЬ ${String(index + 1).padStart(2, "0")} · ${module.duration}</span>
      <h3>${module.title}</h3><p>${module.outcome}</p>
      <div class="module-footer"><span class="mono muted">${completion.done}/${completion.total}</span><a href="#/lesson/${module.lessons[0].id}">Перейти →</a></div>
    </article>`;
  }

  function courseView() {
    const hours = DATA.modules.reduce((sum, module) => {
      const [min, max] = module.duration.match(/\d+/g).map(Number);
      return [sum[0] + min, sum[1] + max];
    }, [0, 0]);
    return `<div class="page">
      <section class="course-intro">
        <div><p class="eyebrow">Учебный маршрут</p><h1>От диспетчера задач<br>к архитектору системы</h1><p class="lead">Каждый модуль заканчивается артефактом для реального проекта. Теория считается освоенной только после наблюдаемого изменения системы.</p></div>
        <div class="course-metrics"><strong>${hours[0]}–${hours[1]} ч</strong><p>общая нагрузка</p><strong>${progress()}%</strong><p>пройдено</p><strong>1</strong><p>итоговое системное вмешательство</p></div>
      </section>
      <div class="module-list">${DATA.modules.map((module, index) => {
        const completion = moduleCompletion(module);
        return `<article class="module-row"><span class="module-index">${String(index + 1).padStart(2, "0")}</span><h2>${module.title}</h2><p>${module.outcome}</p><a href="#/lesson/${module.lessons[0].id}">${completion.done === completion.total ? "Пройдено ✓" : `${completion.done}/${completion.total} · Открыть`}</a></article>`;
      }).join("")}</div>
    </div>`;
  }

  function lessonView(id) {
    const lesson = allLessons.find((item) => item.id === id);
    if (!lesson) return notFoundView();
    state.lastLesson = id;
    saveState();
    const index = allLessons.findIndex((item) => item.id === id);
    const previous = allLessons[index - 1];
    const next = allLessons[index + 1];
    const checked = state.criteria[id] || [];
    const done = state.completed.includes(id);

    return `<div class="page lesson-layout">
      <article>
        <header class="lesson-header">
          <p class="eyebrow">${lesson.moduleTitle} · урок ${String(index + 1).padStart(2, "0")}/${allLessons.length}</p>
          <h1>${lesson.title}</h1>
          <p class="lead">${lesson.thesis}</p>
          <div class="meta"><span>${lesson.minutes} минут</span><span>практика обязательна</span></div>
        </header>

        <section class="lesson-block" id="idea"><h2>Смена оптики</h2>${lesson.body.map((paragraph) => `<p>${paragraph}</p>`).join("")}</section>
        <blockquote class="insight">${lesson.thesis}</blockquote>
        <section class="lesson-block" id="model"><h2>Рабочая модель</h2><div class="model-card">${lesson.model}</div></section>
        <section class="practice" id="practice">
          <p class="eyebrow">Полевая работа</p><h2>Применить на реальном проекте</h2>
          <ol>${lesson.practice.map((step) => `<li>${step}</li>`).join("")}</ol>
          <h3>Доказательства освоения</h3>
          <div class="criteria">${lesson.criteria.map((criterion, criterionIndex) => `<label class="criterion"><input type="checkbox" data-criterion="${criterionIndex}" ${checked.includes(criterionIndex) ? "checked" : ""}><span>${criterion}</span></label>`).join("")}</div>
          <label for="lesson-notes"><strong>Рабочие заметки</strong></label>
          <textarea class="notes" id="lesson-notes" placeholder="Факты, решение, результат…">${escapeHtml(state.notes[id] || "")}</textarea>
          <div class="lesson-actions">
            <button class="button primary ${done ? "done" : ""}" id="complete-lesson">${done ? "Урок пройден ✓" : "Отметить урок пройденным"}</button>
            <button class="button" id="save-notes">Сохранить заметки</button>
          </div>
        </section>
      </article>

      <aside class="lesson-aside">
        <nav class="toc" aria-label="Разделы урока"><small>В ЭТОМ УРОКЕ</small><a href="#/lesson/${id}" data-scroll="idea">Смена оптики</a><a href="#/lesson/${id}" data-scroll="model">Рабочая модель</a><a href="#/lesson/${id}" data-scroll="practice">Полевая работа</a></nav>
        <div class="lesson-nav">
          ${previous ? `<a class="button subtle" href="#/lesson/${previous.id}">← Назад</a>` : ""}
          ${next ? `<a class="button subtle" href="#/lesson/${next.id}">Следующий →</a>` : `<a class="button subtle" href="#/course">К программе</a>`}
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
      <p class="eyebrow">Baseline · 7 потоков</p><h1>Диагностика зрелости</h1>
      <p class="lead">Оцени не намерения команды, а воспроизводимое поведение системы за последние четыре недели. Результат покажет, с какого модуля начинать.</p>
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
      target.innerHTML = `<p class="eyebrow">Результат</p><h3>${answers.length}/${DATA.diagnostics.length} ответов</h3><p class="result-empty">Ответь на все вопросы. Оценка сохранится в этом браузере автоматически.</p>`;
      return;
    }
    const scores = Object.fromEntries(DATA.flows.map((flow) => [flow.id, []]));
    DATA.diagnostics.forEach((item, index) => scores[item.flow].push(Number(state.diagnostic[index])));
    const results = DATA.flows.map((flow) => ({ ...flow, score: Math.round(scores[flow.id].reduce((a, b) => a + b, 0) / (scores[flow.id].length * 3) * 100) }));
    const weakest = [...results].sort((a, b) => a.score - b.score)[0];
    const moduleMap = { value: 2, work: 4, information: 8, decisions: 7, dependencies: 3, uncertainty: 6, feedback: 10 };
    const recommended = DATA.modules[moduleMap[weakest.id] - 1];
    target.innerHTML = `<p class="eyebrow">Точка старта</p><h3>${weakest.name}: ${weakest.score}%</h3><p class="result-empty">Слабейший поток системы. Начни с модуля «${recommended.title}» и повтори диагностику после полевого вмешательства.</p>${results.map((result) => `<div class="score-row"><div><span>${result.name}</span><strong>${result.score}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${result.score}%;background:${result.color}"></div></div></div>`).join("")}<a class="button primary" style="width:100%;margin-top:12px" href="#/lesson/${recommended.lessons[0].id}">Открыть модуль ${String(moduleMap[weakest.id]).padStart(2, "0")}</a>`;
  }

  function toolkitView() {
    return `<div class="page"><p class="eyebrow">Рабочие артефакты</p><h1>Инструменты,<br>которые меняют решения</h1><p class="lead">Скачай Markdown-шаблон, заполни фактами реального проекта и принеси на следующую точку принятия решения.</p>
      <div class="tool-grid">${DATA.tools.map((tool, index) => `<article class="tool-card"><span class="tool-number">TOOL ${String(index + 1).padStart(2, "0")}</span><h3>${tool.name}</h3><p>${tool.description}</p><button class="button subtle download-tool" data-index="${index}">Скачать .md ↓</button></article>`).join("")}</div>
      <section class="section"><div class="section-heading"><div><p class="eyebrow">Правило применения</p><h2>Артефакт существует ради решения</h2></div></div><div class="principles"><div class="principle"><strong>Есть потребитель</strong><p>До заполнения ясно, кто и какое решение примет с его помощью.</p></div><div class="principle"><strong>Есть срок жизни</strong><p>Устаревший документ удаляют или обновляют, а не хранят как декорацию.</p></div><div class="principle"><strong>Один источник истины</strong><p>Информация не копируется вручную между несколькими статусами.</p></div><div class="principle"><strong>Минимум достаточного</strong><p>Поле остается только если его отсутствие уже приводило к дорогой ошибке.</p></div></div></section>
    </div>`;
  }

  function notFoundView() {
    return `<div class="page empty-state"><p class="eyebrow">404</p><h1>Такого урока нет</h1><p class="lead" style="margin-inline:auto">Вернись к программе и выбери следующий шаг.</p><a class="button primary" href="#/course">Открыть программу</a></div>`;
  }

  function bindViewEvents(route, id) {
    if (route === "lesson") {
      document.querySelectorAll("[data-scroll]").forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          document.querySelector(`#${link.dataset.scroll}`)?.scrollIntoView({ behavior: "smooth" });
        });
      });
      document.querySelectorAll("[data-criterion]").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          state.criteria[id] = [...document.querySelectorAll("[data-criterion]:checked")].map((item) => Number(item.dataset.criterion));
          saveState();
        });
      });
      document.querySelector("#save-notes")?.addEventListener("click", () => {
        state.notes[id] = document.querySelector("#lesson-notes").value;
        saveState();
        showToast("Заметки сохранены");
      });
      document.querySelector("#complete-lesson")?.addEventListener("click", (event) => {
        state.notes[id] = document.querySelector("#lesson-notes").value;
        const completed = state.completed.includes(id);
        if (!completed && (state.criteria[id] || []).length < document.querySelectorAll("[data-criterion]").length) {
          saveState();
          showToast("Сначала отметь все доказательства освоения");
          return;
        }
        state.completed = completed ? state.completed.filter((item) => item !== id) : [...state.completed, id];
        saveState();
        event.currentTarget.textContent = completed ? "Отметить урок пройденным" : "Урок пройден ✓";
        event.currentTarget.classList.toggle("done", !completed);
        showToast(completed ? "Отметка снята" : "Урок добавлен в прогресс");
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
    if (["course", "diagnostic", "toolkit"].includes(parts[0])) return { route: parts[0] };
    return { route: "not-found" };
  }

  function render() {
    const { route, id } = parseRoute();
    const views = { home: homeView, course: courseView, lesson: () => lessonView(id), diagnostic: diagnosticView, toolkit: toolkitView, "not-found": notFoundView };
    document.querySelector("#main").innerHTML = views[route]();
    setActiveNav(route);
    renderSidebarProgress();
    bindViewEvents(route, id);
    document.querySelector("#main").focus({ preventScroll: true });
    window.scrollTo(0, 0);
    document.querySelector("#mobile-nav").classList.remove("open");
    document.querySelector("#menu-button").setAttribute("aria-expanded", "false");
  }

  document.querySelector("#menu-button").addEventListener("click", (event) => {
    const nav = document.querySelector("#mobile-nav");
    const open = nav.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(open));
  });
  window.addEventListener("hashchange", render);
  render();
})();
