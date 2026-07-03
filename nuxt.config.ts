// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {enabled: true},

  devServer: {
    port: 5050
  },

  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt', '@nuxt/fonts', '@nuxtjs/i18n'],

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://dadashiii.netlify.app',
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
    public: {
      // absolute origin used for canonical, og:url, hreflang and the sitemap
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://dadashiii.netlify.app'
    }
  },

  fonts: {
    families: [
      {name: 'Inter', provider: 'google', weights: [300, 400, 500, 600, 700]},
      {name: 'Bebas Neue', provider: 'google', weights: [400]}
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
