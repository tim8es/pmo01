(function () {
  'use strict';

  const STORAGE_KEY = 'pm01-m02-challenge-v5';
  const COURSE_KEY = 'pm01-state-v1';
  const COMPANY_KEY = 'pm01-company-context-v1';
  const ROUTE = '#/challenge/m02';

  const CHALLENGE = {
    title: 'Запуск AI-отчётности: доказать ценность до ставки',
    premise: 'B2B-команда через шесть недель запускает функцию AI-отчётности. Панель почти готова, отдел продаж уже обещает снижение ручной работы, но никто не проверил, изменится ли рабочее поведение пользователей. Одновременно неизвестны готовность платить, стоимость модели на реальном объёме и нагрузка на поддержку.',
    decisions: [
      {
        id: 'value-chain',
        skillId: 'value',
        lessonId: 'outcome-tree',
        lessonLabel: 'M02.1 · Outcome до output',
        title: 'D1 · Что проверять до расширения объёма?',
        prompt: 'У команды есть две недели свободной мощности до фиксации объёма. Какой первый ход лучше всего уменьшит риск выпустить убедительный результат разработки без полезного эффекта?',
        strongOptionId: 'strong-value',
        options: [
          { id: 'ship-more', label: 'Использовать свободную мощность, чтобы добавить ещё два типа AI-отчётов.', grade: 'weak', feedback: 'Ты увеличиваешь объём разработки до проверки механизма ценности. Если пользовательское поведение не изменится, цена ошибки только вырастет.' },
          { id: 'ask-kpi', label: 'Зафиксировать KPI «минус 30% ручного времени» и продолжить разработку.', grade: 'partial', feedback: 'KPI делает обещание измеримым, но сам по себе не доказывает, почему новая функция должна изменить этот показатель.' },
          { id: 'strong-value', label: 'Восстановить цепь функция → новая способность → изменение поведения → бизнес-эффект и проверить слабейшую связь на реальных пользователях.', grade: 'strong', feedback: 'Ты проверяешь механизм ценности до следующего дорогого обязательства: не «нравится ли панель», а меняет ли она реальное решение и трудозатраты.' },
          { id: 'wait-release', label: 'Довести текущий объём до релиза и измерять эффект только после запуска.', grade: 'weak', feedback: 'Это откладывает главное обучение до момента, когда продуктовая и коммерческая ставка уже дороже в изменении.' },
        ],
        principle: 'Результат разработки получает ценность только через проверяемую причинную цепочку до поведения и эффекта.',
      },
      {
        id: 'assumption-priority',
        skillId: 'uncertainty',
        lessonId: 'assumption-map',
        lessonLabel: 'M02.2 · Карта допущений',
        title: 'D2 · Какое неизвестное проверять первым?',
        prompt: 'Через десять дней отдел продаж хочет объявить цену и дату запуска. Как определить, какое неизвестное проверить первым?',
        strongOptionId: 'strong-assumption',
        options: [
          { id: 'all-in-parallel', label: 'Параллельно исследовать цену, стоимость модели и нагрузку на поддержку одинаково глубоко.', grade: 'partial', feedback: 'Параллельность выглядит безопасно, но размазывает ограниченное время и не связывает исследование с ценой конкретной ошибки.' },
          { id: 'weak-assumption', label: 'Начать со стоимости модели: её проще всего точно посчитать.', grade: 'weak', feedback: 'Простота проверки не делает неизвестное приоритетным. Можно идеально измерить дешёвую ошибку и пропустить дорогую ставку.' },
          { id: 'strong-assumption', label: 'Ранжировать допущения по низкой уверенности × цене ошибки × близости необратимости и получить минимально достаточное доказательство для верхнего риска до публичного обещания.', grade: 'strong', feedback: 'Ты получаешь информацию там, где она способна изменить дорогое решение до того, как обещание станет трудно откатить.' },
          { id: 'add-buffer', label: 'Добавить две недели к дате и оставить проверки на период после анонса.', grade: 'weak', feedback: 'Запас времени защищает срок от вариативности, но не делает ложное ценностное или коммерческое допущение менее ложным.' },
        ],
        principle: 'Проверяй неизвестность не по удобству, а по ожидаемой цене неправильного необратимого решения.',
      },
    ],
  };

  const CONTEXT_LENS = {
    small: 'В малом бизнесе ошибка быстро бьёт по ограниченной мощности: не строй отдельный исследовательский процесс, но и не трать единственную команду на недоказанный объём.',
    medium: 'В среднем бизнесе цена, продукт, поддержка и платформа имеют разных владельцев: доказательство должно прийти к конкретному владельцу решения до передачи ответственности.',
    large: 'В крупном бизнесе публичное обещание, закупки и согласования делают откат дороже: точку необратимости нужно назвать до формального обязательства.',
  };

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
  }

  function getState() {
    const raw = readJson(STORAGE_KEY, {});
    return {
      decisions: raw.decisions && typeof raw.decisions === 'object' ? { ...raw.decisions } : {},
      completedAt: raw.completedAt || null,
    };
  }

  function writeState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function decisionById(id) {
    return CHALLENGE.decisions.find((decision) => decision.id === id) || null;
  }

  function optionById(decision, optionId) {
    return decision?.options?.find((option) => option.id === optionId) || null;
  }

  function commit(decisionId, optionId) {
    const decision = decisionById(decisionId);
    if (!decision || !optionById(decision, optionId)) return false;
    const state = getState();
    if (state.decisions[decisionId]) return false;
    state.decisions[decisionId] = optionId;
    if (CHALLENGE.decisions.every((item) => Boolean(state.decisions[item.id]))) {
      state.completedAt = state.completedAt || new Date().toISOString();
    }
    writeState(state);
    return true;
  }

  function isComplete() {
    const state = getState();
    return CHALLENGE.decisions.every((decision) => Boolean(state.decisions[decision.id]));
  }

  function proof() {
    const state = getState();
    return {
      value: state.decisions['value-chain'] === 'strong-value',
      uncertainty: state.decisions['assumption-priority'] === 'strong-assumption',
    };
  }

  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  function open() {
    if (typeof location !== 'undefined') location.hash = ROUTE;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function m02Ready() {
    const modules = window.PM01?.modules || [];
    const module = modules.find((item) => item.id === 'm02');
    const mastery = window.PM01MasteryV5;
    if (!module || !mastery?.labEvidence) return false;
    const courseState = readJson(COURSE_KEY, {});
    return module.lessons.every((lesson) => mastery.labEvidence(lesson, courseState).applied);
  }

  function gradeLabel(grade) {
    if (grade === 'strong') return 'Сильный ход';
    if (grade === 'partial') return 'Рабочий, но неполный';
    return 'Рискованный ход';
  }

  function decisionForm(decision, index) {
    return `<section class="m02c-decision">
      <p class="eyebrow">Решение ${index + 1}/2 · ${escapeHtml(decision.lessonLabel)}</p>
      <h2>${escapeHtml(decision.title.replace(/^D\d+ · /, ''))}</h2>
      <p>${escapeHtml(decision.prompt)}</p>
      <form data-m02c-form="${escapeHtml(decision.id)}">
        <fieldset><legend>Выбери первый ход</legend>
          <div class="m02c-options">${decision.options.map((option) => `<label class="m02c-option"><input type="radio" name="${escapeHtml(decision.id)}" value="${escapeHtml(option.id)}" required><span>${escapeHtml(option.label)}</span></label>`).join('')}</div>
        </fieldset>
        <button class="button primary" type="submit">Зафиксировать решение →</button>
      </form>
    </section>`;
  }

  function debrief(decision, optionId) {
    const option = optionById(decision, optionId);
    const strong = optionById(decision, decision.strongOptionId);
    if (!option || !strong) return '';
    return `<section class="m02c-debrief ${option.grade}" aria-live="polite">
      <div class="m02c-debrief-head"><span>${escapeHtml(gradeLabel(option.grade))}</span><strong>${escapeHtml(decision.lessonLabel)}</strong></div>
      <h3>Твой ход</h3><p>${escapeHtml(option.label)}</p><p>${escapeHtml(option.feedback)}</p>
      ${option.id === strong.id ? '' : `<h3>Сильный ориентир</h3><p>${escapeHtml(strong.label)}</p>`}
      <p class="m02c-principle"><strong>Принцип.</strong> ${escapeHtml(decision.principle)}</p>
    </section>`;
  }

  function lockedView() {
    return `<div class="page m02-challenge-v5"><section class="m02c-hero"><p class="eyebrow">M02 · Итоговая практика</p><h1>Сначала примени навыки в двух уроках</h1><p class="lead">Итоговая практика проверяет перенос двух навыков вместе, поэтому открывается после обязательных решений и рабочей карты в M02.1 и M02.2.</p><div class="m02c-actions"><a class="button primary" href="#/lesson/outcome-tree">M02.1 · Outcome до output</a><a class="button" href="#/lesson/assumption-map">M02.2 · Карта допущений</a></div></section></div>`;
  }

  function reviewView(state) {
    const result = proof();
    const proven = [];
    const improve = [];
    for (const decision of CHALLENGE.decisions) {
      const success = result[decision.skillId];
      const target = success ? proven : improve;
      target.push({ decision, success });
    }
    const list = (items, empty) => items.length
      ? `<ul>${items.map(({ decision }) => `<li><strong>${escapeHtml(decision.skillId === 'value' ? 'Ценность' : 'Неопределённость')}</strong><span>${escapeHtml(decision.principle)}</span></li>`).join('')}</ul>`
      : `<p>${escapeHtml(empty)}</p>`;

    return `<div class="page m02-challenge-v5">
      <header class="m02c-hero"><p class="eyebrow">M02 · Итоговая практика завершена</p><h1>Что подтверждают твои решения</h1><p class="lead">Здесь нет общего балла. Каждый навык получает уровень только по конкретным решениям и сохранённым доказательствам.</p></header>
      <div class="m02c-review-grid">
        <section><p class="eyebrow">Что доказано</p><h2>${proven.length}/2 навыка</h2>${list(proven, 'Пока ни один навык не получил уровень «Доказал». Используй разбор как тренировку и попробуй ещё раз.')}</section>
        <section><p class="eyebrow">Что усилить</p><h2>${improve.length ? 'Есть следующий шаг' : 'Оба навыка подтверждены'}</h2>${list(improve, 'Сильные решения по обоим навыкам подтверждены.')}</section>
      </div>
      <section class="m02c-path">${CHALLENGE.decisions.map((decision) => debrief(decision, state.decisions[decision.id])).join('')}</section>
      <div class="m02c-actions"><a class="button primary" href="#/">Вернуться на главную →</a><a class="button" href="#/lesson/outcome-tree">Повторить M02.1</a><a class="button" href="#/lesson/assumption-map">Повторить M02.2</a><button class="button subtle" type="button" data-m02c-reset>Пройти итоговую практику заново</button></div>
    </div>`;
  }

  function activeView(state) {
    const companyId = (() => { try { return localStorage.getItem(COMPANY_KEY) || 'medium'; } catch (_) { return 'medium'; } })();
    const first = CHALLENGE.decisions[0];
    const second = CHALLENGE.decisions[1];
    const firstDone = Boolean(state.decisions[first.id]);
    return `<div class="page m02-challenge-v5">
      <header class="m02c-hero"><p class="eyebrow">M02 · Итоговая практика</p><h1>${escapeHtml(CHALLENGE.title)}</h1><p class="lead">${escapeHtml(CHALLENGE.premise)}</p></header>
      <section class="m02c-purpose"><div><span>01</span><strong>Ценность</strong><p>Отделить убедительный результат разработки от доказанного изменения поведения.</p></div><div><span>02</span><strong>Неопределённость</strong><p>Получить нужное доказательство до дорогого обязательства.</p></div></section>
      <aside class="m02c-lens"><strong>Линза масштаба.</strong> ${escapeHtml(CONTEXT_LENS[companyId] || CONTEXT_LENS.medium)}</aside>
      ${firstDone ? debrief(first, state.decisions[first.id]) : decisionForm(first, 0)}
      ${firstDone ? (state.decisions[second.id] ? debrief(second, state.decisions[second.id]) : decisionForm(second, 1)) : ''}
    </div>`;
  }

  function render() {
    if (typeof location === 'undefined' || location.hash !== ROUTE) return false;
    const main = typeof document !== 'undefined' && document.querySelector ? document.querySelector('#main') : null;
    if (!main) return false;
    const state = getState();
    main.innerHTML = !m02Ready() ? lockedView() : isComplete() ? reviewView(state) : activeView(state);
    bind();
    main.focus?.({ preventScroll: true });
    if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
    return true;
  }

  function bind() {
    if (typeof document === 'undefined' || !document.querySelectorAll) return;
    document.querySelectorAll('[data-m02c-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const decisionId = form.dataset.m02cForm;
        const selected = form.querySelector('input:checked');
        if (!selected) return;
        commit(decisionId, selected.value);
        render();
      });
    });
    document.querySelector('[data-m02c-reset]')?.addEventListener('click', () => {
      reset();
      render();
    });
  }

  window.PM01M02ChallengeV5 = Object.freeze({
    STORAGE_KEY,
    ROUTE,
    getState,
    isComplete,
    proof,
    open,
    render,
    __test: Object.freeze({ commit, reset }),
  });

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('hashchange', () => queueMicrotask(render));
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading' && document.addEventListener) document.addEventListener('DOMContentLoaded', render, { once: true });
    else render();
  }
})();
