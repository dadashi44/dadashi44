import type {Locale, Localized} from './projects'

export interface Library {
  /** the npm package name — also the key for its download count */
  pkg: string
  name: string
  tagline: Localized
  summary: Localized
  highlights: Localized<string[]>
  /** measured numbers shown as a small stat grid — only real benchmarks go here */
  facts?: {value: Localized; label: Localized}[]
  stack: string[]
  npm: string
  repo: string
  /** a line of outside recognition, e.g. a listing in an official directory */
  badge?: Localized
  /** extra links shown before npm and GitHub, e.g. a live playground */
  links?: {label: Localized; href: string}[]
  /** the case study the library was extracted from */
  project?: string
}

export interface ResolvedLibrary
  extends Omit<Library, 'tagline' | 'summary' | 'highlights' | 'facts' | 'badge' | 'links'> {
  tagline: string
  summary: string
  highlights: string[]
  facts: {value: string; label: string}[]
  badge?: string
  links: {label: string; href: string}[]
}

export const libraries: Library[] = [
  {
    pkg: 'vue-why-render',
    name: 'vue-why-render',
    tagline: {
      ru: 'Показывает, какие компоненты Vue перерисовываются — и почему',
      en: 'See which Vue components re-render — and why'
    },
    summary: {
      ru: 'Обычные инструменты только подсвечивают перерисовку. vue-why-render называет конкретную реактивную зависимость, которая её вызвала, и ловит частую ловушку: новая ссылка с тем же значением.',
      en: 'Most tools only flash a border on re-render. vue-why-render names the exact reactive dependency that triggered it and catches a common trap: a new reference holding the same value.'
    },
    highlights: {
      ru: [
        'Оверлей и плавающая панель со статистикой, деревом компонентов и лентой событий',
        'Интеграция с инспектором и таймлайном Vue DevTools',
        'Проверки в тестах, чтобы лишние рендеры не вернулись',
        'Отчёты сессий в JSON со сравнением «до / после»'
      ],
      en: [
        'An overlay and a floating panel with stats, the component tree and an event feed',
        'Hooks into the Vue DevTools inspector and timeline',
        'Render assertions for tests, so extra renders never come back',
        'Session reports in JSON with a before / after comparison'
      ]
    },
    stack: ['Vue 3', 'Nuxt module', 'TypeScript', 'DevTools API'],
    npm: 'https://www.npmjs.com/package/vue-why-render',
    repo: 'https://github.com/dadashi44/vue-why-render',
    badge: {ru: 'В официальном каталоге модулей Nuxt', en: 'Listed in the official Nuxt modules directory'},
    links: [
      {label: {ru: 'Песочница', en: 'Playground'}, href: 'https://dadashi44.github.io/vue-why-render/'},
      {label: {ru: 'Nuxt Modules', en: 'Nuxt Modules'}, href: 'https://nuxt.com/modules/vue-why-render'}
    ]
  },
  {
    pkg: '@bigplay/tree-view',
    name: '@bigplay/tree-view',
    tagline: {
      ru: 'Деревья и турнирные сетки для Vue 3, Vue 2 и Nuxt без зависимостей',
      en: 'Trees and tournament brackets for Vue 3, Vue 2 and Nuxt, zero dependencies'
    },
    summary: {
      ru: 'Выросла из турнирной сетки BIGPLAY: я вынес её из основного кода в отдельный пакет. Платформа стала проще на 1000+ строк, а сетку теперь можно подключить в любом проекте на Vue 3.',
      en: 'Grew out of the BIGPLAY tournament bracket: I pulled it out of the main codebase into its own package. The platform lost 1000+ lines, and any Vue 3 project can now use the bracket.'
    },
    highlights: {
      ru: [
        'Своя раскладка примерно в 100 строк вместо d3: листья идут по порядку, родитель встаёт по центру своих детей',
        'Тормозит не математика, а DOM: 1023 матча раскладываются за 0,3 мс, а рисуются без виртуализации 44 мс. Поэтому в DOM живут только карточки на экране, а холст всё равно считается по всему дереву, и страница не прыгает',
        'Вся математика — в ядре на чистом TypeScript, без единой строчки Vue; адаптеры для Vue 3 и Vue 2 тонкие, около 200 строк',
        'Данные пользователя только читаются, никаких мутаций; 283 автотеста, все проходят'
      ],
      en: [
        'Its own ~100-line layout instead of d3: leaves go in order, each parent sits centred over its children',
        'The DOM is the bottleneck, not the maths: 1,023 matches lay out in 0.3 ms but take 44 ms to render without virtualization. So only on-screen cards live in the DOM, while the canvas is still sized for the whole tree and the page never jumps',
        'All the maths sits in a plain TypeScript core with no Vue in it; the Vue 3 and Vue 2 adapters are thin, about 200 lines each',
        'User data is only ever read, never mutated; 283 tests, all passing'
      ]
    },
    // Chrome on a MacBook — the tree-view README and the write-up on dev-notes
    facts: [
      {value: {ru: '295', en: '295'}, label: {ru: 'элементов в DOM на сетке из 4095 матчей — без виртуализации их 36 899', en: 'DOM elements for a 4,095-match bracket — 36,899 without virtualization'}},
      {value: {ru: '4 мс', en: '4 ms'}, label: {ru: 'отрисовка той же сетки вместо 161 мс — в 40 раз быстрее', en: 'to render that bracket instead of 161 ms — 40× faster'}},
      {value: {ru: '16×', en: '16×'}, label: {ru: 'быстрее разбор сетки на 131 071 матч: обход был O(n²) из-за shift(), стал O(n) — 640 мс → 40 мс', en: 'faster parsing of a 131,071-match bracket: the walk was O(n²) because of shift(), now O(n) — 640 ms → 40 ms'}},
      {value: {ru: '5,9 мс', en: '5.9 ms'}, label: {ru: 'раскладка 16 383 матчей; 1023 матча — 0,3 мс', en: 'to lay out 16,383 matches; 1,023 take 0.3 ms'}}
    ],
    stack: ['TypeScript', 'Vue 3', 'Vue 2', 'Nuxt module', 'SVG', 'Vitest'],
    npm: 'https://www.npmjs.com/package/@bigplay/tree-view',
    repo: 'https://github.com/dadashi44/tree-view',
    links: [
      {
        label: {ru: 'Разбор', en: 'Write-up'},
        href: 'https://dev-notes-lilac-one.vercel.app/notes/tree-view-virtualization'
      }
    ],
    project: 'bigplay'
  },
  {
    pkg: 'vue-llm',
    name: 'vue-llm',
    tagline: {
      ru: 'AI SDK для Vue и Nuxt: стриминговый чат, вызов инструментов и модели прямо в браузере',
      en: 'The AI SDK for Vue and Nuxt: streaming chat, tool calling and in-browser models'
    },
    summary: {
      ru: 'useChat() со стримингом, вызовом инструментов и несколькими провайдерами — в 10 строк. Один API для OpenAI, Anthropic, Gemini и Ollama, а через WebGPU модель можно запустить на устройстве пользователя — без сервера и API-ключа.',
      en: 'useChat() with streaming, tool calling and multiple providers in 10 lines. One API for OpenAI, Anthropic, Gemini and Ollama, and with WebGPU the model can run on the user’s device — no server, no API key.'
    },
    highlights: {
      ru: [
        'Generative UI: вызовы инструментов рендерятся вашими Vue-компонентами, с потоковыми аргументами и подтверждением от человека',
        'Модели Llama, Qwen и SmolLM на WebGPU — данные не покидают устройство',
        'Вкладка LLM в Vue DevTools: таймлайн запросов, время до первого токена, вызовы инструментов и расход токенов',
        'Ноль runtime-зависимостей — только vue в peer; композаблы работают и на Vue 2.7'
      ],
      en: [
        'Generative UI: tool calls render as your own Vue components, with streamed arguments and human-in-the-loop',
        'Llama, Qwen and SmolLM on WebGPU — nothing leaves the device',
        'An LLM tab in Vue DevTools: request timeline, time to first token, tool calls and token usage',
        'Zero runtime dependencies — only vue as a peer; the composables also run on Vue 2.7'
      ]
    },
    stack: ['Vue 3', 'Vue 2.7', 'Nuxt module', 'TypeScript', 'SSE', 'WebGPU'],
    npm: 'https://www.npmjs.com/package/vue-llm',
    repo: 'https://github.com/dadashi44/vue-llm',
    links: [
      {label: {ru: 'Документация', en: 'Docs'}, href: 'https://vue-llm.js.org/'},
      {label: {ru: 'Песочница', en: 'Playground'}, href: 'https://vue-llm.js.org/playground'}
    ]
  }
]

export const resolveLibrary = (library: Library, locale: Locale): ResolvedLibrary => ({
  ...library,
  tagline: library.tagline[locale],
  summary: library.summary[locale],
  highlights: library.highlights[locale],
  facts: (library.facts ?? []).map(({value, label}) => ({value: value[locale], label: label[locale]})),
  badge: library.badge?.[locale],
  links: (library.links ?? []).map(({label, href}) => ({label: label[locale], href}))
})
