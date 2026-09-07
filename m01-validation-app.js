(function () {
  'use strict';

  const DATA = window.PM01 && window.PM01.m01Validation;
  const DOMAIN = window.PM01Learning;
  const validationStorageKey = 'pm01-validation-m01-v1';
  const legacyStorageKey = 'pm01-state-v1';
  const validationRoute = 'validation/m01';
  const m01LessonIds = ['project-system', 'system-diagnostic'];

  if (!DATA || !DOMAIN) return;

  const lessons = (window.PM01.modules || []).flatMap((module) => module.lessons || []);

  function lesson(id) {
    return lessons.find((item) => item.id === id);
  }

  function emptyAssessment() {
    return { answers: {}, reasoning: '', submittedAt: null, score: null };
  }

  function emptyValidationState() {
    return {
      version: 1,
      baseline: emptyAssessment(),
      drills: {},
      postCase: emptyAssessment(),
      field: { values: {}, submittedAt: null },
      reflection: { values: {}, delayedTransfer: '', submittedAt: null },
    };
  }

  function loadJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function loadValidationState() {
    const stored = loadJson(validationStorageKey, {});
    const defaults = emptyValidationState();
    return {
      ...defaults,
      ...stored,
      baseline: { ...defaults.baseline, ...(stored.baseline || {}), answers: { ...(stored.baseline && stored.baseline.answers || {}) } },
      drills: { ...(stored.drills || {}) },
      postCase: { ...defaults.postCase, ...(stored.postCase || {}), answers: { ...(stored.postCase && stored.postCase.answers || {}) } },
      field: { ...defaults.field, ...(stored.field || {}), values: { ...(stored.field && stored.field.values || {}) } },
      reflection: { ...defaults.reflection, ...(stored.reflection || {}), values: { ...(stored.reflection && stored.reflection.values || {}) } },
    };
  }

  let state = loadValidationState();
  let storageHealthy = testStorage();

  function testStorage() {
    const key = `${validationStorageKey}-probe`;
    try {
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch (_) {
      return false;
    }
  }

  function saveValidationState(message) {
    try {
      localStorage.setItem(validationStorageKey, JSON.stringify(state));
      storageHealthy = true;
      if (message) setMessage(message);
      return true;
    } catch (_) {
      storageHealthy = false;
      setMessage('Не удалось сохранить данные в браузере. Не переходи к следующему шагу: ответы могут быть потеряны.', true);
      return false;
    }
  }

  function legacyState() {
    return loadJson(legacyStorageKey, { completed: [] });
  }

  function lessonEvidenceComplete(currentLesson, stored) {
    if (!currentLesson || !currentLesson.learningLab) return true;
    const lessonState = stored.lab && stored.lab[currentLesson.id] || {};
    const drillAnswers = lessonState.drillAnswers || {};
    const workbook = lessonState.workbook || {};
    const requiredDrills = currentLesson.learningLab.drills.filter((drill) => drill.required !== false);
    const requiredFields = currentLesson.learningLab.workbookFields.filter((field) => field.required !== false);
    return requiredDrills.every((drill) => Boolean(drillAnswers[drill.id]))
      && requiredFields.every((field) => String(workbook[field.id] || '').trim().length > 0);
  }

  function isStudied() {
    const stored = legacyState();
    const completed = Array.isArray(stored.completed) ? stored.completed : [];
    return m01LessonIds.every((id) => completed.includes(id) && lessonEvidenceComplete(lesson(id), stored));
  }

  function allDrillsAnswered() {
    return DATA.decisionDrills.every((drill) => state.drills[drill.id] && state.drills[drill.id].choice);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function currentRoute() {
    return location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  }

  function setMessage(text, error) {
    const target = document.querySelector('#validation-message');
    if (!target) return;
    target.textContent = text || '';
    target.dataset.error = error ? 'true' : 'false';
  }

  function assessmentComplete(assessment, draft) {
    return assessment.questions.every((question) => draft.answers[question.id]) && draft.reasoning.trim().length >= 20;
  }

  function assessmentBlock(assessment, key, heading, unlocked) {
    const draft = state[key];
    const submitted = Boolean(draft.submittedAt);
    const revealResults = submitted && (key !== 'baseline' || Boolean(state.postCase.submittedAt));
    if (!unlocked) {
      return `<section class="validation-step locked" aria-disabled="true">
        <header><p class="eyebrow">${escapeHtml(heading)}</p><h2>${escapeHtml(assessment.title)}</h2><p>Этот этап откроется после предыдущих шагов.</p></header>
      </section>`;
    }

    const questions = assessment.questions.map((question) => {
      const selected = draft.answers[question.id];
      const options = question.options.map((item) => {
        const checked = selected === item.id;
        return `<label class="validation-option">
          <input type="radio" name="${key}-${escapeHtml(question.id)}" value="${escapeHtml(item.id)}" data-assessment="${key}" data-question="${escapeHtml(question.id)}" ${checked ? 'checked' : ''} ${submitted ? 'disabled' : ''}>
          <span>${escapeHtml(item.label)}</span>
        </label>${revealResults && checked ? `<p class="validation-feedback">${escapeHtml(item.feedback)}</p>` : ''}`;
      }).join('');
      return `<fieldset class="validation-question" ${submitted ? 'disabled' : ''}>
        <legend>${escapeHtml(question.prompt)}</legend>
        <div class="validation-options">${options}</div>
      </fieldset>`;
    }).join('');

    const score = revealResults && draft.score ? `<div class="validation-score">
      <div><strong>${draft.score.total}/${draft.score.max}</strong><span>итог по rubric</span></div>
      <div><strong>${draft.score.answered}/${assessment.questions.length}</strong><span>зафиксировано ответов</span></div>
      <div><strong>зафиксирован</strong><span>ответ нельзя менять после submit</span></div>
    </div>` : '';

    const submittedMessage = key === 'baseline' && !state.postCase.submittedAt
      ? 'Baseline зафиксирован; результат скрыт до post-case, чтобы не загрязнять измерение.'
      : 'Ответ зафиксирован. Feedback открыт после завершения измерения.';

    return `<section class="validation-step" data-assessment-section="${key}">
      <header><p class="eyebrow">${escapeHtml(heading)}</p><h2>${escapeHtml(assessment.title)}</h2><p>${escapeHtml(assessment.scenario)}</p></header>
      <div class="validation-scenario">${escapeHtml(assessment.reasoningPrompt)}</div>
      <label for="${key}-reasoning"><strong>Твой диагноз своими словами</strong></label>
      <textarea class="validation-reasoning" id="${key}-reasoning" data-reasoning="${key}" ${submitted ? 'readonly' : ''} placeholder="Минимум 20 символов: механизм, первое действие, ожидаемый сигнал…">${escapeHtml(draft.reasoning)}</textarea>
      ${questions}
      ${score}
      ${submitted ? `<p class="validation-message">${submittedMessage}</p>` : `<div class="validation-actions"><button class="button primary" type="button" data-submit-assessment="${key}">Зафиксировать ответ</button></div>`}
    </section>`;
  }

  function drillBlock(drill) {
    const stored = state.drills[drill.id];
    const selected = stored && stored.choice;
    const options = drill.options.map((item) => {
      const checked = selected === item.id;
      return `<label class="validation-option">
        <input type="radio" name="drill-${escapeHtml(drill.id)}" value="${escapeHtml(item.id)}" data-drill="${escapeHtml(drill.id)}" ${checked ? 'checked' : ''} ${selected ? 'disabled' : ''}>
        <span>${escapeHtml(item.label)}</span>
      </label>${checked ? `<p class="validation-feedback">${escapeHtml(item.feedback)}</p>` : ''}`;
    }).join('');
    return `<article class="validation-drill">
      <p class="eyebrow">Decision Drill</p>
      <h3>${escapeHtml(drill.title)}</h3>
      <p>${escapeHtml(drill.situation)}</p>
      <fieldset class="validation-question" ${selected ? 'disabled' : ''}>
        <legend>${escapeHtml(drill.prompt)}</legend>
        <div class="validation-options">${options}</div>
      </fieldset>
    </article>`;
  }

  function learningBlock() {
    const studied = isStudied();
    const drillsDone = allDrillsAnswered();
    return `<section class="validation-step">
      <header><p class="eyebrow">02 · Learning</p><h2>Изучи модель и прими два решения</h2><p>Вернись сюда после двух уроков. Decision Drills фиксируют первое решение до показа feedback.</p></header>
      <div class="validation-lesson-links">
        <a class="button subtle" href="#/lesson/project-system">Урок 1 · За пределами треугольника</a>
        <a class="button subtle" href="#/lesson/system-diagnostic">Урок 2 · Диагностика до вмешательства</a>
      </div>
      <p class="validation-state">Уроки: ${studied ? 'изучены ✓' : 'нужно завершить оба'} · Drills: ${drillsDone ? '2/2 ✓' : `${Object.keys(state.drills).length}/2`}</p>
      <div class="validation-drills">${DATA.decisionDrills.map(drillBlock).join('')}</div>
    </section>`;
  }

  function resultBlock() {
    if (!state.baseline.score || !state.postCase.score) return '';
    const decision = DOMAIN.promotionDecision(state.baseline.score, state.postCase.score, DATA.promotionRule);
    const dimensions = DATA.rubricDimensions.map((dimension) => {
      const before = state.baseline.score.byDimension[dimension.id] || 0;
      const after = state.postCase.score.byDimension[dimension.id] || 0;
      const diff = after - before;
      return `<div class="validation-dimension"><span>${escapeHtml(dimension.label)}</span><span>${before} → ${after}${diff > 0 ? ` (+${diff})` : diff < 0 ? ` (${diff})` : ''}</span></div>`;
    }).join('');
    const deltaLabel = decision.delta > 0 ? `+${decision.delta}` : String(decision.delta);
    const explanation = decision.promoted
      ? 'Есть прототипный сигнал улучшения: выполнены оба promotion gate. Это не означает mastery и требует проверки на реальном переносе.'
      : `Promotion gate пока не пройден: требуется delta ≥ ${DATA.promotionRule.minDelta} и улучшение минимум по ${DATA.promotionRule.minDimensionsImproved} измерениям.`;
    return `<section class="validation-result" aria-label="Сравнение baseline и post-case">
      <p class="eyebrow">Learning signal</p><h2>Что изменилось в reasoning</h2>
      <div class="validation-score">
        <div><strong>${state.baseline.score.total}/15</strong><span>baseline</span></div>
        <div><strong>${state.postCase.score.total}/15</strong><span>post-case</span></div>
        <div><strong>${deltaLabel}</strong><span>delta</span></div>
      </div>
      <p>${escapeHtml(explanation)}</p>
      <div class="validation-dimensions">${dimensions}</div>
    </section>`;
  }

  function fieldBlock(unlocked) {
    if (!unlocked) return `<section class="validation-step locked" aria-disabled="true"><header><p class="eyebrow">04 · Transfer</p><h2>Перенос на реальный проект</h2><p>Откроется после post-case.</p></header></section>`;
    const submitted = Boolean(state.field.submittedAt);
    const fields = DATA.fieldApplication.fields.map((field) => `<div>
      <label for="field-${escapeHtml(field.id)}">${escapeHtml(field.label)}<small>${escapeHtml(field.prompt)}</small></label>
      <textarea id="field-${escapeHtml(field.id)}" data-field="${escapeHtml(field.id)}" ${submitted ? 'readonly' : ''}>${escapeHtml(state.field.values[field.id] || '')}</textarea>
    </div>`).join('');
    return `<section class="validation-step">
      <header><p class="eyebrow">04 · Transfer</p><h2>${escapeHtml(DATA.fieldApplication.title)}</h2><p>${escapeHtml(DATA.fieldApplication.instructions)}</p></header>
      <div class="validation-evidence">${fields}</div>
      ${submitted ? '<p class="validation-state">Field application зафиксирован ✓</p>' : '<div class="validation-actions"><button class="button primary" type="button" id="submit-field">Зафиксировать field application</button><button class="button" type="button" id="save-field">Сохранить черновик</button></div>'}
    </section>`;
  }

  function reflectionBlock(unlocked) {
    if (!unlocked) return `<section class="validation-step locked" aria-disabled="true"><header><p class="eyebrow">05 · Reflection</p><h2>Обновление mental model</h2><p>Откроется после field application.</p></header></section>`;
    const submitted = Boolean(state.reflection.submittedAt);
    const prompts = DATA.reflection.prompts.map((prompt) => `<div>
      <label for="reflection-${escapeHtml(prompt.id)}">${escapeHtml(prompt.label)}</label>
      <textarea id="reflection-${escapeHtml(prompt.id)}" data-reflection="${escapeHtml(prompt.id)}" ${submitted ? 'readonly' : ''}>${escapeHtml(state.reflection.values[prompt.id] || '')}</textarea>
    </div>`).join('');
    return `<section class="validation-step">
      <header><p class="eyebrow">05 · Reflection</p><h2>${escapeHtml(DATA.reflection.title)}</h2><p>Не пересказывай урок. Зафиксируй, что именно изменилось в диагнозе, действии или требованиях к доказательствам.</p></header>
      <div class="validation-evidence">${prompts}
        <div>
          <label for="delayed-transfer">Отложенный перенос (необязательно)<small>После паузы опиши новый, не использованный выше кейс и как ты применил модель. Это evidence для review, но не автоматический mastery.</small></label>
          <textarea id="delayed-transfer" data-delayed-transfer ${submitted ? 'readonly' : ''}>${escapeHtml(state.reflection.delayedTransfer || '')}</textarea>
        </div>
      </div>
      ${submitted ? '<p class="validation-state">Reflection зафиксирован ✓</p>' : '<div class="validation-actions"><button class="button primary" type="button" id="submit-reflection">Зафиксировать reflection</button><button class="button" type="button" id="save-reflection">Сохранить черновик</button></div>'}
    </section>`;
  }

  function evidenceStateLabel() {
    const studied = isStudied();
    const fieldApplied = Boolean(state.field.submittedAt);
    const learningState = DOMAIN.deriveLearningState({ studied, fieldApplied, transferEvidence: false });
    const labels = { unseen: 'не начато', studied: 'изучено', applied: 'применено', mastered: 'mastered' };
    return labels[learningState] || learningState;
  }

  function validationView() {
    const baselineDone = Boolean(state.baseline.submittedAt);
    const postUnlocked = baselineDone && isStudied() && allDrillsAnswered();
    const postDone = Boolean(state.postCase.submittedAt);
    const fieldDone = Boolean(state.field.submittedAt);
    const storageWarning = storageHealthy ? '' : '<p class="validation-note">Браузер сейчас не дает сохранить localStorage. Не продолжай эксперимент до восстановления хранения: переход к урокам может привести к потере ответов.</p>';

    return `<div class="page validation-shell">
      <header class="validation-hero">
        <p class="eyebrow">Phase 1 · Reference prototype</p>
        <h1>${escapeHtml(DATA.title)}</h1>
        <p class="lead">${escapeHtml(DATA.promise)}</p>
        <p class="validation-note">Это эксперимент качества обучения, а не экзамен. Система измеряет изменение reasoning; статус <strong>mastered</strong> автоматически не присваивается.</p>
        ${storageWarning}
        <span class="validation-state">Evidence state: ${escapeHtml(evidenceStateLabel())}</span>
      </header>

      ${assessmentBlock(DATA.baseline, 'baseline', '01 · Baseline', true)}
      ${baselineDone ? learningBlock() : '<section class="validation-step locked" aria-disabled="true"><header><p class="eyebrow">02 · Learning</p><h2>Сначала зафиксируй baseline</h2><p>Материал модуля намеренно не показывается в этом маршруте до baseline, чтобы не загрязнять исходное измерение.</p></header></section>'}
      ${assessmentBlock(DATA.postCase, 'postCase', '03 · Integrative case', postUnlocked)}
      ${postDone ? resultBlock() : ''}
      ${fieldBlock(postDone)}
      ${reflectionBlock(fieldDone)}

      <div class="validation-actions">
        <a class="button subtle" href="#/course">← К программе</a>
        <button class="button subtle" type="button" id="reset-validation">Сбросить M01 validation data</button>
      </div>
      <div class="validation-message" id="validation-message" aria-live="polite"></div>
    </div>`;
  }

  function fieldComplete() {
    return DATA.fieldApplication.fields.every((field) => String(state.field.values[field.id] || '').trim().length >= 8);
  }

  function reflectionComplete() {
    return DATA.reflection.prompts.every((prompt) => String(state.reflection.values[prompt.id] || '').trim().length >= 12);
  }

  function rerenderValidation(message) {
    renderValidationRoute();
    if (message) setMessage(message);
  }

  function bindAssessmentEvents() {
    document.querySelectorAll('[data-assessment]').forEach((input) => input.addEventListener('change', () => {
      const key = input.dataset.assessment;
      if (state[key].submittedAt) return;
      state[key].answers[input.dataset.question] = input.value;
      saveValidationState('Черновик ответа сохранен.');
    }));

    document.querySelectorAll('[data-reasoning]').forEach((textarea) => textarea.addEventListener('change', () => {
      const key = textarea.dataset.reasoning;
      if (state[key].submittedAt) return;
      state[key].reasoning = textarea.value;
      saveValidationState('Черновик reasoning сохранен.');
    }));

    document.querySelectorAll('[data-submit-assessment]').forEach((button) => button.addEventListener('click', () => {
      const key = button.dataset.submitAssessment;
      const assessment = key === 'baseline' ? DATA.baseline : DATA.postCase;
      const reasoning = document.querySelector(`[data-reasoning="${key}"]`);
      if (reasoning) state[key].reasoning = reasoning.value;
      if (!assessmentComplete(assessment, state[key])) {
        saveValidationState();
        setMessage('Ответь на все пять вопросов и запиши диагноз минимум в 20 символах.', true);
        return;
      }
      state[key].score = DOMAIN.scoreAssessment(assessment.questions, state[key].answers);
      state[key].submittedAt = new Date().toISOString();
      if (saveValidationState()) rerenderValidation(`${key === 'baseline' ? 'Baseline' : 'Post-case'} зафиксирован.`);
    }));
  }

  function bindDrillEvents() {
    document.querySelectorAll('[data-drill]').forEach((input) => input.addEventListener('change', () => {
      const id = input.dataset.drill;
      if (state.drills[id] && state.drills[id].choice) return;
      state.drills[id] = { choice: input.value, selectedAt: new Date().toISOString() };
      if (saveValidationState()) rerenderValidation('Первый выбор Decision Drill зафиксирован; feedback открыт.');
    }));
  }

  function bindFieldEvents() {
    document.querySelectorAll('[data-field]').forEach((textarea) => textarea.addEventListener('change', () => {
      if (state.field.submittedAt) return;
      state.field.values[textarea.dataset.field] = textarea.value;
      saveValidationState('Черновик field application сохранен.');
    }));
    document.querySelector('#save-field')?.addEventListener('click', () => {
      document.querySelectorAll('[data-field]').forEach((textarea) => { state.field.values[textarea.dataset.field] = textarea.value; });
      saveValidationState('Черновик field application сохранен.');
    });
    document.querySelector('#submit-field')?.addEventListener('click', () => {
      document.querySelectorAll('[data-field]').forEach((textarea) => { state.field.values[textarea.dataset.field] = textarea.value; });
      if (!fieldComplete()) {
        saveValidationState();
        setMessage('Заполни все поля field application содержательно (минимум 8 символов в каждом).', true);
        return;
      }
      state.field.submittedAt = new Date().toISOString();
      if (saveValidationState()) rerenderValidation('Field application зафиксирован.');
    });
  }

  function bindReflectionEvents() {
    document.querySelectorAll('[data-reflection]').forEach((textarea) => textarea.addEventListener('change', () => {
      if (state.reflection.submittedAt) return;
      state.reflection.values[textarea.dataset.reflection] = textarea.value;
      saveValidationState('Черновик reflection сохранен.');
    }));
    document.querySelector('[data-delayed-transfer]')?.addEventListener('change', (event) => {
      if (state.reflection.submittedAt) return;
      state.reflection.delayedTransfer = event.currentTarget.value;
      saveValidationState('Черновик delayed transfer сохранен.');
    });
    const collect = () => {
      document.querySelectorAll('[data-reflection]').forEach((textarea) => { state.reflection.values[textarea.dataset.reflection] = textarea.value; });
      const delayed = document.querySelector('[data-delayed-transfer]');
      if (delayed) state.reflection.delayedTransfer = delayed.value;
    };
    document.querySelector('#save-reflection')?.addEventListener('click', () => {
      collect();
      saveValidationState('Черновик reflection сохранен.');
    });
    document.querySelector('#submit-reflection')?.addEventListener('click', () => {
      collect();
      if (!reflectionComplete()) {
        saveValidationState();
        setMessage('Ответь на все обязательные reflection prompts содержательно (минимум 12 символов).', true);
        return;
      }
      state.reflection.submittedAt = new Date().toISOString();
      if (saveValidationState()) rerenderValidation('Reflection зафиксирован. M01 validation готов к review.');
    });
  }

  function bindReset() {
    document.querySelector('#reset-validation')?.addEventListener('click', () => {
      if (!window.confirm('Удалить только данные M01 validation в этом браузере? Прогресс основного курса не изменится.')) return;
      try {
        localStorage.removeItem(validationStorageKey);
        state = emptyValidationState();
        storageHealthy = testStorage();
        rerenderValidation('M01 validation data сброшены.');
      } catch (_) {
        setMessage('Не удалось сбросить данные браузера.', true);
      }
    });
  }

  function renderValidationRoute() {
    const main = document.querySelector('#main');
    if (!main) return;
    main.innerHTML = validationView();
    document.querySelectorAll('.main-nav a').forEach((link) => link.classList.toggle('active', link.dataset.route === 'course'));
    bindAssessmentEvents();
    bindDrillEvents();
    bindFieldEvents();
    bindReflectionEvents();
    bindReset();
    main.focus({ preventScroll: true });
  }

  function decorateCourse() {
    if (document.querySelector('[data-validation-cta]')) return;
    const moduleList = document.querySelector('.module-list');
    if (!moduleList) return;
    moduleList.insertAdjacentHTML('beforebegin', `<section class="validation-cta" data-validation-cta>
      <p class="eyebrow">Phase 1 · M01</p>
      <h2>Проверить, изменилось ли системное мышление</h2>
      <p>Отдельный маршрут фиксирует baseline до обучения, затем post-case, перенос на реальный проект и reflection. Результат — learning signal, не сертификат и не автоматический mastery.</p>
      <a class="button primary" href="#/validation/m01">Начать M01 validation →</a>
    </section>`);
  }

  function renderExtension() {
    if (currentRoute() === validationRoute) renderValidationRoute();
    else if (currentRoute() === 'course') decorateCourse();
  }

  window.addEventListener('hashchange', () => queueMicrotask(renderExtension));
  renderExtension();
})();