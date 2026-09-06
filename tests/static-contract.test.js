const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name) {
  const file = path.join(__dirname, '..', name);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

const html = read('index.html');
const validationApp = read('m01-validation-app.js');
const styles = read('styles.css');

test('index loads validation data, domain, base app, then validation extension in order', () => {
  const scripts = ['course-data.js', 'm01-validation-data.js', 'learning-domain.js', 'app.js', 'm01-validation-app.js'];
  let lastIndex = -1;
  for (const script of scripts) {
    const index = html.indexOf(`src="${script}"`);
    assert.notEqual(index, -1, `missing ${script}`);
    assert.equal(index > lastIndex, true, `${script} must load after previous script`);
    lastIndex = index;
  }
});

test('validation extension owns the M01 validation route and course CTA', () => {
  assert.equal(validationApp.includes("validation/m01"), true, 'missing validation route');
  assert.equal(validationApp.includes('data-validation-cta'), true, 'missing M01 validation CTA contract');
});

test('validation UI uses semantic assessment controls and live result feedback', () => {
  assert.equal(validationApp.includes('<fieldset'), true, 'assessments must use fieldsets');
  assert.equal(validationApp.includes('<legend'), true, 'assessment fieldsets need legends');
  assert.equal(validationApp.includes('aria-live="polite"'), true, 'results need a polite live region');
  assert.equal(validationApp.includes('for="'), true, 'textarea inputs need explicit labels');
});

test('validation styles are isolated under validation-specific classes', () => {
  assert.equal(styles.includes('.validation-shell'), true);
  assert.equal(styles.includes('.validation-score'), true);
  assert.equal(styles.includes('.validation-evidence'), true);
});
