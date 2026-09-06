(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PM01Learning = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function assertScore(score) {
    if (!Number.isInteger(score) || score < 0 || score > 3) {
      throw new RangeError(`Rubric score must be an integer from 0 to 3; received ${score}`);
    }
  }

  function scoreAssessment(questions, answers) {
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const safeAnswers = answers && typeof answers === 'object' ? answers : {};
    const byDimension = {};
    let total = 0;
    let answered = 0;

    safeQuestions.forEach((question) => {
      const dimension = question.dimension;
      if (!dimension) throw new Error(`Question ${question.id || '<unknown>'} is missing a rubric dimension`);
      if (!Object.prototype.hasOwnProperty.call(byDimension, dimension)) byDimension[dimension] = 0;

      const options = Array.isArray(question.options) ? question.options : [];
      options.forEach((option) => assertScore(option.score));

      const selectedId = safeAnswers[question.id];
      if (selectedId == null) return;
      const selected = options.find((option) => option.id === selectedId);
      if (!selected) throw new Error(`Unknown option ${selectedId} for question ${question.id}`);

      byDimension[dimension] += selected.score;
      total += selected.score;
      answered += 1;
    });

    return {
      total,
      max: safeQuestions.length * 3,
      byDimension,
      answered,
    };
  }

  function promotionDecision(baseline, post, options) {
    const config = {
      minDelta: 3,
      minDimensionsImproved: 2,
      ...(options || {}),
    };
    const baselineTotal = Number(baseline && baseline.total) || 0;
    const postTotal = Number(post && post.total) || 0;
    const before = (baseline && baseline.byDimension) || {};
    const after = (post && post.byDimension) || {};
    const dimensions = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    const improvedDimensions = dimensions.filter((dimension) => (Number(after[dimension]) || 0) > (Number(before[dimension]) || 0));
    const delta = postTotal - baselineTotal;

    return {
      promoted: delta >= config.minDelta && improvedDimensions.length >= config.minDimensionsImproved,
      delta,
      improvedDimensions,
    };
  }

  function deriveLearningState(evidence) {
    const safeEvidence = evidence || {};
    if (safeEvidence.studied && safeEvidence.fieldApplied && safeEvidence.transferEvidence) return 'mastered';
    if (safeEvidence.fieldApplied) return 'applied';
    if (safeEvidence.studied) return 'studied';
    return 'unseen';
  }

  return {
    scoreAssessment,
    promotionDecision,
    deriveLearningState,
  };
});
