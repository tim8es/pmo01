(function () {
  "use strict";

  const THEME_KEY = "pm01-theme-v1";
  const COURSE_STATE_KEY = "pm01-state-v1";
  const root = document.documentElement;
  const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

  function storedTheme() {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (_) {
      return null;
    }
  }

  function preferredTheme() {
    return storedTheme() || (media?.matches ? "light" : "dark");
  }

  function updateThemeMeta(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f5f1e7" : "#0a0a0a");
  }

  function updateThemeControls(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const next = theme === "light" ? "dark" : "light";
      button.textContent = next === "light" ? "Светлая тема" : "Тёмная тема";
      button.setAttribute("aria-label", `Переключить на ${next === "light" ? "светлую" : "тёмную"} тему`);
      button.setAttribute("aria-pressed", String(theme === "light"));
    });
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    updateThemeMeta(theme);
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (_) {
        // Theme still applies for the current session when storage is unavailable.
      }
    }
    updateThemeControls(theme);
  }

  applyTheme(preferredTheme(), false);

  function themeButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle button subtle";
    button.dataset.themeToggle = "";
    button.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next, true);
    });
    return button;
  }

  function ensureThemeControls() {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar && !sidebar.querySelector("[data-theme-toggle]")) {
      const button = themeButton();
      const note = sidebar.querySelector(".sidebar-note");
      sidebar.insertBefore(button, note || null);
    }

    const mobileHeader = document.querySelector(".mobile-header");
    if (mobileHeader && !mobileHeader.querySelector("[data-theme-toggle]")) {
      const button = themeButton();
      button.classList.add("theme-toggle-mobile");
      const menu = mobileHeader.querySelector(".menu-button");
      mobileHeader.insertBefore(button, menu || null);
    }

    const simulatorNav = document.querySelector(".sim-standalone-nav");
    if (simulatorNav && !simulatorNav.querySelector("[data-theme-toggle]")) {
      const button = themeButton();
      button.classList.add("theme-toggle-simulator");
      const back = simulatorNav.querySelector(".sim-back");
      simulatorNav.insertBefore(button, back || null);
    }

    updateThemeControls(root.dataset.theme || preferredTheme());
  }

  function readCourseState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(COURSE_STATE_KEY)) || {};
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        lastLesson: parsed.lastLesson || null,
        notes: parsed.notes || {},
        criteria: parsed.criteria || {},
        lab: parsed.lab || {},
      };
    } catch (_) {
      return { completed: [], lastLesson: null, notes: {}, criteria: {}, lab: {} };
    }
  }

  function courseData() {
    const data = window.PM01;
    if (!data?.modules?.length) return null;
    const lessons = data.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title }))
    );
    return { data, lessons };
  }

  function hasValues(object) {
    return object && Object.keys(object).length > 0;
  }

  function hasStarted(state) {
    return Boolean(
      state.lastLesson ||
      state.completed.length ||
      hasValues(state.notes) ||
      hasValues(state.criteria) ||
      hasValues(state.lab)
    );
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function lessonWord(value) {
    const mod100 = value % 100;
    const mod10 = value % 10;
    if (mod100 >= 11 && mod100 <= 14) return "уроков";
    if (mod10 === 1) return "урок";
    if (mod10 >= 2 && mod10 <= 4) return "урока";
    return "уроков";
  }

  function nextLesson(lessons, state, completed) {
    const last = state.lastLesson ? lessons.find((lesson) => lesson.id === state.lastLesson) : null;
    if (last && !completed.has(last.id)) return last;
    return lessons.find((lesson) => !completed.has(lesson.id)) || lessons.at(-1);
  }

  function returningHomeModel() {
    const source = courseData();
    if (!source) return null;
    const state = readCourseState();
    if (!hasStarted(state)) return null;

    const completed = new Set(state.completed.filter((id) => source.lessons.some((lesson) => lesson.id === id)));
    const next = nextLesson(source.lessons, state, completed);
    if (!next) return null;

    const moduleIndex = source.data.modules.findIndex((module) => module.id === next.moduleId);
    const module = source.data.modules[moduleIndex];
    const moduleDone = module.lessons.filter((lesson) => completed.has(lesson.id)).length;
    const overallDone = source.lessons.filter((lesson) => completed.has(lesson.id)).length;
    const overallProgress = source.lessons.length ? Math.round((overallDone / source.lessons.length) * 100) : 0;
    const nextIndex = source.lessons.findIndex((lesson) => lesson.id === next.id);
    const after = source.lessons.slice(nextIndex + 1).find((lesson) => !completed.has(lesson.id));

    return {
      module,
      moduleIndex,
      moduleDone,
      next,
      after,
      overallDone,
      overallProgress,
      totalLessons: source.lessons.length,
      totalModules: source.data.modules.length,
    };
  }

  function enhanceReturningHome() {
    const page = document.querySelector("#main .page");
    if (!page || page.querySelector(".returning-home")) return;
    const hash = window.location.hash || "#/";
    if (hash !== "#/" && hash !== "#" && hash !== "") return;

    const model = returningHomeModel();
    if (!model) return;

    const section = document.createElement("section");
    section.className = "returning-home";
    section.setAttribute("aria-labelledby", "returning-home-title");
    section.innerHTML = `
      <div class="returning-home-main">
        <div class="returning-home-copy">
          <p class="eyebrow">Продолжить обучение</p>
          <p class="returning-context">Модуль ${String(model.moduleIndex + 1).padStart(2, "0")} из ${model.totalModules} · ${model.moduleDone} из ${model.module.lessons.length} ${lessonWord(model.module.lessons.length)} завершено</p>
          <h1 id="returning-home-title">${escapeHtml(model.next.title)}</h1>
          <p class="lead">${escapeHtml(model.next.thesis || model.module.outcome || "")}</p>
          <div class="returning-actions">
            <a class="button primary" href="#/lesson/${encodeURIComponent(model.next.id)}">Продолжить урок →</a>
            <a class="button subtle" href="#/course">Учебный путь</a>
          </div>
        </div>
        <aside class="returning-progress" aria-label="Общий прогресс курса">
          <strong>${model.overallProgress}%</strong>
          <span>курс пройден</span>
          <div class="returning-progress-track" aria-hidden="true"><span style="width:${model.overallProgress}%"></span></div>
          <p>${model.overallDone} из ${model.totalLessons} уроков</p>
        </aside>
      </div>
      <div class="returning-next-grid">
        <div>
          <span>Сейчас</span>
          <strong>${escapeHtml(model.module.title)}</strong>
          <small>${model.moduleDone}/${model.module.lessons.length} ${lessonWord(model.module.lessons.length)} · ${escapeHtml(model.module.duration || "")}</small>
        </div>
        <div>
          <span>После этого</span>
          <strong>${model.after ? escapeHtml(model.after.title) : "Финиш курса"}</strong>
          <small>${model.after ? `${escapeHtml(model.after.moduleTitle)} · ${escapeHtml(model.after.minutes || "")} мин` : "Все уроки будут завершены"}</small>
        </div>
      </div>`;

    page.classList.add("home-returning");
    page.insertBefore(section, page.firstChild);
  }

  function enhanceLearningPath() {
    const source = courseData();
    if (!source) return;
    const hash = window.location.hash || "#/";
    if (!hash.startsWith("#/course")) return;

    const state = readCourseState();
    const completed = new Set(state.completed);
    const rows = document.querySelectorAll("#main .module-row");

    rows.forEach((row, index) => {
      if (row.querySelector(".module-learning-meta")) return;
      const module = source.data.modules[index];
      if (!module) return;
      const done = module.lessons.filter((lesson) => completed.has(lesson.id)).length;
      const total = module.lessons.length;
      const percent = total ? Math.round((done / total) * 100) : 0;
      const target = module.lessons.find((lesson) => !completed.has(lesson.id)) || module.lessons.at(-1);
      const titleColumn = row.querySelector("h2")?.parentElement;
      if (!titleColumn) return;

      const meta = document.createElement("div");
      meta.className = "module-learning-meta";
      meta.innerHTML = `
        <span>${total} ${lessonWord(total)} · ${escapeHtml(module.duration || "")} · ${done}/${total} завершено</span>
        <span class="module-learning-progress" style="--module-progress:${percent}%" aria-label="Прогресс блока ${percent}%"></span>
        <small>${done === total ? "Блок завершён" : row.classList.contains("current") ? `Сейчас: ${escapeHtml(target?.title || "")}` : `Начнётся с: ${escapeHtml(target?.title || "")}`}</small>`;
      titleColumn.appendChild(meta);
    });
  }

  function enhanceCurrentView() {
    ensureThemeControls();
    enhanceReturningHome();
    enhanceLearningPath();
  }

  function start() {
    ensureThemeControls();
    enhanceCurrentView();

    const main = document.querySelector("#main");
    if (main) {
      let queued = false;
      const observer = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          enhanceCurrentView();
        });
      });
      observer.observe(main, { childList: true, subtree: true });
    }

    window.addEventListener("hashchange", () => requestAnimationFrame(enhanceCurrentView));
  }

  if (media?.addEventListener) {
    media.addEventListener("change", (event) => {
      if (!storedTheme()) applyTheme(event.matches ? "light" : "dark", false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
