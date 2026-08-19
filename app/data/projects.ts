export type ProjectKind = 'web' | 'mobile'
export type Locale = 'ru' | 'en'

/** Every author-written string carries both languages. */
export interface Localized<T = string> {
  ru: T
  en: T
}

export interface Project {
  slug: string
  name: string
  client: Localized
  year: string
  kind: ProjectKind
  role: Localized
  summary: Localized
  description: Localized<string[]>
  contribution: Localized<string[]>
  stack: string[]
  href: string
  status: 'production' | 'in development'
  /** optional screenshot in /public/works — mobile projects also use `<name>-mobile.webp` */
  image?: string
  palette: {from: string; to: string; ink: string}
}

/** A project with every localized field already resolved to a plain string. */
export interface ResolvedProject
  extends Omit<Project, 'client' | 'role' | 'summary' | 'description' | 'contribution'> {
  client: string
  role: string
  summary: string
  description: string[]
  contribution: string[]
}

export const projects: Project[] = [
  {
    slug: 'bigplay',
    name: 'BIGPLAY',
    client: {ru: 'Bigplay.gg · Казахстан', en: 'Bigplay.gg · Kazakhstan'},
    year: '2024 — н.в.',
    kind: 'web',
    role: {ru: 'Frontend-разработчик @ Bigplay.gg', en: 'Frontend developer @ Bigplay.gg'},
    summary: {
      ru: 'Киберспортивная платформа для мобильных игр: еженедельные турниры по PUBG Mobile и MLBB с годовым призовым фондом $30 000, медиа, рейтинги и голосования.',
      en: 'An esports platform for mobile games: weekly PUBG Mobile and MLBB tournaments with a $30,000 yearly prize pool, plus media, ratings and polls.'
    },
    description: {
      ru: [
        'BIGPLAY проводит регулярные турниры по PUBG Mobile и Mobile Legends: Bang Bang для русскоязычной аудитории. Публичная часть на Nuxt 3, админ-панель — легаси на Vue 2.',
        'Здесь я не только пишу фичи, но и разбираюсь с наследством: производительность, архитектура, SEO и безопасность. Платформа живёт под нагрузкой турнирных дней, поэтому каждая лишняя сотня килобайт видна в метриках.'
      ],
      en: [
        'BIGPLAY runs regular PUBG Mobile and Mobile Legends: Bang Bang tournaments for a Russian-speaking audience. The public site is Nuxt 3; the admin panel is legacy Vue 2.',
        'Beyond shipping features, I deal with the inherited codebase: performance, architecture, SEO and security. The platform takes real load on tournament days, so every extra hundred kilobytes shows up in the metrics.'
      ]
    },
    contribution: {
      ru: [
        'Перенос запросов на SSR средствами Nuxt 3 — TTFB ниже на 35%',
        'Поиск утечки памяти через fuite.js: payload с 3000 КБ до 200 КБ (−93%)',
        'Полный редизайн: собственный UI-kit с нуля, 40+ страниц и 20 виджетов',
        'Турнирная сетка вынесена в npm-пакет @bigplay/vue-tree-view (Vue 2 и 3) — минус 1000+ строк из ядра',
        'LCP и CLS: WebP/AVIF, ленивая загрузка, critical CSS, фиксированные размеры блоков',
        'JSON-LD (Article, NewsArticle, Organization, ImageObject) и заголовки HSTS, CSP, X-Frame-Options'
      ],
      en: [
        'Moved requests to SSR with Nuxt 3 utilities — 35% lower TTFB',
        'Tracked a memory leak with fuite.js: payload from 3000 KB down to 200 KB (−93%)',
        'Full redesign: a UI kit built from scratch, 40+ pages and 20 widgets reworked',
        'Extracted the tournament bracket into the @bigplay/vue-tree-view npm package (Vue 2 & 3), removing 1000+ lines from the core',
        'LCP and CLS work: WebP/AVIF, lazy loading, critical CSS, fixed block dimensions',
        'JSON-LD (Article, NewsArticle, Organization, ImageObject) plus HSTS, CSP and X-Frame-Options headers'
      ]
    },
    stack: ['Nuxt 3', 'Vue 3', 'Vue 2', 'TypeScript', 'Pinia', 'SSR', 'SCSS'],
    href: 'https://bigplay.gg',
    image: '/works/bigplay.webp',
    status: 'production',
    palette: {from: '#0a1030', to: '#2f4bd8', ink: '#eef1ff'}
  },
  {
    slug: 'mega',
    name: 'MEGA',
    client: {ru: 'ТРЦ MEGA · Казахстан', en: 'MEGA malls · Kazakhstan'},
    year: '2023',
    kind: 'web',
    role: {ru: 'Frontend-разработчик @ Elefanto', en: 'Frontend developer @ Elefanto'},
    summary: {
      ru: 'Портал сети торгово-развлекательных центров MEGA: магазины, кино, афиша событий и акции по всем городам Казахстана.',
      en: 'The portal of the MEGA shopping and entertainment centre network: stores, cinema, events and promotions across every city in Kazakhstan.'
    },
    description: {
      ru: [
        'MEGA — крупнейшая сеть торгово-развлекательных центров Казахстана. Сайт объединяет каталог арендаторов, афишу кинотеатров, события и акции сразу для нескольких городов.',
        'Основная сложность — большие каталоги с фильтрацией по этажам, категориям и городам, которые должны оставаться быстрыми на мобильных устройствах и хорошо индексироваться поисковиками.'
      ],
      en: [
        'MEGA is the largest shopping and entertainment network in Kazakhstan. The site brings together the tenant catalogue, cinema listings, events and promotions for several cities at once.',
        'The hard part is the large catalogues with filtering by floor, category and city — they have to stay fast on mobile and index well in search.'
      ]
    },
    contribution: {
      ru: [
        'Свёрстаны и подключены разделы каталога магазинов, афиши и акций',
        'Переключение городов с сохранением состояния и SSR-выдачей',
        'Фильтры и поиск с дебаунсом и синхронизацией с query-параметрами',
        'Адаптив от 320px, оптимизация изображений и Core Web Vitals'
      ],
      en: [
        'Built and wired up the store catalogue, cinema listings and promotions sections',
        'City switching that keeps state and still renders on the server',
        'Debounced filters and search synced with query parameters',
        'Responsive from 320px, image optimisation and Core Web Vitals work'
      ]
    },
    stack: ['Vue 3', 'Nuxt', 'TypeScript', 'Pinia', 'SSR', 'SCSS'],
    href: 'https://mega.kz',
    image: '/works/mega.webp',
    status: 'production',
    palette: {from: '#1f2a63', to: '#5b6bd6', ink: '#f4f5ff'}
  },
  {
    slug: 'tanda',
    name: 'TANDA',
    client: {ru: 'Tanda.kg · Кыргызстан', en: 'Tanda.kg · Kyrgyzstan'},
    year: '2022',
    kind: 'web',
    role: {ru: 'Frontend-разработчик', en: 'Frontend developer'},
    summary: {
      ru: 'Маркетплейс с рассрочкой: электроника, бытовая техника, одежда, кабинет продавца и оформление заказа в кредит.',
      en: 'A marketplace with instalment payments: electronics, home appliances, clothing, a seller dashboard and credit checkout.'
    },
    description: {
      ru: [
        'Tanda.kg — бишкекский онлайн-маркетплейс с широким ассортиментом и покупкой в рассрочку до 12 месяцев.',
        'Проект живёт вокруг каталога: тысячи товаров, категории, варианты, корзина, избранное и многошаговый чекаут с кредитными сценариями.'
      ],
      en: [
        'Tanda.kg is a Bishkek-based online marketplace with a broad range of goods and instalment plans of up to 12 months.',
        'Everything revolves around the catalogue: thousands of products, categories, variants, cart, wishlist and a multi-step checkout with credit scenarios.'
      ]
    },
    contribution: {
      ru: [
        'Каталог, карточка товара, корзина и избранное',
        'Многошаговый чекаут с рассрочкой и валидацией форм',
        'Кабинет продавца: заявки, товары, статусы модерации',
        'Кеширование запросов и скелетоны вместо спиннеров'
      ],
      en: [
        'Catalogue, product page, cart and wishlist',
        'Multi-step checkout with instalments and form validation',
        'Seller dashboard: applications, products, moderation states',
        'Request caching and skeletons instead of spinners'
      ]
    },
    stack: ['React', 'Next.js', 'TypeScript', 'SCSS', 'REST API'],
    href: 'https://tanda.kg',
    image: '/works/tanda.webp',
    status: 'production',
    palette: {from: '#6d1f4a', to: '#e0507f', ink: '#fff2f6'}
  },
  {
    slug: 'integro',
    name: 'INTEGRO',
    client: {ru: 'Integro · Казахстан', en: 'Integro · Kazakhstan'},
    year: '2024',
    kind: 'web',
    role: {ru: 'Frontend-разработчик', en: 'Frontend developer'},
    summary: {
      ru: 'Сайт разработчика госрешений: платформа городских услуг, Smart-школа, электронный детский сад и облачный документооборот.',
      en: 'The site of a govtech vendor: a city services platform, Smart School, digital kindergarten and cloud document workflow.'
    },
    description: {
      ru: [
        'Integro — казахстанская компания с 15-летней историей, 26 патентами и 250+ государственными проектами: цифровизация городских сервисов, школ и документооборота.',
        'Задача сайта — понятно рассказать про четыре продуктовые линейки и превратить сложный B2G-продукт в читаемую презентацию.'
      ],
      en: [
        'Integro is a Kazakh company with 15 years of history, 26 patents and 250+ government projects digitising city services, schools and document workflow.',
        'The site had to explain four product lines clearly and turn a complex B2G offering into a readable presentation.'
      ]
    },
    contribution: {
      ru: [
        'Продуктовые страницы платформ с анимацией по скроллу',
        'Секции цифр и кейсов со счётчиками на GSAP ScrollTrigger',
        'Формы заявки с валидацией и защитой от спама',
        'Мультиязычность и SEO-разметка'
      ],
      en: [
        'Product pages for each platform with scroll-driven motion',
        'Stats and case sections with counters powered by GSAP ScrollTrigger',
        'Enquiry forms with validation and spam protection',
        'Multi-language support and SEO markup'
      ]
    },
    stack: ['Nuxt 3', 'TypeScript', 'SCSS', 'i18n'],
    href: 'https://integro.kz',
    image: '/works/integro.webp',
    status: 'production',
    palette: {from: '#0d3b4f', to: '#1fa6a6', ink: '#effcfb'}
  },
  {
    slug: 'norma-paint',
    name: 'NORMA',
    client: {ru: 'Norma Paint · Казахстан', en: 'Norma Paint · Kazakhstan'},
    year: '2024',
    kind: 'web',
    role: {ru: 'Frontend-разработчик', en: 'Frontend developer'},
    summary: {
      ru: 'Сайт завода лакокрасочных материалов: каталог красок и грунтовок, подбор цвета, советы по ремонту и новости бренда.',
      en: 'The site of a paint factory: a catalogue of paints and primers, colour matching, renovation guides and brand news.'
    },
    description: {
      ru: [
        'Norma — производитель красок и грунтовок в Казахстане. На сайте — каталог продукции, колеровка в пастельные тона, калькулятор количества и блог с советами по ремонту.',
        'Отдельный акцент — визуальный подбор цвета и понятная навигация по линейкам Arctic, Fronta, Stronga, Relack и Extra.'
      ],
      en: [
        'Norma manufactures paints and primers in Kazakhstan. The site holds the product catalogue, pastel colour tinting, a coverage calculator and a blog with renovation advice.',
        'The focus is visual colour matching and clear navigation across the Arctic, Fronta, Stronga, Relack and Extra lines.'
      ]
    },
    contribution: {
      ru: [
        'Каталог продукции с фильтрами по типу работ и поверхности',
        'Подбор цвета и калькулятор расхода краски',
        'Разделы новостей и советов с CMS-контентом',
        'Две языковые версии (RU / KZ) и адаптив'
      ],
      en: [
        'Product catalogue with filters by job type and surface',
        'Colour matching and a paint coverage calculator',
        'News and advice sections driven by CMS content',
        'Two language versions (RU / KZ) and responsive layout'
      ]
    },
    stack: ['Nuxt 3', 'JavaScript', 'SCSS', 'i18n', 'CMS'],
    href: 'https://norma-paint.kz/?lang=ru',
    image: '/works/norma-paint.webp',
    status: 'production',
    palette: {from: '#5a3a12', to: '#e3a02a', ink: '#fff8ec'}
  },
  {
    slug: 'mbulak',
    name: 'M BULAK',
    client: {ru: 'МКК «М Булак» · Кыргызстан', en: 'M Bulak microfinance · Kyrgyzstan'},
    year: '2024',
    kind: 'web',
    role: {ru: 'Frontend-разработчик', en: 'Frontend developer'},
    summary: {
      ru: 'Сайт микрокредитной компании: классические займы, исламское финансирование, онлайн-оплата и программа «Надёжный клиент».',
      en: 'The site of a microfinance company: conventional loans, Islamic financing, online repayment and a loyalty programme.'
    },
    description: {
      ru: [
        'М Булак — микрокредитная компания, работающая по лицензии Нацбанка КР с 2005 года, с сетью отделений по всему Кыргызстану.',
        'Финансовый продукт требует предельной ясности: калькулятор займа, прозрачные условия, отделения на карте и доступность для пользователей любого возраста.'
      ],
      en: [
        'M Bulak is a microfinance company licensed by the National Bank of Kyrgyzstan since 2005, with branches across the country.',
        'A financial product demands absolute clarity: a loan calculator, transparent terms, branches on a map and accessibility for users of any age.'
      ]
    },
    contribution: {
      ru: [
        'Калькулятор займа с расчётом графика платежей',
        'Страницы кредитных продуктов и исламского финансирования',
        'Карта отделений с поиском по городу и фильтрами',
        'Доступность (a11y), контраст и работа с клавиатуры'
      ],
      en: [
        'Loan calculator with a payment schedule',
        'Pages for credit products and Islamic financing',
        'Branch map with city search and filters',
        'Accessibility, contrast and full keyboard support'
      ]
    },
    stack: ['React', 'Next.js', 'TypeScript', 'SCSS', 'Maps'],
    href: 'https://mbulak.kg/ru',
    image: '/works/mbulak.webp',
    status: 'production',
    palette: {from: '#13432b', to: '#3fbf7f', ink: '#effff6'}
  },
  {
    slug: 'tumar',
    name: 'TUMAR',
    client: {ru: 'Tumar · Кыргызстан', en: 'Tumar · Kyrgyzstan'},
    year: '2024',
    kind: 'mobile',
    role: {ru: 'Frontend / mobile-разработчик', en: 'Frontend / mobile developer'},
    summary: {
      ru: 'Мобильное приложение системы электронного документооборота и налогового кабинета: ЭСФ, ЭДО и отчётность с ЭЦП.',
      en: 'A mobile app for an electronic document workflow and tax office system: e-invoices, EDI and reporting signed with a digital signature.'
    },
    description: {
      ru: [
        'Tumar объединяет государство, банки и бизнес: внешний и внутренний документооборот, электронные счета-фактуры и налоговые отчёты в одной экосистеме.',
        'В мобильном приложении бизнес подписывает документы ЭЦП «Кызмат» и Рутокен, следит за статусами ЭСФ и налоговым календарём прямо с телефона.'
      ],
      en: [
        'Tumar connects the state, banks and businesses: external and internal document flow, electronic invoices and tax reports in a single ecosystem.',
        'In the mobile app, businesses sign documents with Kyzmat and Rutoken certificates and track invoice states and the tax calendar straight from the phone.'
      ]
    },
    contribution: {
      ru: [
        'Экраны документооборота: входящие, исходящие, статусы подписания',
        'Подписание документов ЭЦП и работа с сертификатами',
        'Оффлайн-кеш списков и оптимистичные обновления',
        'Пуш-уведомления о дедлайнах налогового календаря'
      ],
      en: [
        'Document flow screens: inbox, outbox, signing states',
        'Signing documents with digital certificates',
        'Offline list caching and optimistic updates',
        'Push notifications for tax calendar deadlines'
      ]
    },
    stack: ['Quasar', 'TypeScript', 'REST API', 'iOS / Android'],
    href: 'https://tumar.app',
    image: '/works/tumar.webp',
    status: 'production',
    palette: {from: '#1b2140', to: '#6c63ff', ink: '#f2f1ff'}
  },
  {
    slug: 'hft',
    name: 'HFT',
    client: {ru: 'HFT · Казахстан', en: 'HFT · Kazakhstan'},
    year: '2025',
    kind: 'mobile',
    role: {ru: 'Frontend / mobile-разработчик', en: 'Frontend / mobile developer'},
    summary: {
      ru: 'Первое в Казахстане приложение для охоты и рыбалки: онлайн-путёвки, карты угодий с навигацией и цифровой сейф документов.',
      en: "Kazakhstan's first hunting and fishing app: online permits, hunting-ground maps with navigation and a digital document safe."
    },
    description: {
      ru: [
        'HFT — мобильное приложение для организации охоты, рыбалки и туризма: покупка и оплата путёвок онлайн, точные карты угодий, маршруты и туры с сопровождением.',
        'Ключевая часть — цифровой сейф, в котором хранятся лицензии и разрешения, доступные даже без связи в поле.'
      ],
      en: [
        'HFT is a mobile app for organising hunting, fishing and tourism: buying and paying for permits online, accurate ground maps, routes and guided tours.',
        'The core piece is a digital safe holding licences and permits, available even with no signal in the field.'
      ]
    },
    contribution: {
      ru: [
        'Карты угодий с геолокацией, маршрутами и оффлайн-тайлами',
        'Покупка и оплата путёвок, история и статусы',
        'Цифровой сейф документов с локальным шифрованным хранилищем',
        'Дизайн-система приложения и анимации переходов'
      ],
      en: [
        'Ground maps with geolocation, routes and offline tiles',
        'Permit purchase and payment, history and states',
        'Digital document safe backed by encrypted local storage',
        "The app's design system and transition animations"
      ]
    },
    stack: ['Ionic', 'TypeScript', 'Capacitor', 'iOS / Android'],
    href: 'https://hft.kz',
    image: '/works/hft.webp',
    status: 'production',
    palette: {from: '#2b3a1c', to: '#8fbf3f', ink: '#f6ffe8'}
  }
]

export const resolveProject = (project: Project, locale: Locale): ResolvedProject => ({
  ...project,
  client: project.client[locale],
  role: project.role[locale],
  summary: project.summary[locale],
  description: project.description[locale],
  contribution: project.contribution[locale]
})
