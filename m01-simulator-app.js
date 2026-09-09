(function () {
  'use strict';

  const MISSION = window.PM01SimulatorData && window.PM01SimulatorData.mission;
  const DOMAIN = window.PM01SimulatorDomain;
  const storageKey = 'pm01-sim-m01-v1';
  const missionRoute = 'mission/m01';

  if (!MISSION || !DOMAIN) return;

  let envelope = null;
  let versionBlocked = false;
  let storageHealthy = testStorage();
  let openToolId = null;

  function now() {
    return new Date().toISOString();
  }

  function currentRoute() {
    return location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function testStorage() {
    const probe = `${storageKey}-probe`;
    try {
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return true;
    } catch (_) {
      return false;
    }
  }

  function readEnvelope() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey));
      if (!parsed) return null;
      if (parsed.treatmentId !== MISSION.id || parsed.missionVersion !== MISSION.version) {
        versionBlocked = true;
        return parsed;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function saveEnvelope(next) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      storageHealthy = true;
      envelope = next;
      return true;
    } catch (_) {
      storageHealthy = false;
      renderMission('Не удалось сохранить данные миссии. Не продолжай: evidence может быть потерян.');
      return false;
    }
  }

  function createEnvelope() {
    return {
      treatmentId: MISSION.id,
      missionVersion: MISSION.version,
      run: DOMAIN.initialRun(MISSION),
      screen: 'decision',
      drafts: {},
      startedAt: now(),
      completedAt: null,
      reviewReachedAt: null,
    };
  }

  function meterDescriptor(meter, value) {
    if (meter.id === 'risk') {
      if (value <= 30) return 'низкий';
      if (value <= 60) return 'средний';
      return 'высокий';
    }
    if (value < 40) return 'низко';
    if (value < 70) return 'средне';
    return 'высоко';
  }

  function meterGrid(meters) {
    return `<div class="sim-meters" aria-label="Состояние проекта">${MISSION.meters.map((meter) => {
      const value = meters[meter.id];
      const direction = meter.higherIsBetter ? 'выше обычно лучше' : 'ниже обычно лучше';
      return `<article class="sim-meter" aria-label="${escapeHtml(meter.label)}: ${value} из 100, ${meterDescriptor(meter, value)}; ${direction}">
        <span>${escapeHtml(meter.label)}</span>
        <strong>${value}<small>/100</small></strong>
        <div class="sim-meter-track" aria-hidden="true"><span style="width:${value}%"></span></div>
        <small>${escapeHtml(meterDescriptor(meter, value))}</small>
      </article>`;
    }).join('')}</div>`;
  }

  function toolsBlock(decisionId) {
    return `<section class="sim-tools" aria-label="Инструменты">
      <div class="sim-tools-head"><div><p class="eyebrow">По запросу</p><h3>Инструменты</h3></div><p>Открытие инструмента не штрафует состояние проекта и не подсказывает вариант решения.</p></div>
      <div class="sim-tool-buttons">${MISSION.tools.map((tool) => `<button class="button subtle" type="button" data-open-tool="${tool.id}" aria-expanded="${openToolId === tool.id ? 'true' : 'false'}">${escapeHtml(tool.title)}</button>`).join('')}</div>
      ${openToolId ? toolDrawer(openToolId, decisionId) : ''}
    </section>`;
  }

  function toolDrawer(toolId, decisionId) {
    const tool = MISSION.tools.find((item) => item.id === toolId);
    if (!tool) return '';
    return `<aside class="sim-tool-drawer" data-tool-drawer="${escapeHtml(tool.id)}" aria-label="${escapeHtml(tool.title)}">
      <div><p class="eyebrow">Checklist</p><h3>${escapeHtml(tool.title)}</h3><p>${escapeHtml(tool.purpose)}</p></div>
      <ul>${tool.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      <button type="button" class="button subtle" data-close-tool data-decision="${escapeHtml(decisionId)}">Закрыть</button>
    </aside>`;
  }

  function decisionSituation(decision, run) {
    const conditional = decision.contextualSituation;
    if (!conditional) return decision.situation;
    return run.flags[conditional.flag] ? conditional.whenTrue : conditional.whenFalse;
  }

  function decisionView() {
    const run = envelope.run;
    const decision = MISSION.decisions[run.decisionIndex];
    if (!decision) return reviewView();
    const draft = envelope.drafts[decision.id] || '';
    return `<div class="page sim-shell">
      <header class="sim-header">
        <div><p class="eyebrow">M01 · Mission · решение ${run.decisionIndex + 1}/${MISSION.decisions.length}</p><h1 id="sim-focus-target" tabindex="-1">${escapeHtml(decision.title)}</h1></div>
        <span class="sim-progress">${run.decisionIndex + 1} / ${MISSION.decisions.length}</span>
      </header>
      ${meterGrid(run.meters)}
      <section class="sim-situation"><p class="eyebrow">Ситуация</p><p>${escapeHtml(decisionSituation(decision, run))}</p></section>
      ${toolsBlock(decision.id)}
      <section class="sim-decision-card">
        <form id="sim-decision-form">
          <fieldset>
            <legend>${escapeHtml(decision.prompt)}</legend>
            <div class="sim-options">${decision.options.map((option) => `<label class="sim-option"><input type="radio" name="sim-choice" value="${escapeHtml(option.id)}"><span>${escapeHtml(option.label)}</span></label>`).join('')}</div>
          </fieldset>
          ${decision.requiredRationale ? `<label class="sim-rationale" for="sim-rationale"><strong>${escapeHtml(decision.rationalePrompt)}</strong><textarea id="sim-rationale" rows="3" data-rationale="${decision.id}">${escapeHtml(draft)}</textarea></label>` : ''}
          <div class="sim-actions"><button class="button primary" type="submit">Зафиксировать решение</button><a class="button subtle" href="#/validation/m01">Вернуться к validation</a></div>
        </form>
      </section>
      <div id="sim-message" class="sim-message" role="status" aria-live="polite"></div>
    </div>`;
  }

  function consequenceView() {
    const run = envelope.run;
    const record = run.decisions[run.decisions.length - 1];
    const decision = MISSION.decisions.find((item) => item.id === record.decisionId);
    const option = decision.options.find((item) => item.id === record.optionId);
    const rows = MISSION.meters.map((meter) => {
      const before = record.stateBefore[meter.id];
      const after = record.stateAfter[meter.id];
      const change = record.delta[meter.id];
      const sign = change > 0 ? `+${change}` : String(change);
      return `<li><span>${escapeHtml(meter.label)}</span><strong>${before} → ${after} (${sign})</strong></li>`;
    }).join('');
    return `<div class="page sim-shell">
      <header class="sim-header"><div><p class="eyebrow">Последствие · ${escapeHtml(decision.id.toUpperCase())}</p><h1 id="sim-focus-target" tabindex="-1">Решение изменило проект</h1></div></header>
      ${meterGrid(run.meters)}
      <section class="sim-consequence" aria-live="polite">
        <h2>${escapeHtml(option.label)}</h2>
        <p>${escapeHtml(option.consequence)}</p>
        <ul class="sim-deltas">${rows}</ul>
      </section>
      <div class="sim-actions"><button class="button primary" type="button" id="sim-continue">${DOMAIN.isComplete(run, MISSION) ? 'Перейти к разбору траектории' : 'Продолжить →'}</button></div>
      <div id="sim-message" class="sim-message" role="status" aria-live="polite"></div>
    </div>`;
  }

  function reviewView() {
    const path = DOMAIN.trajectory(envelope.run, MISSION);
    const decisionRows = path.decisions.map((record, index) => {
      const decision = MISSION.decisions.find((item) => item.id === record.decisionId);
      const option = decision.options.find((item) => item.id === record.optionId);
      return `<li><span>D${index + 1}</span><div><strong>${escapeHtml(option.label)}</strong>${record.rationale ? `<p>${escapeHtml(record.rationale)}</p>` : ''}</div></li>`;
    }).join('');
    const toolNames = [...new Set(path.toolsOpened.map((event) => event.toolId))].map((toolId) => MISSION.tools.find((tool) => tool.id === toolId)?.title || toolId);
    return `<div class="page sim-shell sim-review">
      <header class="sim-header"><div><p class="eyebrow">Траектория завершена</p><h1 id="sim-focus-target" tabindex="-1">${escapeHtml(MISSION.finalReview.title)}</h1><p class="lead">Посмотри на свои решения и изменение состояния. Здесь нет оценки или эталонного пути до post-case.</p></div></header>
      ${meterGrid(path.finalMeters)}
      <section class="sim-review-grid">
        <div><h2>Твои решения</h2><ol class="sim-path">${decisionRows}</ol></div>
        <aside><h2>Что использовал</h2><p>${toolNames.length ? escapeHtml(toolNames.join(', ')) : 'Инструменты не открывались.'}</p><p><strong>Диагноз пересмотрен:</strong> ${path.diagnosisRevised ? 'да' : 'нет'}</p></aside>
      </section>
      <section class="sim-reflection"><h2>Перед post-case</h2><ul>${MISSION.finalReview.prompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join('')}</ul></section>
      <div class="sim-actions"><a class="button primary" href="#/validation/m01">Вернуться к post-case →</a></div>
      <div id="sim-message" class="sim-message" role="status" aria-live="polite"></div>
    </div>`;
  }

  function briefingView() {
    return `<div class="page sim-shell">
      <header class="sim-briefing"><p class="eyebrow">M01 · Playable mission</p><h1 id="sim-focus-target" tabindex="-1">${escapeHtml(MISSION.title)}</h1><p class="lead">${escapeHtml(MISSION.premise)}</p></header>
      ${meterGrid(MISSION.initialState)}
      <section class="sim-briefing-card"><h2>Твоя роль</h2><p>Ты — lead проекта. Последствия решений сохраняются. Задача — не максимизировать один показатель, а управлять неопределённостью, trade-offs и новым evidence.</p><p>Инструменты доступны в каждом решении и не влияют на показатели сами по себе.</p></section>
      <div class="sim-actions"><button class="button primary" type="button" id="sim-start">Начать миссию →</button><a class="button subtle" href="#/validation/m01">Назад</a></div>
      <div id="sim-message" class="sim-message" role="status" aria-live="polite"></div>
    </div>`;
  }

  function blockedView() {
    return `<div class="page sim-shell"><section class="sim-blocked" role="alert"><p class="eyebrow">Версия evidence не совпадает</p><h1 id="sim-focus-target" tabindex="-1">Эту миссию нельзя продолжить автоматически</h1><p>В браузере сохранён run другой версии. Для cohort нельзя молча мигрировать незавершённую траекторию. Используй новый чистый browser context или перезапусти сессию по facilitator protocol.</p><a class="button subtle" href="#/validation/m01">Вернуться к validation</a></section></div>`;
  }

  function renderMission(message) {
    if (currentRoute() !== missionRoute) return;
    const main = document.querySelector('#main');
    if (!main) return;
    if (versionBlocked) main.innerHTML = blockedView();
    else if (!envelope) main.innerHTML = briefingView();
    else if (envelope.screen === 'consequence') main.innerHTML = consequenceView();
    else if (DOMAIN.isComplete(envelope.run, MISSION)) {
      if (!envelope.reviewReachedAt) {
        const next = { ...envelope, screen: 'review', reviewReachedAt: now(), completedAt: now() };
        if (!saveEnvelope(next)) return;
      }
      main.innerHTML = reviewView();
    } else main.innerHTML = decisionView();

    bindEvents();
    const messageTarget = document.querySelector('#sim-message');
    if (message && messageTarget) messageTarget.textContent = message;
    document.querySelector('#sim-focus-target')?.focus();
    document.querySelectorAll('.main-nav a').forEach((link) => link.classList.toggle('active', link.dataset.route === 'course'));
    window.scrollTo(0, 0);
  }

  function bindEvents() {
    document.querySelector('#sim-start')?.addEventListener('click', () => {
      if (!storageHealthy) {
        renderMission('LocalStorage недоступен. Миссию нельзя начать без надёжного сохранения evidence.');
        return;
      }
      saveEnvelope(createEnvelope());
      renderMission();
    });

    document.querySelectorAll('[data-open-tool]').forEach((button) => button.addEventListener('click', () => {
      const toolId = button.dataset.openTool;
      const decision = envelope && MISSION.decisions[envelope.run.decisionIndex];
      if (!decision) return;
      if (openToolId === toolId) {
        openToolId = null;
        renderMission();
        return;
      }
      const nextRun = DOMAIN.openTool(envelope.run, toolId, decision.id);
      const next = { ...envelope, run: nextRun };
      if (!saveEnvelope(next)) return;
      openToolId = toolId;
      renderMission();
    }));

    document.querySelector('[data-close-tool]')?.addEventListener('click', () => {
      openToolId = null;
      renderMission();
    });

    document.querySelector('[data-rationale]')?.addEventListener('input', (event) => {
      if (!envelope) return;
      const next = { ...envelope, drafts: { ...envelope.drafts, [event.target.dataset.rationale]: event.target.value } };
      saveEnvelope(next);
    });

    document.querySelector('#sim-decision-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const decision = MISSION.decisions[envelope.run.decisionIndex];
      const selected = document.querySelector('input[name="sim-choice"]:checked');
      const rationale = document.querySelector('[data-rationale]')?.value || '';
      if (!selected) {
        renderMission('Выбери один вариант перед фиксацией решения.');
        return;
      }
      try {
        const nextRun = DOMAIN.commitDecision(envelope.run, MISSION, decision.id, selected.value, rationale);
        const next = { ...envelope, run: nextRun, screen: 'consequence', drafts: { ...envelope.drafts, [decision.id]: rationale } };
        if (!saveEnvelope(next)) return;
        openToolId = null;
        renderMission();
      } catch (error) {
        renderMission(error.message);
      }
    });

    document.querySelector('#sim-continue')?.addEventListener('click', () => {
      const next = { ...envelope, screen: DOMAIN.isComplete(envelope.run, MISSION) ? 'review' : 'decision' };
      if (!saveEnvelope(next)) return;
      renderMission();
    });
  }

  function renderExtension() {
    if (currentRoute() !== missionRoute) return;
    versionBlocked = false;
    envelope = readEnvelope();
    renderMission();
  }

  window.addEventListener('hashchange', () => queueMicrotask(renderExtension));
  renderExtension();
})();
