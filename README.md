# Zahrada - frontend

React (Vite) frontend aplikace pro správu zahrad a poptávek zahradnických prací. Sám o sobě
neukládá žádná data - vše (kromě statického seznamu měst v katalogu, viz TODO komentář v
`src/shared/api/mock/cities.js`) čte a zapisuje přes REST API backendu (`zahrada_backend`) s
JWT autentizací.

## Požadavky

- Node.js 20+ a npm
- **Spuštěný backend** (viz `zahrada_backend/README.md`, výchozí adresa `http://localhost:8080`) -
  bez něj se nelze přihlásit ani registrovat a stránky závislé na API (katalog, profil, zahrady,
  poptávky, návrhy) nenačtou žádná data

## Instalace a spuštění

```bash
npm install
npm run dev
```

Aplikace běží na `http://localhost:5173`.

Další skripty:

```bash
npm run build    # produkční build do dist/
npm run lint     # ESLint
npm run preview  # náhled produkčního buildu (po npm run build)
```

## Proměnná prostředí

Adresa backendu se čte z `VITE_API_URL` v souboru `.env` v kořeni projektu (`.env` není v gitu,
zkopírujte `.env.example`):

```bash
cp .env.example .env
```

```
VITE_API_URL=http://localhost:8080
```

Pokud backend běží jinde (např. na `8081`, viz `zahrada_backend/README.md`), upravte hodnotu
odpovídajícím způsobem a restartujte `npm run dev` (Vite proměnné prostředí načítá jen při startu).

## Testovací role

Přihlašovací účty se nezakládají automaticky - backend žádné výchozí uživatele neseeduje.
Účet si vytvoříte registrací na `/signup`. Aplikace rozlišuje dvě role, vybírané přímo ve
formuláři registrace:

- **`OWNER`** (vlastník zahrady) - na `/garden/new` a `/garden/:id` zakládá a spravuje zahrady a
  poptávky, na `/profile` vidí podané návrhy zahradníků a jednotlivé přijímá nebo zamítá.
- **`WORKER`** (zahradník) - na `/catalog` prohlíží veřejný seznam poptávek (dostupný i bez
  přihlášení) a po přihlášení na ně podává nabídky.

Pro vyzkoušení celého scénáře (poptávka vlastníka → nabídka zahradníka → schválení) je potřeba
zaregistrovat dva samostatné účty - jeden s rolí `OWNER`, druhý s rolí `WORKER` - a mezi nimi
přepínat přihlášením/odhlášením (např. v běžném a anonymním okně prohlížeče současně).

## Conventions

1. Архитектура - Feature-Sliced Design. Слои: app, pages, widgets, features, entities, shared. Импорты только сверху вниз (pages может импортировать widgets/features/entities/shared, но не наоборот).
2. Каждый слайс экспортирует наружу только через index.js (публичный API). Импорты из внутренностей чужого слайса запрещены.
3. Стили: глобальный SCSS, уже подключен в main.jsx. НЕ создавать CSS-модули, styled-components, Tailwind. НЕ писать новые стили без необходимости.
4. Все классы из исходного HTML сохранять один в один (БЭМ). class -> className, for -> htmlFor.
5. Компоненты - функциональные, JSX, без TypeScript.
6. Структура слайса: ui/ComponentName.jsx + index.js с реэкспортом.
7. Пути к статике абсолютные: /images/..., /fonts/...
8. Исходные HTML-файлы лежат в docs/reference/.
