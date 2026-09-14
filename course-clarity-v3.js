(function () {
  'use strict';

  const COURSE_KEY = 'pm01-state-v1';
  const SIM_KEY = 'pm01-sim-m01-v1';
  const COMPANY_KEY = 'pm01-company-context-v1';

  const COMPANY_REFERENCE = {
    small: {
      label: 'Малый бизнес',
      note: 'Проверь, можно ли выполнить решение без отдельного процесса и не создаёт ли оно зависимость от единственного эксперта. В малом бизнесе сильное решение обычно проще по механике, но жёстче по приоритету.'
    },
    medium: {
      label: 'Средний бизнес',
      note: 'Добавь owner, handoff и точку принятия решения между функциями. В среднем бизнесе хорошая идея часто ломается не внутри команды, а на переходе ответственности.'
    },
    large: {
      label: 'Крупный бизнес',
      note: 'Добавь governance: approvals, compliance, change window и стоимость отката. То, что технически обратимо, в крупной компании может стать дорогим после формального commitment.'
    }
  };

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function currentCompany() {
    try {
      const value = localStorage.getItem(COMPANY_KEY);
      return COMPANY_REFERENCE[value] ? value : 'medium';
    } catch (_) { return 'medium'; }
  }

  function currentLesson() {
    const match = (location.hash || '').match(/^#\/lesson\/([^/?#]+)/);
    if (!match || !window.PM01?.modules) return null;
    const id = decodeURIComponent(match[1]);
    return window.PM01.modules.flatMap((module) => module.lessons || []).find((lesson) => lesson.id === id) || null;
  }

  function renderReferenceSolution() {
    const lesson = currentLesson();
    const reference = lesson?.referenceSolution;
    if (!reference || lesson.learningLab) return;

    const practice = document.querySelector('#main .practice');
    if (!practice) return;
    if (practice.querySelector('[data-reference-solution]')) return;

    const company = COMPANY_REFERENCE[currentCompany()];
    const details = document.createElement('details');
    details.className = 'practice-reference';
    details.dataset.referenceSolution = lesson.id;
    details.innerHTML = `
      <summary>Эталонный вариант решения</summary>
      <div class="practice-reference-body">
        <p class="practice-reference-intro"><strong>Сначала попробуй сам.</strong> Затем открой пример и сравни логику, порядок действий и evidence — формулировки копировать не нужно.</p>
        <h4>${escapeHtml(reference.title)}</h4>
        <ol>${reference.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
        <p class="practice-reference-check"><strong>Проверка качества.</strong> ${escapeHtml(reference.check)}</p>
        <p class="practice-reference-scale"><strong>${escapeHtml(company.label)}.</strong> ${escapeHtml(company.note)}</p>
      </div>`;

    const context = practice.querySelector('.lx-legacy-context');
    if (context) context.appendChild(details);
    else practice.appendChild(details);
  }

  function learningStatus() {
    const course = readJson(COURSE_KEY) || {};
    const sim = readJson(SIM_KEY) || {};
    const m01 = window.PM01?.modules?.find((module) => module.id === 'm01');
    const completed = new Set(Array.isArray(course.completed) ? course.completed : []);
    const moduleComplete = Boolean(m01?.lessons?.length) && m01.lessons.every((lesson) => completed.has(lesson.id));
    const simulationComplete = Boolean(
      sim?.completedAt ||
      sim?.reviewReachedAt ||
      sim?.run?.completedAt ||
      (Array.isArray(sim?.run?.decisions) && sim.run.decisions.length >= 4)
    );
    return { moduleComplete, simulationComplete };
  }

  function simulationHeading(moduleComplete, simulationComplete) {
    if (simulationComplete && moduleComplete) return 'Симуляция пройдена · модуль завершён';
    if (simulationComplete) return 'Симуляция пройдена · модуль ещё не завершён';
    if (moduleComplete) return 'Модуль завершён · симуляцию можно пройти отдельно';
    return 'Практика решений перед запуском';
  }

  function clarifyDashboardSimulation() {
    if (!window.PM01?.modules) return;
    const card = document.querySelector('.lx-mission-card');
    if (!card) return;

    const { moduleComplete, simulationComplete } = learningStatus();
    const signature = `${moduleComplete}:${simulationComplete}`;
    if (card.dataset.simulationClarity === signature) return;

    const eyebrow = card.querySelector('.eyebrow');
    const title = card.querySelector('h2');
    const copy = card.querySelector('p:not(.eyebrow)');
    const link = card.querySelector('a');

    if (eyebrow) eyebrow.textContent = 'Практическая симуляция · M01';
    if (title) title.textContent = simulationHeading(moduleComplete, simulationComplete);
    if (copy) copy.textContent = 'Симуляция — отдельный практический тренажёр из четырёх управленческих решений. Её прохождение фиксирует тренировку, но не завершает уроки и модуль автоматически.';
    if (link) link.textContent = `${simulationComplete ? 'Повторить симуляцию' : 'Открыть симуляцию'} →`;
    card.dataset.simulationClarity = signature;
  }

  function clarifyLearningPathSimulation() {
    const badge = document.querySelector('.lx-module-mission');
    if (!badge || badge.dataset.simulationClarity === 'v3') return;
    badge.innerHTML = '<strong>Практическая симуляция M01</strong><span>Отдельный тренажёр: 4 решения и последствия. Прохождение симуляции не завершает уроки модуля.</span>';
    badge.dataset.simulationClarity = 'v3';
  }

  function clarifyMasteryEvidence() {
    document.querySelectorAll('.lx-mastery-card small, .lx-skill-row small, .lx-skill small').forEach((node) => {
      if ((node.textContent || '').trim() === 'Проверено в миссии') node.textContent = 'Проверено в симуляции';
    });
  }

  function renameSimulationNavigation() {
    document.querySelectorAll('a[href*="simulator.html#/mission/m01"]').forEach((link) => {
      link.setAttribute('aria-label', 'Практическая симуляция M01');
      const textNodes = [...link.childNodes].filter((node) => node.nodeType === 3);
      if (textNodes.length) textNodes[textNodes.length - 1].textContent = 'Симуляция M01';
      else if (!link.querySelector('span')) link.textContent = 'Симуляция M01';
    });
  }

  function render() {
    renameSimulationNavigation();
    renderReferenceSolution();
    clarifyDashboardSimulation();
    clarifyLearningPathSimulation();
    clarifyMasteryEvidence();
  }

  function start() {
    render();
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        render();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', () => requestAnimationFrame(render));
    window.addEventListener('storage', (event) => {
      if ([COURSE_KEY, SIM_KEY, COMPANY_KEY].includes(event.key)) requestAnimationFrame(render);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();