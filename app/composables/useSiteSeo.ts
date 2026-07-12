/** Absolute origin of the deployment, from NUXT_PUBLIC_SITE_URL. */
export const useSiteUrl = () => {
  const {public: {siteUrl}} = useRuntimeConfig()
  return String(siteUrl).replace(/\/$/, '')
}

export const useAbsoluteUrl = (path: string) => `${useSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`

/**
 * Canonical + Open Graph + Twitter for a page.
 * Locale alternates are handled separately by useLocaleHead() in app.vue.
 */
export const useSiteSeo = (options: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | undefined>
  type?: 'website' | 'article' | 'profile'
}) => {
  const route = useRoute()
  const {locale} = useI18n()
  const site = useSiteUrl()

  const canonical = computed(() => `${site}${route.path === '/' ? '' : route.path}` || site)
  const image = computed(() => {
    const value = toValue(options.image)
    return value ? `${site}${value}` : `${site}/og-image.png`
  })

  useHead({
    link: [{rel: 'canonical', href: canonical}]
  })

  useSeoMeta({
    title: () => toValue(options.title),
    description: () => toValue(options.description),
    ogType: options.type ?? 'website',
    ogTitle: () => toValue(options.title),
    ogDescription: () => toValue(options.description),
    ogUrl: () => canonical.value,
    ogImage: () => image.value,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: () => toValue(options.title),
    ogSiteName: 'Dauren Abasov — dadashi',
    ogLocale: () => (locale.value === 'en' ? 'en_US' : 'ru_RU'),
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(options.title),
    twitterDescription: () => toValue(options.description),
    twitterImage: () => image.value
  })
}

/** Injects a JSON-LD block. */
export const useJsonLd = (data: MaybeRefOrGetter<Record<string, unknown>>) => {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() => JSON.stringify(toValue(data)))
      }
    ]
  })
}
