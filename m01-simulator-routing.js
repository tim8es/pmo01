(function () {
  'use strict';

  const missionHref = 'simulator.html#/mission/m01';

  function currentRoute() {
    return location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  }

  function rewriteValidationLearningStep() {
    if (currentRoute() !== 'validation/m01') return;
    const links = [...document.querySelectorAll('a[href="#/lesson/project-system"], a[href="#/lesson/system-diagnostic"]')];
    if (!links.length) return;

    const primary = links[0];
    primary.setAttribute('href', missionHref);
    primary.textContent = 'Открыть итоговый кейс · 7–10 минут →';
    primary.dataset.m01MissionEntry = 'true';
    links.slice(1).forEach((link) => { link.hidden = true; });

    const step = primary.closest('.validation-step');
    const heading = step && step.querySelector('h2');
    const description = step && step.querySelector('header p:last-child');
    const state = step && step.querySelector('.validation-state');
    if (heading) heading.textContent = 'Пройди итоговый кейс M01';
    if (description) description.textContent = '7–10 минут, четыре решения и последствия для сроков, доверия, ресурсов и рисков. После финального разбора вернись сюда для контрольной проверки.';
    if (state) {
      const complete = Boolean(window.PM01SimulatorGate && window.PM01SimulatorGate.isComplete());
      state.textContent = `Итоговый кейс: ${complete ? 'пройден ✓' : 'нужно пройти до финального разбора'}`;
    }
  }

  function wire() {
    rewriteValidationLearningStep();
  }

  window.addEventListener('hashchange', () => queueMicrotask(wire));
  window.addEventListener('DOMContentLoaded', () => queueMicrotask(wire));
  queueMicrotask(wire);
})();