1. Архитектура - Feature-Sliced Design. Слои: app, pages, widgets, features, entities, shared. Импорты только сверху вниз (pages может импортировать widgets/features/entities/shared, но не наоборот).
2. Каждый слайс экспортирует наружу только через index.js (публичный API). Импорты из внутренностей чужого слайса запрещены.
3. Стили: глобальный SCSS, уже подключен в main.jsx. НЕ создавать CSS-модули, styled-components, Tailwind. НЕ писать новые стили без необходимости.
4. Все классы из исходного HTML сохранять один в один (БЭМ). class -> className, for -> htmlFor.
5. Компоненты - функциональные, JSX, без TypeScript.
6. Структура слайса: ui/ComponentName.jsx + index.js с реэкспортом.
7. Пути к статике абсолютные: /images/..., /fonts/...
8. Исходные HTML-файлы лежат в docs/reference/.