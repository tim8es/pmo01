(function () {
  'use strict';

  const course = window.PM01;
  if (!course?.modules) return;

  const LESSON_SKILL = Object.freeze({
    'project-system': 'work',
    'system-diagnostic': 'decisions',
    'outcome-tree': 'value',
    'assumption-map': 'uncertainty',
    'dependency-graph': 'dependencies',
    'critical-chain': 'dependencies',
    queueing: 'work',
    toc: 'work',
    forecasting: 'uncertainty',
    cone: 'uncertainty',
    'risk-kill': 'uncertainty',
    optionality: 'uncertainty',
    'decision-latency': 'decisions',
    escalation: 'decisions',
    'bad-news': 'information',
    'confidence-status': 'information',
    'coordination-tax': 'work',
    'ownership-incentives': 'decisions',
    'operating-cadence': 'feedback',
    capstone: 'feedback',
  });

  const SKILL_COPY = Object.freeze({
    value: 'Связывать работу команды с наблюдаемым изменением для пользователя или бизнеса.',
    work: 'Видеть реальный поток работы, очередь и ограничение системы.',
    information: 'Доставлять важный сигнал тому, кто должен действовать, достаточно рано.',
    decisions: 'Локализовать выбор, владельца, срок и условие пересмотра решения.',
    dependencies: 'Понимать, что действительно блокирует следующие ценные действия.',
    uncertainty: 'Проверять самое опасное неизвестное до дорогого или необратимого обязательства.',
    feedback: 'Создавать ранний сигнал, который показывает, работает решение или требует пересмотра.',
  });

  const TERMS = Object.freeze({
    'dependency-graph': [
      ['Downstream impact', 'Сколько следующих ценных действий блокирует задержка одного узла.'],
      ['Узел зависимости', 'Работа, решение или согласование, без которого следующий шаг не может начаться.'],
    ],
    'critical-chain': [
      ['Критическая цепь', 'Цепочка работ и ресурсных ограничений, определяющая срок результата.'],
      ['Буфер', 'Общая защита обязательства от вариативности вместо скрытых запасов в каждой задаче.'],
    ],
    queueing: [
      ['WIP', 'Количество работы, одновременно находящейся в системе.'],
      ['Время ожидания', 'Время, когда работа не создаёт ценность, потому что ждёт мощности или решения.'],
    ],
    toc: [
      ['Ограничение', 'Участок системы, который сильнее всего ограничивает общий результат.'],
      ['Throughput', 'Скорость, с которой система создаёт завершённый полезный результат.'],
    ],
    forecasting: [
      ['Диапазон прогноза', 'Интервал возможных дат или значений вместо одной ложной точной оценки.'],
      ['Базовая частота', 'История похожих случаев как отправная точка прогноза.'],
    ],
    cone: [
      ['Конус неопределённости', 'Сужение диапазона возможных исходов по мере появления проверенных данных.'],
      ['Диапазон', 'Честная граница возможных значений при текущем количестве доказательств.'],
    ],
    'risk-kill': [
      ['Kill criterion', 'Заранее заданное условие, при котором ставку прекращают.'],
      ['Цена ошибки', 'Ущерб, если допущение окажется ложным и будет обнаружено слишком поздно.'],
    ],
    optionality: [
      ['Опциональность', 'Способность отложить необратимое обязательство, сохраняя несколько рабочих вариантов.'],
      ['Необратимость', 'Момент, после которого смена решения становится резко дороже.'],
    ],
    'decision-latency': [
      ['Decision latency', 'Время от появления достаточной информации до принятого решения.'],
      ['Decision owner', 'Человек или роль, у которой есть право и обязанность закрыть выбор.'],
    ],
    escalation: [
      ['Порог эскалации', 'Наблюдаемое условие, после которого вопрос поднимается на следующий уровень.'],
      ['Эскалация', 'Механизм ускорения решения, а не просто сообщение о проблеме.'],
    ],
    'bad-news': [
      ['Bad-news latency', 'Задержка между плохим сигналом и моментом, когда о нём узнаёт тот, кто может действовать.'],
      ['Ранний сигнал', 'Индикатор проблемы до того, как она становится дорогой.'],
    ],
    'confidence-status': [
      ['Confidence', 'Уровень уверенности в прогнозе или утверждении с явным основанием.'],
      ['Доказательство статуса', 'Факт, на котором основано сообщение о состоянии проекта.'],
    ],
    'coordination-tax': [
      ['Coordination tax', 'Затраты времени и внимания на согласование вместо создания результата.'],
      ['Handoff', 'Передача ответственности или работы между ролями и командами.'],
    ],
    'ownership-incentives': [
      ['Ownership', 'Ясная ответственность за решение и его последствия.'],
      ['Стимул', 'Какое поведение система фактически поощряет правилами и последствиями.'],
    ],
    'operating-cadence': [
      ['Cadence', 'Регулярный ритм наблюдения, решения и проверки результата.'],
      ['Feedback loop', 'Цикл «сигнал → решение → действие → новый сигнал».'],
    ],
    capstone: [
      ['Operating system', 'Набор повторяемых правил, сигналов и ритуалов, через которые проект принимает решения.'],
      ['Leading indicator', 'Ранний показатель, меняющийся до итогового результата и позволяющий вмешаться вовремя.'],
    ],
  });

  function stripHtml(value) {
    return String(value || '')
      .replace(/<br\s*\/?>/gi, ' · ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function termsFor(lesson) {
    return (TERMS[lesson.id] || []).map(([term, meaning]) => ({ term, meaning }));
  }

  function guidedDrill(lesson) {
    const guided = lesson.guidedPractice;
    if (!guided?.options?.length) return null;
    return {
      id: `${lesson.id}-decision`,
      lessonId: lesson.id,
      stage: 'cold',
      required: true,
      title: guided.title || 'Решение до разбора',
      situation: guided.situation || '',
      prompt: guided.prompt || 'Что сделаешь первым?',
      options: guided.options.map((option) => ({
        id: option.id,
        label: option.label,
        score: Number(option.score) || 0,
        feedback: option.feedback || guided.debrief || '',
      })),
    };
  }

  function workbookFields(lesson) {
    const criteria = Array.isArray(lesson.criteria) ? lesson.criteria : [];
    const source = criteria.length >= 3 ? criteria : (lesson.practice || []).slice(0, 4);
    return source.map((item, index) => ({
      id: `evidence-${index + 1}`,
      label: `Доказательство ${index + 1}`,
      prompt: `Зафиксируй конкретный факт или артефакт: ${stripHtml(item)}`,
      required: true,
    }));
  }

  function workedSteps(lesson) {
    const reference = lesson.referenceSolution?.steps;
    if (Array.isArray(reference) && reference.length >= 3) return reference.map(stripHtml);
    return (lesson.practice || []).slice(0, 4).map(stripHtml);
  }

  function normalizeLesson(lesson) {
    const skillId = LESSON_SKILL[lesson.id] || 'feedback';
    if (lesson.learningLab) {
      lesson.learningLab.skillId ||= skillId;
      lesson.learningLab.mission ||= `Прими решение до объяснения, затем перенеси технику «${lesson.title}» на реальный проект.`;
      lesson.learningLab.terms ||= termsFor(lesson);
      return;
    }

    const drill = guidedDrill(lesson);
    const steps = (lesson.practice || []).map(stripHtml).filter(Boolean);
    const reference = lesson.referenceSolution;

    lesson.learningLab = {
      skillId,
      skill: SKILL_COPY[skillId],
      mission: drill
        ? `Сначала прими решение в ситуации «${drill.title}», затем разберись в механизме и примени технику к своему проекту.`
        : `Разбери рабочую ситуацию, примени технику «${lesson.title}» и зафиксируй доказательства на своём проекте.`,
      terms: termsFor(lesson),
      drills: drill ? [drill] : [],
      workedExample: {
        title: reference?.title || `Сильный вариант: ${lesson.title}`,
        steps: workedSteps(lesson),
      },
      technique: {
        name: lesson.title,
        purpose: lesson.thesis,
        steps: steps.length >= 3 ? steps : [lesson.thesis, 'Зафиксируй наблюдаемые факты.', 'Определи решение и условие пересмотра.'],
        model: stripHtml(lesson.model),
      },
      workbookTitle: `${lesson.title} · рабочая карта`,
      workbookFields: workbookFields(lesson),
      transferPrompt: steps.at(-1) || `Примени технику «${lesson.title}» к текущему или недавнему проекту и запиши, какое решение изменится.`,
    };
  }

  course.modules.forEach((module) => (module.lessons || []).forEach(normalizeLesson));
  window.PM01LearningLabsV7 = Object.freeze({ LESSON_SKILL, SKILL_COPY, TERMS });
})();
