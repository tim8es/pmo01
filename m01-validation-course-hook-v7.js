(function () {
  'use strict';

  function exposeValidationAnchor() {
    const moduleList = document.querySelector('.v7-module-list');
    if (moduleList) moduleList.classList.add('module-list');
  }

  window.addEventListener('hashchange', exposeValidationAnchor);
  exposeValidationAnchor();

  window.PM01ValidationCourseHookV7 = Object.freeze({ exposeValidationAnchor });
})();
