(function () {
  'use strict';

  const STORAGE_KEY = 'pm01-guided-practice-v2';
  const COMPANY_KEY = 'pm01-company-context-v1';

  const COMPANY_LENS = {
    small: 'В малом бизнесе проверь ещё один вопрос: что произойдёт, если единственный владелец компетенции станет bottleneck? Скорость решения выше, но цена зависимости от конкретного человека тоже выше.',
    medium: 'В среднем бизнесе добавь к анализу handoff: какая функция владеет следующим обязательством и где решение может застрять между backlog, owner и соседней командой?',
    large: 'В крупном бизнесе проверь governance: какие approvals, compliance-ограничения или change windows делают обратимый на бумаге ход фактически дорогим в откате?'
  };

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_) { return {}; }
  }

  function writeState(value) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (_) {}
  }

  function currentCompany() {
    try {
      const value = localStorage.getItem(COMPANY_KEY);
      return COMPANY_LENS[value] ? value : 'medium';
    } catch (_) { return 'medium'; }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function lessonFromHash() {
    const match = (location.hash || '').match(/^#\/lesson\/([^/?#]+)/);
    if (!match || !window.PM01?.modules) return null;
    const id = decodeURIComponent(match[1]);
    return window.PM01.modules.flatMap((module) => module.lessons || []).find((lesson) => lesson.id === id) || null;
  }

  function resultLabel(score) {
    if (score >= 3) return 'Сильный ход';
    if (score >= 2) return 'Рабочий, но неполный';
    return 'Рискованный ход';
  }

  function initialMarkup(lesson, guided) {
    return `
      <div class="gp-head">
        <div><p class="eyebrow">Practice Case · 5 минут</p><h2>${escapeHtml(guided.title)}</h2></div>
        <span class="gp-badge">Решение до разбора</span>
      </div>
      <p class="gp-situation">${escapeHtml(guided.situation)}</p>
      <fieldset class="gp-fieldset">
        <legend>${escapeHtml(guided.prompt)}</legend>
        <div class="gp-options">${guided.options.map((item) => `<label class="gp-option"><input type="radio" name="guided-${escapeHtml(lesson.id)}" value="${escapeHtml(item.id)}"><span>${escapeHtml(item.label)}</span></label>`).join('')}</div>
      </fieldset>
      <p class="gp-hint">Выбери первый ход без поиска “правильного” ответа. После выбора появится разбор механизма и альтернатив.</p>`;
  }

  function resultMarkup(lesson, guided, selectedId) {
    const selected = guided.options.find((item) => item.id === selectedId) || guided.options[0];
    const company = currentCompany();
    return `
      <div class="gp-head">
        <div><p class="eyebrow">Practice Case · разбор</p><h2>${escapeHtml(guided.title)}</h2></div>
        <span class="gp-badge done">Решение зафиксировано</span>
      </div>
      <p class="gp-situation">${escapeHtml(guided.situation)}</p>
      <section class="gp-result ${selected.score >= 3 ? 'strong' : selected.score >= 2 ? 'partial' : 'weak'}" aria-live="polite">
        <small>Твой первый ход · ${escapeHtml(resultLabel(selected.score))}</small>
        <h3>${escapeHtml(selected.label)}</h3>
        <p>${escapeHtml(selected.feedback)}</p>
      </section>
      <section class="gp-debrief">
        <p class="eyebrow">Что здесь нужно заметить</p>
        <p>${escapeHtml(guided.debrief)}</p>
        <aside class="gp-company-lens"><strong>Линза масштаба компании</strong><p>${escapeHtml(COMPANY_LENS[company])}</p></aside>
      </section>
      <details class="gp-alternatives">
        <summary>Сравнить все четыре хода</summary>
        <div>${guided.options.map((item) => `<article class="${item.id === selected.id ? 'selected' : ''}"><div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(resultLabel(item.score))}</span></div><p>${escapeHtml(item.feedback)}</p></article>`).join('')}</div>
      </details>`;
  }

  function bind(card, lesson, guided) {
    card.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        const state = readState();
        if (state[lesson.id]?.optionId) return;
        state[lesson.id] = { optionId: input.value, answeredAt: new Date().toISOString() };
        writeState(state);
        card.innerHTML = resultMarkup(lesson, guided, input.value);
      }, { once: true });
    });
  }

  function render() {
    const lesson = lessonFromHash();
    if (!lesson?.guidedPractice || lesson.learningLab) return;
    const practice = document.querySelector('#main .practice');
    if (!practice || practice.querySelector('.guided-practice-v2')) return;

    const state = readState();
    const selectedId = state[lesson.id]?.optionId || null;
    const card = document.createElement('section');
    card.className = 'guided-practice-v2';
    card.dataset.guidedLesson = lesson.id;
    card.innerHTML = selectedId
      ? resultMarkup(lesson, lesson.guidedPractice, selectedId)
      : initialMarkup(lesson, lesson.guidedPractice);

    const legacyContext = practice.querySelector('.lx-legacy-context');
    if (legacyContext) legacyContext.insertAdjacentElement('beforebegin', card);
    else practice.insertBefore(card, practice.firstChild);
    if (!selectedId) bind(card, lesson, lesson.guidedPractice);
  }

  function start() {
    render();
    let queued = false;
    const main = document.querySelector('#main');
    const observer = main ? new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; render(); });
    }) : null;
    if (main) observer.observe(main, { childList: true, subtree: true });
    window.addEventListener('hashchange', () => requestAnimationFrame(render));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
