const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(relativePath) {
  const file = path.join(__dirname, '..', relativePath);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

const runbook = read('docs/validation/M01-COHORT-RUNBOOK.md');
const sessionTemplate = read('docs/validation/M01-SESSION-RECORD-TEMPLATE.md');
const reviewTemplate = read('docs/validation/M01-COHORT-REVIEW-TEMPLATE.md');
const protocol = read('docs/validation/M01-VALIDATION-PROTOCOL.md');
const releaseChecklist = read('docs/validation/M01-RELEASE-EVIDENCE-CHECKLIST.md');

test('M01.1 cohort pack has an executable P01-P05 runbook with uncontaminated start and explicit exit rules', () => {
  assert.ok(runbook.includes('P01') && runbook.includes('P05'), 'runbook must define P01-P05');
  assert.ok(runbook.includes('pm01-validation-m01-v1') && runbook.includes('pm01-state-v1'), 'runbook must require both storage keys to be clean');
  assert.ok(runbook.includes('PROMOTE') && runbook.includes('REVISE') && runbook.includes('REJECT'), 'runbook must define all three cohort outcomes');
});

test('M01.1 participant evidence explicitly captures alternative hypothesis, falsifier and revision condition', () => {
  for (const [name, doc] of [['session template', sessionTemplate], ['protocol', protocol], ['review template', reviewTemplate]]) {
    const lower = doc.toLowerCase();
    assert.match(lower, /(alternative|альтернатив)/, `${name} must capture an alternative hypothesis`);
    assert.match(lower, /(falsifier|опроверж)/, `${name} must capture falsifying evidence`);
    assert.match(lower, /(пересмотр|revise|revision|изменить|отменить)/, `${name} must capture a decision revision condition`);
  }
});

test('M01.1 release evidence checklist separates static verification from real-participant evidence', () => {
  assert.match(releaseChecklist, /c4f8ac2af6a66efdb79881baa58d4c091a0e6aed/, 'release checklist must pin the published Pages SHA');
  assert.match(releaseChecklist, /33b328d3ccc753cc3d0aee15da98bccd6913f92e/, 'release checklist must pin the published M01.1 asset blob');
  assert.match(releaseChecklist.toLowerCase(), /(static|статическ)/, 'release checklist must identify static checks');
  assert.match(releaseChecklist.toLowerCase(), /(participant|участник)/, 'release checklist must identify checks requiring real participants');
});
