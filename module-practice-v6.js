(function () {
  'use strict';

  const STORAGE_KEY = 'pm01-module-practice-v6';
  const COURSE_KEY = 'pm01-state-v1';

  const PRACTICES = Object.freeze({
    m02: Object.freeze({
      title: 'Итоговая практика M02 · До того как строить',
      lead: 'Два решения проверяют, умеешь ли ты отделять output от ценности и выбирать самое опасное допущение до дорогой реализации.',
      decisions: Object.freeze([
        Object.freeze({ id: 'value-chain', title: 'Что доказывать первым', skills: Object.freeze(['value']), situation: 'Команда предлагает шесть недель делать новый кабинет партнёра. Бизнес ожидает рост повторных заказов, но никто не проверял, меняет ли кабинет поведение партнёров.', prompt: 'Что сделать до утверждения полного scope?', options: Object.freeze([
          Object.freeze({ id: 'strong-value', strong: true, label: 'Разложить цепочку “кабинет → способность → поведение → повторный заказ” и проверить слабейший переход', feedback: 'Сильный ход: работа связывается с внешним outcome, а не с выпуском интерфейса.', consequence: 'Команда получает конкретную ставку, которую можно проверить дешевле полной реализации.' }),
          Object.freeze({ id: 'ship-mvp', label: 'Сделать урезанный MVP кабинета и посмотреть на метрики после релиза', feedback: 'MVP уменьшает scope, но всё ещё предполагает, что сам кабинет — правильная причинная ставка.', consequence: 'Можно быстро выпустить неверный механизм и узнать об этом уже после затрат.' }),
          Object.freeze({ id: 'ask-sales', label: 'Спросить sales, какие функции чаще всего требуют партнёры', feedback: 'Это полезный сигнал, но запрос функции не доказывает изменение поведения или бизнес-эффект.', consequence: 'Roadmap станет лучше отражать пожелания, но не обязательно ценность.' }),
          Object.freeze({ id: 'commit-plan', label: 'Зафиксировать scope и дату, чтобы команда получила стабильный план', feedback: 'Стабильность плана не компенсирует слабую причинную модель.', consequence: 'Неопределённость превращается в формальное обязательство.' }),
        ]) }),
        Object.freeze({ id: 'assumption-priority', title: 'Какое неизвестное проверять первым', skills: Object.freeze(['uncertainty']), situation: 'Есть три неизвестных: партнёры захотят новый процесс, API выдержит нагрузку, legal согласует изменение. Через пять дней нужно подписать необратимое обязательство по интеграции.', prompt: 'Как выбрать первую проверку?', options: Object.freeze([
          Object.freeze({ id: 'strong-assumption', strong: true, label: 'Сравнить уверенность, цену ошибки и близость необратимого решения; проверить допущение с максимальным произведением риска', feedback: 'Сильный ход: порядок исследования определяется риском решения, а не удобством проверки.', consequence: 'Дорогое обязательство откладывается до evidence по наиболее опасной ставке.' }),
          Object.freeze({ id: 'easy-first', label: 'Начать с технической нагрузки, потому что её проще всего измерить', feedback: 'Простота эксперимента не означает, что именно это неизвестное определяет решение.', consequence: 'Команда может получить точный ответ на второстепенный вопрос.' }),
          Object.freeze({ id: 'legal-first', label: 'Начать с legal, потому что внешние согласования обычно самые долгие', feedback: 'Длительность важна, но сама по себе не определяет цену ошибки и необратимость.', consequence: 'Можно оптимизировать ожидание, не уменьшая главный риск.' }),
          Object.freeze({ id: 'parallel-all', label: 'Проверять все три допущения параллельно максимальным составом команды', feedback: 'Параллельность увеличивает стоимость learning и WIP без явного приоритета.', consequence: 'Ресурс расходуется раньше, чем понятно, какой ответ действительно меняет решение.' }),
        ]) }),
      ])
    }),
    m03: Object.freeze({ title: 'Итоговая практика M03 · Что реально держит срок', lead: 'Найди зависимость, которая определяет downstream impact, а не просто выглядит срочной.', decisions: Object.freeze([
      Object.freeze({ id: 'critical-dependency', title: 'Один узел перед запуском', skills: Object.freeze(['dependencies']), situation: 'До запуска две недели. Дизайн задерживается на день, legal ждёт договор поставщика, а одно решение по формату данных блокирует backend, QA и миграцию клиента.', prompt: 'Куда направить управленческое внимание?', options: Object.freeze([
        Object.freeze({ id: 'protect-graph', strong: true, label: 'Зафиксировать граф блокировок, owner решения по данным, дедлайн и ранний сигнал потребления буфера', feedback: 'Сильный ход: критичность определяется downstream impact и временем до необратимого окна.', consequence: 'Команда защищает узел, который разблокирует сразу несколько последующих действий.' }),
        Object.freeze({ id: 'push-design', label: 'Ускорить дизайн, потому что его задержка уже видна в плане', feedback: 'Видимость задержки не равна критичности.', consequence: 'Команда улучшит локальный срок, не разблокировав основную цепочку.' }),
        Object.freeze({ id: 'daily-all', label: 'Поставить ежедневный статус по всем зависимостям', feedback: 'Больше мониторинга не заменяет выбора критичного узла и владельца решения.', consequence: 'Coordination tax растёт, а блокировка остаётся.' }),
        Object.freeze({ id: 'add-buffer', label: 'Добавить два дня резерва ко всем задачам до запуска', feedback: 'Локальные запасы скрывают состояние и не лечат конкретную зависимость.', consequence: 'План становится длиннее, но риск остаётся невидимым.' }),
      ]) })
    ]) }),
    m04: Object.freeze({ title: 'Итоговая практика M04 · Поток вместо занятости', lead: 'Проверь, умеешь ли ты уменьшать очередь и защищать throughput системы.', decisions: Object.freeze([
      Object.freeze({ id: 'flow-bottleneck', title: 'QA захлёбывается', skills: Object.freeze(['work']), situation: 'В разработке одновременно 14 задач. Разработчики заняты на 95%, но перед QA очередь из девяти элементов, а средний lead time вырос вдвое.', prompt: 'Какое вмешательство даст наиболее системный эффект?', options: Object.freeze([
        Object.freeze({ id: 'limit-wip', strong: true, label: 'Ограничить запуск новой работы, помочь разгрузить QA и измерять throughput/age очереди', feedback: 'Сильный ход: оптимизируется поток системы, а не локальная загрузка разработчиков.', consequence: 'Очередь уменьшается, завершённая работа начинает двигаться быстрее.' }),
        Object.freeze({ id: 'hire-qa', label: 'Сразу открыть вакансию ещё одного QA', feedback: 'Дополнительная мощность может помочь, но сначала нужно проверить, что QA — устойчивое ограничение, а не следствие WIP.', consequence: 'Система получает дорогую меру до диагноза причины очереди.' }),
        Object.freeze({ id: 'push-dev', label: 'Попросить разработчиков закрыть больше задач, чтобы выполнить план спринта', feedback: 'Это увеличивает приток в уже перегруженное ограничение.', consequence: 'Очередь и lead time растут ещё быстрее.' }),
        Object.freeze({ id: 'prioritize-all', label: 'Переприоритизировать все 14 задач и оставить тот же WIP', feedback: 'Новый порядок не уменьшает количество одновременно открытой работы.', consequence: 'Команда тратит время на сортировку, сохраняя основную механику очереди.' }),
      ]) })
    ]) }),
    m05: Object.freeze({ title: 'Итоговая практика M05 · Прогноз без ложной точности', lead: 'Дай решение под неопределённостью, не маскируя её одной датой.', decisions: Object.freeze([
      Object.freeze({ id: 'forecast-range', title: 'Когда будет готово?', skills: Object.freeze(['uncertainty']), situation: 'Руководитель просит “одну дату” релиза. За последние 12 похожих задач цикл колебался от 8 до 19 дней, текущая работа содержит две новые интеграции.', prompt: 'Как сформулировать прогноз?', options: Object.freeze([
        Object.freeze({ id: 'range-evidence', strong: true, label: 'Дать диапазон с уровнем уверенности, основанный на истории, и дату следующего обновления прогноза', feedback: 'Сильный ход: неопределённость становится явной и регулярно уменьшается по мере evidence.', consequence: 'Решения можно принимать по диапазону риска, а не по выдуманной точности.' }),
        Object.freeze({ id: 'average-date', label: 'Назвать среднее историческое значение как дату и добавить небольшой запас', feedback: 'Среднее скрывает разброс и новые факторы текущей работы.', consequence: 'Одна цифра выглядит уверенно, но не сообщает вероятность отклонения.' }),
        Object.freeze({ id: 'worst-case', label: 'Назвать 19 дней, чтобы почти гарантировать выполнение обещания', feedback: 'Консервативная точка всё равно не показывает распределение и цену разных исходов.', consequence: 'План получает скрытый буфер и слабую обратную связь.' }),
        Object.freeze({ id: 'refuse-date', label: 'Отказаться от прогноза, пока обе интеграции полностью не исследованы', feedback: 'Неопределённость не отменяет необходимости принимать решения сейчас.', consequence: 'Стейкхолдер остаётся без полезного диапазона для планирования.' }),
      ]) })
    ]) }),
    m06: Object.freeze({ title: 'Итоговая практика M06 · Риск до обязательства', lead: 'Сохрани опциональность и проверь kill criterion до дорогого шага.', decisions: Object.freeze([
      Object.freeze({ id: 'risk-option', title: 'Контракт с единственным поставщиком', skills: Object.freeze(['uncertainty', 'decisions']), situation: 'Для ключевой функции нужен внешний провайдер. Годовой контракт необратим после пятницы. Есть техническая демо-версия, но нет evidence по реальной нагрузке и условиям выхода.', prompt: 'Что делать до пятницы?', options: Object.freeze([
        Object.freeze({ id: 'cheap-kill-test', strong: true, label: 'Провести ограниченный нагрузочный тест, заранее задать kill criterion и сохранить fallback до результата', feedback: 'Сильный ход: evidence появляется до необратимого commitment, а плохой результат реально меняет решение.', consequence: 'Команда сохраняет вариант отказаться или сменить провайдера без sunk cost.' }),
        Object.freeze({ id: 'sign-discount', label: 'Подписать сейчас ради скидки, а риски закрыть техническими мерами позже', feedback: 'Скидка ускоряет необратимость раньше проверки ключевой ставки.', consequence: 'Ошибка становится дорогой именно в момент, когда информации ещё мало.' }),
        Object.freeze({ id: 'more-analysis', label: 'Продолжать анализ документов и отложить техническую проверку', feedback: 'Анализ не заменяет evidence по поведению системы под реальной нагрузкой.', consequence: 'Время до решения сокращается, а главный риск остаётся непроверенным.' }),
        Object.freeze({ id: 'parallel-vendors', label: 'Полностью интегрировать двух поставщиков параллельно и выбрать позже', feedback: 'Опциональность полезна, но полная двойная реализация слишком дорога как способ получить learning.', consequence: 'Цена проверки становится сравнима с ценой ошибки.' }),
      ]) })
    ]) }),
    m07: Object.freeze({ title: 'Итоговая практика M07 · Решение должно закрываться', lead: 'Сократи decision latency через owner, deadline и явный порог эскалации.', decisions: Object.freeze([
      Object.freeze({ id: 'decision-contract', title: 'Пять дней без решения', skills: Object.freeze(['decisions']), situation: 'Три команды ждут выбора между двумя вариантами API. Встречи проходят ежедневно, но sponsor говорит “ещё обсудим”. Каждые сутки задержки сдвигают тестирование.', prompt: 'Как изменить интерфейс решения?', options: Object.freeze([
        Object.freeze({ id: 'owner-deadline', strong: true, label: 'Зафиксировать decision owner, два допустимых варианта, deadline и автоматический escalation threshold', feedback: 'Сильный ход: обсуждение превращается в контракт закрытия решения.', consequence: 'Команда знает, кто решает, к какому моменту и что произойдёт при задержке.' }),
        Object.freeze({ id: 'more-meeting', label: 'Добавить ещё одну встречу со всеми стейкхолдерами и собрать мнения', feedback: 'Дополнительное обсуждение без права закрыть выбор увеличивает decision latency.', consequence: 'Информации становится больше, но решение остаётся ничьим.' }),
        Object.freeze({ id: 'team-choice', label: 'Пусть техническая команда сама выберет более простой вариант и сообщит sponsor постфактум', feedback: 'Скорость достигается ценой обхода владельца бизнес-риска.', consequence: 'Решение можно принять быстро, но ownership и последствия останутся конфликтными.' }),
        Object.freeze({ id: 'escalate-now', label: 'Немедленно эскалировать вопрос руководителю sponsor без заранее заданного порога', feedback: 'Эскалация без контракта легко превращается в политический обход вместо системного механизма.', consequence: 'Один вопрос может закрыться, но процесс останется непредсказуемым.' }),
      ]) })
    ]) }),
    m08: Object.freeze({ title: 'Итоговая практика M08 · Плохая новость должна двигаться быстро', lead: 'Сделай статус доказательным и уменьши bad-news latency.', decisions: Object.freeze([
      Object.freeze({ id: 'truth-status', title: 'Зелёный статус, красный риск', skills: Object.freeze(['information']), situation: 'Еженедельный статус зелёный: “90% задач готово”. При этом команда уже три дня знает, что миграция данных может не пройти в окно запуска, но ждёт подтверждения.', prompt: 'Как изменить коммуникацию?', options: Object.freeze([
        Object.freeze({ id: 'evidence-confidence', strong: true, label: 'Сообщить риск сейчас: факт, уровень уверенности, impact, owner следующей проверки и срок обновления', feedback: 'Сильный ход: важная информация отделяется от процента готовности и получает понятный следующий шаг.', consequence: 'Лица, принимающие решение, узнают плохую новость до того, как окно будет потеряно.' }),
        Object.freeze({ id: 'wait-confirm', label: 'Дождаться полного подтверждения проблемы, чтобы не создавать лишнюю тревогу', feedback: 'Ожидание высокой уверенности увеличивает bad-news latency именно там, где время имеет цену.', consequence: 'Решение может стать необратимым раньше, чем информация попадёт наверх.' }),
        Object.freeze({ id: 'yellow-status', label: 'Поменять общий цвет статуса на жёлтый без дополнительных деталей', feedback: 'Цвет сигнализирует тревогу, но не даёт evidence, impact и владельца следующего действия.', consequence: 'Стейкхолдеры видят неопределённость, но не знают, что с ней делать.' }),
        Object.freeze({ id: 'percent-down', label: 'Снизить процент готовности с 90% до 75%', feedback: 'Процент задач не описывает критический риск миграционного окна.', consequence: 'Отчёт становится “честнее”, но механизм проблемы всё ещё скрыт.' }),
      ]) })
    ]) }),
    m09: Object.freeze({ title: 'Итоговая практика M09 · Система заставляет людей вести себя так', lead: 'Снизь coordination tax и выровняй ownership со значимым результатом.', decisions: Object.freeze([
      Object.freeze({ id: 'org-interface', title: 'Все заняты, результат стоит', skills: Object.freeze(['work', 'decisions']), situation: 'Четыре команды оптимизируют собственную загрузку. Один клиентский change проходит через семь handoff, у каждого KPI на локальную скорость, а end-to-end owner отсутствует.', prompt: 'Что изменить в первую очередь?', options: Object.freeze([
        Object.freeze({ id: 'outcome-owner', strong: true, label: 'Назначить end-to-end owner результата, сократить обязательные handoff и мерить время до клиентского outcome', feedback: 'Сильный ход: ownership и метрика перестают вознаграждать локальную занятость за счёт общей системы.', consequence: 'Команды получают стимул уменьшать очередь между функциями, а не только ускорять свой участок.' }),
        Object.freeze({ id: 'more-raci', label: 'Детализировать RACI для всех семи handoff, сохранив существующие KPI', feedback: 'Ясность ролей полезна, но не меняет количество передач и локальные стимулы.', consequence: 'Процесс становится документированнее, но coordination tax остаётся.' }),
        Object.freeze({ id: 'shared-meeting', label: 'Добавить общий ежедневный sync четырёх команд', feedback: 'Встреча может ускорить информацию, но не устраняет интерфейсы и противоречивые KPI.', consequence: 'Coordination tax растёт вместе с количеством участников.' }),
        Object.freeze({ id: 'central-pm', label: 'Попросить PM вручную координировать каждый handoff и напоминать владельцам', feedback: 'Ручная диспетчеризация маскирует системную проблему ownership и создаёт новый bottleneck.', consequence: 'Краткосрочно движение ускорится, но система станет зависеть от одного координатора.' }),
      ]) })
    ]) }),
    m10: Object.freeze({ title: 'Итоговая практика M10 · Управляющий цикл', lead: 'Собери проект в повторяемый feedback loop: сигнал, решение, действие, проверка.', decisions: Object.freeze([
      Object.freeze({ id: 'operating-loop', title: 'Проект меняется быстрее отчёта', skills: Object.freeze(['feedback', 'value']), situation: 'У программы есть ежемесячный steering, но ключевые предположения меняются каждую неделю. Решения живут в чатах, причины не записываются, а итоговые KPI приходят через месяц после проблем.', prompt: 'Какой operating cadence нужен?', options: Object.freeze([
        Object.freeze({ id: 'signal-decision-review', strong: true, label: 'Еженедельный цикл: leading signals → решения с owner/rationale → действия → проверка условий пересмотра; steering оставить для крупных обязательств', feedback: 'Сильный ход: частота обратной связи соответствует скорости изменения системы, а решения становятся проверяемыми.', consequence: 'Команда корректирует курс до итогового KPI и сохраняет историю того, почему решение было принято.' }),
        Object.freeze({ id: 'weekly-steering', label: 'Проводить полноценный steering committee каждую неделю', feedback: 'Увеличение частоты тяжёлого governance создаёт лишнюю стоимость координации.', consequence: 'Сигналы обсуждаются чаще, но система становится медленной и перегруженной встречами.' }),
        Object.freeze({ id: 'dashboard-only', label: 'Построить real-time dashboard со всеми метриками и оставить текущий процесс решений', feedback: 'Наблюдаемость без интерфейса решения не замыкает feedback loop.', consequence: 'Команда быстрее видит проблему, но не обязательно быстрее меняет курс.' }),
        Object.freeze({ id: 'monthly-better', label: 'Сохранить месячный ритм, но сделать отчёт подробнее и добавить больше KPI', feedback: 'Больше данных не компенсирует cadence, который медленнее изменения проекта.', consequence: 'Проблемы продолжают обнаруживаться после того, как цена корректировки выросла.' }),
      ]) })
    ]) }),
  });

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
  }
  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; }
  }
  function escapeHtml(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }
  function getState() { return readJson(STORAGE_KEY, { modules: {} }); }
  function moduleState(moduleId) { return getState().modules?.[moduleId] || { decisions: {}, proof: {}, completedAt: null }; }
  function isComplete(moduleId) { return Boolean(moduleState(moduleId).completedAt); }

  function courseState() { return readJson(COURSE_KEY, { completed: [], lab: {} }); }
  function lessonReady(lesson, state) {
    if (!lesson?.learningLab || !state.completed?.includes(lesson.id)) return false;
    const stored = state.lab?.[lesson.id] || {};
    const requiredDrills = (lesson.learningLab.drills || []).filter(item => item.required !== false);
    const requiredFields = (lesson.learningLab.workbookFields || []).filter(item => item.required !== false);
    return requiredDrills.every(item => Boolean(stored.drillAnswers?.[item.id])) && requiredFields.every(item => String(stored.workbook?.[item.id] || '').trim());
  }
  function moduleReady(moduleId) {
    const module = window.PM01?.modules?.find(item => item.id === moduleId);
    if (!module) return false;
    const state = courseState();
    return (module.lessons || []).every(lesson => lessonReady(lesson, state));
  }

  function commit(moduleId, decisionId, optionId) {
    const practice = PRACTICES[moduleId];
    const decision = practice?.decisions?.find(item => item.id === decisionId);
    const option = decision?.options?.find(item => item.id === optionId);
    if (!decision || !option) return false;
    const state = getState();
    state.modules ||= {};
    const current = state.modules[moduleId] || { decisions: {}, proof: {}, completedAt: null };
    current.decisions ||= {};
    current.proof ||= {};
    if (current.decisions[decisionId]) return false;
    current.decisions[decisionId] = optionId;
    if (option.strong) (decision.skills || []).forEach(skill => { current.proof[skill] = true; });
    if (practice.decisions.every(item => Boolean(current.decisions[item.id]))) current.completedAt = new Date().toISOString();
    state.modules[moduleId] = current;
    return writeJson(STORAGE_KEY, state);
  }

  function retry(moduleId) {
    const state = getState();
    const previous = state.modules?.[moduleId] || {};
    state.modules ||= {};
    state.modules[moduleId] = { decisions: {}, proof: previous.proof || {}, completedAt: null };
    writeJson(STORAGE_KEY, state);
  }

  function selectedOption(decision, state) {
    return decision.options.find(option => option.id === state.decisions?.[decision.id]) || null;
  }

  function decisionMarkup(decision, state) {
    const selected = selectedOption(decision, state);
    if (!selected) return `<section class="mp-decision"><p class="eyebrow">Решение</p><h2>${escapeHtml(decision.title)}</h2><p class="mp-situation">${escapeHtml(decision.situation)}</p><fieldset><legend>${escapeHtml(decision.prompt)}</legend><div class="mp-options">${decision.options.map(option => `<button type="button" class="mp-option" data-mp-decision="${escapeHtml(decision.id)}" data-mp-option="${escapeHtml(option.id)}">${escapeHtml(option.label)}</button>`).join('')}</div></fieldset></section>`;
    const reference = decision.options.find(option => option.strong);
    return `<section class="mp-decision answered"><p class="eyebrow">Решение зафиксировано</p><h2>${escapeHtml(decision.title)}</h2><div class="mp-result ${selected.strong ? 'strong' : 'needs-work'}"><strong>${escapeHtml(selected.label)}</strong><p>${escapeHtml(selected.consequence)}</p><p>${escapeHtml(selected.feedback)}</p></div>${selected.strong ? '' : `<div class="mp-reference"><small>Сильный ориентир</small><strong>${escapeHtml(reference.label)}</strong><p>${escapeHtml(reference.feedback)}</p></div>`}</section>`;
  }

  function resultMarkup(moduleId, practice, state) {
    const proved = Object.keys(state.proof || {}).filter(skill => state.proof[skill]);
    return `<section class="mp-summary"><p class="eyebrow">Итог модуля</p><h2>${proved.length ? 'Evidence сохранено' : 'Практика завершена, но evidence пока слабое'}</h2><p>${proved.length ? `Подтверждено: ${proved.map(id => window.PM01MasteryV6?.SKILLS?.[id]?.name || id).join(', ')}.` : 'Вернись к разбору и повтори практику сильнее. Завершение модуля не превращается автоматически в доказанный навык.'}</p><div class="mp-actions"><a class="button primary" href="#/course">Продолжить по курсу →</a><button type="button" class="button subtle" data-mp-retry="${moduleId}">Повторить практику</button></div></section>`;
  }

  function render(moduleId) {
    const main = document.querySelector('#main');
    const practice = PRACTICES[moduleId];
    if (!main || !practice) return false;
    if (!moduleReady(moduleId) && !isComplete(moduleId)) {
      const module = window.PM01?.modules?.find(item => item.id === moduleId);
      const state = courseState();
      const target = module?.lessons?.find(lesson => !lessonReady(lesson, state));
      main.innerHTML = `<div class="page mp-shell"><p class="eyebrow">Итоговая практика ${moduleId.toUpperCase()}</p><h1>Сначала заверши уроки модуля</h1><p class="lead">Итоговая практика проверяет перенос после обоих уроков, поэтому не заменяет их.</p><a class="button primary" href="${target ? `#/lesson/${encodeURIComponent(target.id)}` : '#/course'}">Вернуться к уроку →</a></div>`;
      return true;
    }

    const state = moduleState(moduleId);
    main.innerHTML = `<div class="page mp-shell"><header class="mp-header"><div><p class="eyebrow">${moduleId.toUpperCase()} · итоговая практика</p><h1>${escapeHtml(practice.title)}</h1><p class="lead">${escapeHtml(practice.lead)}</p></div><span>${Object.keys(state.decisions || {}).length}/${practice.decisions.length} решений</span></header><div class="mp-decision-list">${practice.decisions.map(decision => decisionMarkup(decision, state)).join('')}</div>${state.completedAt ? resultMarkup(moduleId, practice, state) : ''}</div>`;

    main.querySelectorAll('[data-mp-decision]').forEach(button => button.addEventListener('click', () => {
      if (commit(moduleId, button.dataset.mpDecision, button.dataset.mpOption)) render(moduleId);
    }));
    main.querySelector('[data-mp-retry]')?.addEventListener('click', () => { retry(moduleId); render(moduleId); });
    main.focus?.({ preventScroll: true });
    window.scrollTo?.(0, 0);
    return true;
  }

  function routeModuleId() {
    const match = (location.hash || '').match(/^#\/practice\/(m\d{2})$/);
    return match?.[1] || null;
  }
  function renderRoute() {
    const id = routeModuleId();
    if (!id) return;
    requestAnimationFrame(() => render(id));
  }
  function start() {
    renderRoute();
    window.addEventListener('hashchange', renderRoute);
  }

  window.PM01ModulePracticeV6 = Object.freeze({ PRACTICES, getState, moduleState, isComplete, moduleReady, commit, retry, render, __test: Object.freeze({ commit }) });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
