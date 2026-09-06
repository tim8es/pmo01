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
