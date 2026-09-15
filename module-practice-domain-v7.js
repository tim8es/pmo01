(function () {
  'use strict';

  const course = window.PM01;
  const SKILL_MAP = window.PM01LearningLabsV7?.LESSON_SKILL || {};

  function lessonStrongOption(drill) {
    if (!drill?.options?.length) return null;
    const sorted = [...drill.options].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
    return sorted[0]?.id || null;
  }

  function definition(moduleId) {
    if (!course?.modules || moduleId === 'm01') return null;
    const module = course.modules.find((item) => item.id === moduleId);
    if (!module) return null;
    const decisions = (module.lessons || []).slice(0, 2).map((lesson) => {
      const drill = lesson.learningLab?.drills?.find((item) => item.stage === 'cold') || lesson.learningLab?.drills?.[0];
      if (!drill) return null;
      const skillId = lesson.learningLab?.skillId || SKILL_MAP[lesson.id] || 'feedback';
      const strongOptionId = lessonStrongOption(drill);
      return {
        id: `${lesson.id}-proof`,
        lessonId: lesson.id,
        skillId,
        title: lesson.title,
        situation: drill.situation || '',
        prompt: drill.prompt || 'Что сделаешь?',
        options: (drill.options || []).map((option) => ({
          id: option.id,
          label: option.label,
          feedback: option.feedback || '',
          strong: option.id === strongOptionId,
        })),
      };
    }).filter(Boolean);

    return {
      id: module.id,
      title: `Итоговая практика ${module.id.toUpperCase()}`,
      moduleTitle: module.title,
      lead: module.outcome,
      decisions,
    };
  }

  function proofFor(definitionValue, decisions) {
    const proof = {};
    for (const decision of definitionValue?.decisions || []) {
      const selected = decision.options.find((option) => option.id === decisions?.[decision.id]);
      if (selected?.strong) proof[decision.skillId] = true;
    }
    return proof;
  }

  function mergeProof(previousStateOrProof, currentProof) {
    const previousProof = previousStateOrProof?.proof && typeof previousStateOrProof.proof === 'object'
      ? previousStateOrProof.proof
      : (previousStateOrProof || {});
    const merged = { ...previousProof };
    for (const [skillId, value] of Object.entries(currentProof || {})) {
      merged[skillId] = Boolean(merged[skillId] || value);
    }
    return merged;
  }

  function isComplete(definitionValue, state) {
    const ids = (definitionValue?.decisions || []).map((decision) => decision.id);
    return ids.length > 0 && ids.every((id) => Boolean(state?.decisions?.[id]));
  }

  window.PM01ModulePracticeV7 = Object.freeze({ definition, proofFor, mergeProof, isComplete });
})();
