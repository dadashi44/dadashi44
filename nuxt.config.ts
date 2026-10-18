// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {enabled: true},

  devServer: {
    port: 5050
  },

  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt', '@nuxt/fonts', '@nuxtjs/i18n', 'nuxt-og-image'],

  // nuxt-og-image builds absolute image URLs from this
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://dadashi44.vercel.app',
    name: 'Dauren Abasov — dadashi'
  },

  ogImage: {
    // cards are rendered on demand by Takumi and kept by the CDN for a week
    defaults: {width: 1200, height: 630, cacheMaxAgeSeconds: 60 * 60 * 24 * 7}
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://dadashi44.vercel.app',
    defaultLocale: 'ru',
    // RU lives at /, EN at /en/* — good for indexing both versions
    strategy: 'prefix_except_default',
    locales: [
      {code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json'},
      {code: 'en', language: 'en-US', name: 'English', file: 'en.json'}
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'dadashi-lang',
      redirectOn: 'root',
      alwaysRedirect: false
    }
  },

  css: ['~/assets/css/main.css'],

  components: [{path: '~/components', pathPrefix: false}],

  runtimeConfig: {
    // set via NUXT_TELEGRAM_BOT_TOKEN / NUXT_TELEGRAM_CHAT_ID — never commit real values
    telegramBotToken: '',
    telegramChatId: '',
    // channels whose pinned PDFs are served as /resume.pdf and /resume-en.pdf
    // (NUXT_TELEGRAM_RESUME_CHAT_ID / NUXT_TELEGRAM_RESUME_EN_CHAT_ID). Private chats
    // don't expose pins to bots, so these have to be channels or groups.
    telegramResumeChatId: '',
    telegramResumeEnChatId: '',
    public: {
      // absolute origin used for canonical, og:url, hreflang and the sitemap
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://dadashi44.vercel.app',
      // set via NUXT_PUBLIC_POSTHOG_KEY / NUXT_PUBLIC_POSTHOG_HOST; analytics stay off without a key
      posthogKey: '',
      posthogHost: 'https://eu.i.posthog.com'
    }
  },

  fonts: {
    families: [
      // global: the OG renderer reads fonts from here too; cyrillic for the Russian cards
      {name: 'Inter', provider: 'google', weights: [300, 400, 500, 600, 700], subsets: ['latin', 'cyrillic'], global: true},
      {name: 'Bebas Neue', provider: 'google', weights: [400], global: true}
    ]
  },

  app: {
    head: {
      titleTemplate: '%s',
      meta: [
        {charset: 'utf-8'},
        {name: 'viewport', content: 'width=device-width, initial-scale=1'},
        {name: 'theme-color', content: '#080808'},
        {name: 'format-detection', content: 'telephone=no'}
      ],
      link: [
        {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
        {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48'},
        {rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180'},
        {rel: 'manifest', href: '/site.webmanifest'}
      ]
    },
    pageTransition: false,
    layoutTransition: false
  },

  typescript: {
    strict: true
  },

  hooks: {
    /**
     * three.js is only needed by the 3D scene on the error pages. Nuxt would
     * otherwise prefetch that ~630 KB chunk on every route "just in case".
     */
    'build:manifest'(manifest) {
      for (const entry of Object.values(manifest)) {
        const touchesScene = (value?: string) => !!value && /SpaceScene|three/i.test(value)

        if (touchesScene(entry.src) || touchesScene(entry.file)) {
          entry.prefetch = false
          entry.preload = false
        }

        if (entry.dynamicImports?.length) {
          entry.dynamicImports = entry.dynamicImports.filter((key) => !touchesScene(key))
        }
      }
    }
  }
})
