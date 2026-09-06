const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const domainPath = path.join(__dirname, '..', 'learning-domain.js');
const domainExists = fs.existsSync(domainPath);

let domain = null;
if (domainExists) domain = require(domainPath);

test('learning domain module exists', () => {
  assert.equal(domainExists, true, 'learning-domain.js must exist');
});

test('scoreAssessment totals selected rubric scores by dimension', { skip: !domainExists }, () => {
  const questions = [
    { id: 'q1', dimension: 'mechanism', options: [{ id: 'weak', score: 0 }, { id: 'strong', score: 3 }] },
    { id: 'q2', dimension: 'evidence', options: [{ id: 'partial', score: 2 }] },
    { id: 'q3', dimension: 'mechanism', options: [{ id: 'basic', score: 1 }] },
  ];
  const result = domain.scoreAssessment(questions, { q1: 'strong', q2: 'partial', q3: 'basic' });

  assert.deepEqual(result, {
    total: 6,
    max: 9,
    byDimension: { mechanism: 4, evidence: 2 },
    answered: 3,
  });
});

test('scoreAssessment gives no invented credit for unanswered questions', { skip: !domainExists }, () => {
  const questions = [
    { id: 'q1', dimension: 'mechanism', options: [{ id: 'strong', score: 3 }] },
    { id: 'q2', dimension: 'evidence', options: [{ id: 'strong', score: 3 }] },
  ];
  const result = domain.scoreAssessment(questions, { q1: 'strong' });

  assert.equal(result.total, 3);
  assert.equal(result.max, 6);
  assert.equal(result.answered, 1);
  assert.deepEqual(result.byDimension, { mechanism: 3, evidence: 0 });
});

test('promotionDecision promotes only when delta and dimension gates both pass', { skip: !domainExists }, () => {
  const baseline = { total: 5, byDimension: { mechanism: 1, evidence: 1, tradeoffs: 1, intervention: 1, changeCondition: 1 } };
  const post = { total: 9, byDimension: { mechanism: 3, evidence: 2, tradeoffs: 1, intervention: 2, changeCondition: 1 } };
  const result = domain.promotionDecision(baseline, post);

  assert.equal(result.promoted, true);
  assert.equal(result.delta, 4);
  assert.deepEqual(result.improvedDimensions.sort(), ['evidence', 'intervention', 'mechanism']);
});

test('promotionDecision rejects a large delta concentrated in one dimension', { skip: !domainExists }, () => {
  const baseline = { total: 2, byDimension: { mechanism: 0, evidence: 2 } };
  const post = { total: 5, byDimension: { mechanism: 3, evidence: 2 } };
  const result = domain.promotionDecision(baseline, post);

  assert.equal(result.delta, 3);
  assert.equal(result.promoted, false);
  assert.deepEqual(result.improvedDimensions, ['mechanism']);
});

test('deriveLearningState never assigns mastered from study or immediate application alone', { skip: !domainExists }, () => {
  assert.equal(domain.deriveLearningState({}), 'unseen');
  assert.equal(domain.deriveLearningState({ studied: true }), 'studied');
  assert.equal(domain.deriveLearningState({ studied: true, fieldApplied: true }), 'applied');
  assert.equal(domain.deriveLearningState({ studied: true, fieldApplied: true, transferEvidence: true }), 'mastered');
});
