const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const runbook = () => read('docs/validation/M01-COHORT-RUNBOOK.md');
const protocol = () => read('docs/validation/M01-VALIDATION-PROTOCOL.md');
const session = () => read('docs/validation/M01-SESSION-RECORD-TEMPLATE.md');
const review = () => read('docs/validation/M01-COHORT-REVIEW-TEMPLATE.md');

test('cohort runbook pins the playable simulator production treatment and all clean-start keys', () => {
  const doc = runbook();
  assert.match(doc, /https:\/\/tim8es\.github\.io\/pmo01\/#\/validation\/m01/);
  assert.match(doc, /https:\/\/tim8es\.github\.io\/pmo01\/#\/mission\/m01/);
  assert.match(doc, /m01-mission-partner-launch-v1/);
  assert.match(doc, /Mission version:\s*`1`/);
  assert.match(doc, /pm01-validation-m01-v1/);
  assert.match(doc, /pm01-state-v1/);
  assert.match(doc, /pm01-sim-m01-v1/);
});

test('operator sequence is baseline to simulator to post-case to transfer to interview', () => {
  const doc = runbook();
  const baseline = doc.indexOf('### 1. Blind baseline');
  const simulator = doc.indexOf('### 2. M01 simulator');
  const post = doc.indexOf('### 3. Integrative post-case');
  const transfer = doc.indexOf('### 4. Real-project transfer');
  const interview = doc.indexOf('### 5. Reflection + short interview');
  assert.ok(baseline >= 0 && simulator > baseline && post > simulator && transfer > post && interview > transfer);
});

test('cohort docs use D1-D4 simulator evidence rather than legacy two-lesson treatment', () => {
  for (const doc of [runbook(), protocol(), session(), review()]) {
    assert.match(doc, /D1/i);
    assert.match(doc, /D4/i);
    assert.doesNotMatch(doc, /m01-drill-system|m01-drill-diagnostic/);
  }
});

test('cohort decision contract defines PROMOTE REVISE REJECT and five valid sessions', () => {
  for (const doc of [runbook(), protocol(), review()]) {
    assert.match(doc, /PROMOTE/);
    assert.match(doc, /REVISE/);
    assert.match(doc, /REJECT/);
    assert.match(doc, /5 valid|five valid|>=5 valid/i);
  }
  assert.match(runbook(), />=3\/5|at least \*\*3\/5\*\*/i);
});
