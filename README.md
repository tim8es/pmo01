# PM 0.1 — Инженерия исполнения

Практическая программа по Project Management уровня senior+.

> **Статус:** текущая реализация — reference prototype для проверки продукта и модели обучения. Она не считается целевой архитектурой масштабируемой платформы. Актуальная стратегия и источники истины находятся в [`docs/`](docs/README.md).

Это не курс по Scrum, Jira или PMBOK. Программа учит рассматривать проект как систему преобразования неопределенности в ценный результат и управлять семью потоками:

1. ценность;
2. работа;
3. информация;
4. решения;
5. зависимости;
6. неопределенность;
7. обратная связь.

## Что внутри

- 10 модулей и 20 уроков;
- полевая практика на реальном проекте;
- диагностика зрелости по семи потокам;
- 8 скачиваемых Markdown-шаблонов;
- сохранение прогресса и заметок в браузере;
- итоговый capstone длительностью 2–4 недели.

## Стратегия развития

Проект развивается по схеме **A → C**:

1. текущий сайт сохраняется как reference prototype;
2. на нем проверяются учебные механики и curriculum;
3. подтвержденные требования фиксируются как продуктовые и доменные контракты;
4. после validation gate строится отдельная масштабируемая v1;
5. контент и механики мигрируют в v1 вертикально, только после проверки.

Не следует расширять текущие `app.js` и `course-data.js` как постоянную платформенную архитектуру.

## Phase 1 — M01 Learning Validation

Первый вертикальный validation slice проверяет модуль **M01 «Проект как система»** до начала v1 rewrite.

Маршрут в прототипе:

`#/validation/m01`

Последовательность:

`baseline → 2 урока + Decision Drills → integrative post-case → real-project transfer → reflection`

Baseline и post-case оценивают пять измерений reasoning: механизм, доказательства, trade-offs, вмешательство и change condition. Положительный индивидуальный learning signal требует одновременно `post ≥ baseline + 3` и улучшения минимум по двум измерениям. Это development signal, а не автоматический `mastered`.

Экспериментальный UI и данные намеренно изолированы от legacy-монолитов:

- `learning-domain.js` — чистая scoring/state логика;
- `m01-validation-data.js` — cases/drills/field/reflection content;
- `m01-validation-app.js` — validation route и browser persistence;
- `m01-validation.css` — отдельные стили.

Операционный протокол реальных learner sessions: [`docs/validation/M01-VALIDATION-PROTOCOL.md`](docs/validation/M01-VALIDATION-PROTOCOL.md).

## Документация

Начать с [`docs/README.md`](docs/README.md).

Ключевые документы:

- [`docs/product/PRODUCT.md`](docs/product/PRODUCT.md) — продуктовый контракт;
- [`docs/product/LEARNING_MODEL.md`](docs/product/LEARNING_MODEL.md) — модель обучения;
- [`docs/product/CURRICULUM.md`](docs/product/CURRICULUM.md) — competency/curriculum contract;
- [`docs/content/CONTENT_MODEL.md`](docs/content/CONTENT_MODEL.md) — модель контента;
- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) — текущая и целевая архитектура;
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — этапы и validation gates.

## Запуск локально

Сайт не требует сборки. Откройте `index.html` или запустите любой статический HTTP-сервер из корня репозитория.

## Хранение данных

Все данные остаются в browser `localStorage` и не отправляются на сервер.

- `pm01-state-v1` — legacy progress, diagnostic, notes и criteria основного курса;
- `pm01-validation-m01-v1` — изолированное состояние M01 validation experiment.

Раздельные ключи нужны, чтобы legacy `app.js` не мог случайно перезаписать экспериментальные ответы своим in-memory state.

## Проверка

CI использует Node.js built-in test runner и проверяет:

- scoring/promotion/learning-state domain contracts;
- структуру M01 validation content;
- script/style integration и базовые accessibility contracts;
- JavaScript syntax для prototype runtime files.

Локально:

```bash
node --test tests/*.test.js
```

## Публикация

Workflow в `.github/workflows/pages.yml` публикует статический сайт в GitHub Pages после изменений в ветке `main`.
