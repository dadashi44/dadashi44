<div align="center">

<img src="public/og-image.png" alt="Dauren Abasov — Frontend Developer" width="820">

<h1>dadashi44 — portfolio</h1>

**Портфолио фронтенд-разработчика.** Nuxt 4 с SSR, анимации на GSAP,
плавный скролл на Lenis, две локали и 3D-сцена на страницах ошибок.

[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=black)](https://gsap.com)
[![three.js](https://img.shields.io/badge/three.js-0.185-000000?logo=three.js&logoColor=white)](https://threejs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## О проекте

Восемь коммерческих проектов из Казахстана и Кыргызстана: киберспортивная
платформа, маркетплейс, портал сети ТРЦ, госплатформа, производство,
микрофинансовая организация и два мобильных приложения.

Сайт — не просто витрина: SSR-рендер, две языковые версии на отдельных URL,
Open Graph и JSON-LD под каждый кейс, форма обратной связи с доставкой в
Telegram и бюджет производительности, за которым видно следить.

## Возможности

| | |
| --- | --- |
| **Анимация** | Посимвольный reveal на SplitText, пин-скролл галереи работ, бесшовные marquee с ускорением от скорости прокрутки, магнитные кнопки, кастомный курсор с режимами |
| **Скролл** | Lenis, синхронизированный с `gsap.ticker` и ScrollTrigger |
| **Локализация** | RU на `/`, EN на `/en` — тексты интерфейса и все описания проектов |
| **Темы** | Тёмная и светлая на CSS-переменных, выбор сохраняется |
| **SEO** | canonical, hreflang, Open Graph с карточкой под каждый кейс, JSON-LD `Person` / `WebSite` / `CreativeWork`, `robots.txt` и `sitemap.xml` |
| **Формы** | Валидация, honeypot, отправка в Telegram через серверный роут — токен не покидает сервер |
| **404 / 500** | Космос на three.js с моделью Lexus IS F, летящей в невесомости |
| **Доступность** | Полная поддержка `prefers-reduced-motion`, работа с клавиатуры, контраст |

## Как выглядит

<table>
<tr>
<td width="50%"><img src="docs/preview-work.webp" alt="Страница работ"></td>
<td width="50%"><img src="docs/preview-error.webp" alt="Страница 404 с 3D-сценой"></td>
</tr>
<tr>
<td align="center"><sub>Каталог работ</sub></td>
<td align="center"><sub>404 — сцена на three.js</sub></td>
</tr>
</table>

## Стек

**Фреймворк** — Nuxt 4 (SSR), Vue 3, TypeScript strict
**Анимация** — GSAP 3 (ScrollTrigger, SplitText), Lenis, three.js
**Стили** — Tailwind CSS 3, CSS-переменные для тем
**Модули** — `@nuxtjs/i18n`, `@nuxt/fonts`, `@vueuse/nuxt`

## Запуск

> Требуется **Node 22+** — на 20.x Nuxt 4.5 падает на `Set.prototype.difference`.

```bash
bun install
cp .env.example .env     # заполните, если нужна форма обратной связи
bun run dev              # http://localhost:5050
```

```bash
bun run build            # прод-сборка
bun run preview
bun run typecheck
```

### Переменные окружения

| Переменная | Зачем |
| --- | --- |
| `NUXT_PUBLIC_SITE_URL` | Абсолютный origin для canonical, `og:url`, `hreflang` и sitemap |
| `NUXT_TELEGRAM_BOT_TOKEN` | Доставка формы обратной связи |
| `NUXT_TELEGRAM_CHAT_ID` | Чат, куда падают заявки |

Без токена и чата форма отвечает `501`, а интерфейс предлагает написать письмом.

## Структура

```
app/          компоненты, страницы, композаблы, данные проектов
i18n/locales/ тексты интерфейса — ru.json и en.json
server/       api формы, robots.txt и sitemap.xml
public/       скриншоты кейсов, иконки, OG-карточки, 3D-модель
scripts/      оптимизация GLB перед публикацией
```

Подробности реализации — как устроены анимации, локализация, SEO, страницы
ошибок и подготовка 3D-модели — в **[DEVELOPMENT.md](DEVELOPMENT.md)**.

## Контакты

**Даурен Абасов** — frontend-разработчик, Алматы

[Telegram](https://t.me/tadashi_brooo) · [LinkedIn](https://www.linkedin.com/in/d-abasov-e60/) · [GitHub](https://github.com/dadashi44) · [asian.paradissseee@gmail.com](mailto:asian.paradissseee@gmail.com)
