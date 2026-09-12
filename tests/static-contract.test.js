const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name) {
  const file = path.join(__dirname, '..', name);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

const html = read('index.html');
const baseApp = read('app.js');
const validationApp = read('m01-validation-app.js');
const validationStyles = read('m01-validation.css');
const labData = read('m01-learning-lab-data.js');
const artDirection = read('art-direction.css');

test('index loads validation styles and data, domain, base app, then validation extension in order', () => {
  assert.notEqual(html.indexOf('href="m01-validation.css"'), -1, 'missing isolated validation stylesheet');

  const scripts = ['course-data.js', 'm01-validation-data.js', 'learning-domain.js', 'app.js', 'm01-validation-app.js'];
  let lastIndex = -1;
  for (const script of scripts) {
    const index = html.indexOf(`src="${script}"`);
    assert.notEqual(index, -1, `missing ${script}`);
    assert.equal(index > lastIndex, true, `${script} must load after previous script`);
    lastIndex = index;
  }
});

test('base router reserves the M01 validation route instead of rendering not-found before the extension', () => {
  assert.equal(baseApp.includes('route: "validation-m01"'), true, 'base router must recognize validation/m01');
  assert.equal(baseApp.includes('if (route === "validation-m01")'), true, 'base renderer must yield validation/m01 to the extension');
});

test('validation extension owns the M01 validation route and course CTA', () => {
  assert.equal(validationApp.includes("validation/m01"), true, 'missing validation route');
  assert.equal(validationApp.includes('data-validation-cta'), true, 'missing M01 validation CTA contract');
});

test('validation uses an isolated storage key so legacy app saves cannot erase experiment work', () => {
  assert.equal(validationApp.includes('pm01-validation-m01-v1'), true, 'missing isolated validation storage key');
});

test('validation UI uses semantic assessment controls and live result feedback', () => {
  assert.equal(validationApp.includes('<fieldset'), true, 'assessments must use fieldsets');
  assert.equal(validationApp.includes('<legend'), true, 'assessment fieldsets need legends');
  assert.equal(validationApp.includes('aria-live="polite"'), true, 'results need a polite live region');
  assert.equal(validationApp.includes('for="'), true, 'textarea inputs need explicit labels');
});

test('validation styles are isolated under validation-specific classes', () => {
  assert.equal(validationStyles.includes('.validation-shell'), true);
  assert.equal(validationStyles.includes('.validation-score'), true);
  assert.equal(validationStyles.includes('.validation-evidence'), true);
});

test('M01 learning lab data loads after validation data and before the base app', () => {
  const validationIndex = html.indexOf('src="m01-validation-data.js"');
  const labIndex = html.indexOf('src="m01-learning-lab-data.js"');
  const appIndex = html.indexOf('src="app.js"');
  assert.notEqual(labIndex, -1, 'missing m01-learning-lab-data.js');
  assert.equal(labIndex > validationIndex, true, 'lab data must load after validation data');
  assert.equal(labIndex < appIndex, true, 'lab data must load before app.js');
});

test('M01 learning lab data targets the two M01 lessons and keeps stable cold drill ids', () => {
  assert.equal(labData.includes('project-system'), true, 'project-system lab contract missing');
  assert.equal(labData.includes('system-diagnostic'), true, 'system-diagnostic lab contract missing');
  assert.equal(labData.includes('m01-drill-system'), true, 'project-system cold drill id must stay stable');
  assert.equal(labData.includes('m01-drill-diagnostic'), true, 'system-diagnostic cold drill id must stay stable');
  assert.equal(labData.includes('workbookFields'), true, 'lab workbook field contract missing');
  assert.equal(labData.includes('transferPrompt'), true, 'lab transfer contract missing');
});

test('Editorial Instrument exposes readable learner text tokens and dedicated learning-lab styles', () => {
  assert.equal(artDirection.includes('--text-secondary:'), true, 'readable secondary text token missing');
  assert.equal(artDirection.includes('--text-tertiary:'), true, 'readable tertiary text token missing');
  assert.equal(artDirection.includes('.learning-lab'), true, 'learning-lab visual contract missing');
  assert.equal(artDirection.includes('.lab-feedback'), true, 'lab feedback visual contract missing');
  assert.equal(artDirection.includes('.lab-workbook'), true, 'lab workbook visual contract missing');
  assert.equal(artDirection.includes(':focus-visible'), true, 'visible keyboard focus contract missing');
});
