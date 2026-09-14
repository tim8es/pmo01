(function () {
  'use strict';

  const COMPANY_KEY = 'pm01-company-context-v1';
  const FINAL_CASE_LABEL = 'Итоговый кейс M01';

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
    if (!practice || practice.querySelector('[data-reference-solution]')) return;

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

  function migrateOldFinalCaseBadge() {
    const legacy = document.querySelector('.lx-module-mission');
    if (!legacy || legacy.dataset.courseJourneyV4 === '1') return;
    legacy.innerHTML = `<strong>${FINAL_CASE_LABEL}</strong><span>Финальная практика M01: применить навыки обоих уроков в одном кейсе.</span>`;
    legacy.dataset.courseJourneyV4 = '1';
  }

  function render() {
    renderReferenceSolution();
    migrateOldFinalCaseBadge();
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
      if (event.key === COMPANY_KEY) requestAnimationFrame(render);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();