(function () {
  'use strict';

  const missionHref = '#/mission/m01';

  function currentRoute() {
    return location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  }

  function rewriteCourseEntries() {
    const route = currentRoute();
    if (!['home', 'course', ''].includes(route)) return;
    document.querySelectorAll('a[href="#/lesson/project-system"], a[href="#/lesson/system-diagnostic"]').forEach((link) => {
      link.setAttribute('href', missionHref);
      link.textContent = 'Открыть симулятор · 7–10 минут →';
      link.dataset.m01MissionEntry = 'true';
    });
  }

  function rewriteValidationLearningStep() {
    if (currentRoute() !== 'validation/m01') return;
    const links = [...document.querySelectorAll('a[href="#/lesson/project-system"], a[href="#/lesson/system-diagnostic"]')];
    if (!links.length) return;

    const primary = links[0];
    primary.setAttribute('href', missionHref);
    primary.textContent = 'Открыть симулятор · 7–10 минут →';
    primary.dataset.m01MissionEntry = 'true';
    links.slice(1).forEach((link) => { link.hidden = true; });

    const step = primary.closest('.validation-step');
    const heading = step && step.querySelector('h2');
    const description = step && step.querySelector('header p:last-child');
    const state = step && step.querySelector('.validation-state');
    if (heading) heading.textContent = 'Пройди интерактивный симулятор M01';
    if (description) description.textContent = '7–10 минут, четыре решения и последствия для сроков, доверия, ресурсов и рисков. Вернись сюда после финального разбора — тогда откроется post-case.';
    if (state) {
      const complete = Boolean(window.PM01SimulatorGate && window.PM01SimulatorGate.isComplete());
      state.textContent = `Миссия: ${complete ? 'завершена ✓' : 'нужно пройти до финального разбора'}`;
    }
  }

  function wire() {
    rewriteCourseEntries();
    rewriteValidationLearningStep();
  }

  window.addEventListener('hashchange', () => queueMicrotask(wire));
  window.addEventListener('DOMContentLoaded', () => queueMicrotask(wire));
  queueMicrotask(wire);
})();
