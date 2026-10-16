/**
 * Absolute origin of the deployment.
 *
 * NUXT_PUBLIC_SITE_URL wins, but an env var that exists and is empty overrides
 * the config default with '' — which would emit relative canonical and og:url.
 * Falling back to the request origin keeps them absolute no matter what.
 */
export const useSiteUrl = () => {
  const {public: {siteUrl}} = useRuntimeConfig()
  const configured = String(siteUrl ?? '').trim().replace(/\/$/, '')
  return configured || useRequestURL().origin
}

export const useAbsoluteUrl = (path: string) => `${useSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`

/**
 * Canonical + Open Graph + Twitter for a page.
 * Locale alternates are handled separately by useLocaleHead() in app.vue.
 *
 * The share image is a card rendered by Takumi from components/OgImage —
 * nuxt-og-image sets og:image, its size and twitter:image itself.
 */
export const useSiteSeo = (options: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  type?: 'website' | 'article' | 'profile'
  /** extras for the share card: a small label and the case's own colours */
  card?: {title?: string; description?: string; eyebrow?: string; accent?: string; glow?: string}
}) => {
  const route = useRoute()
  const {locale, t} = useI18n()
  const site = useSiteUrl()

  const canonical = computed(() => `${site}${route.path === '/' ? '' : route.path}` || site)

  // crawlers read the server render only, so the values at setup are the ones that count
  defineOgImage('Site.takumi', {
    title: options.card?.title ?? toValue(options.title),
    description: options.card?.description ?? toValue(options.description),
    eyebrow: options.card?.eyebrow ?? '',
    footer: t('common.ogFooter'),
    ...(options.card?.accent && {accent: options.card.accent}),
    ...(options.card?.glow && {glow: options.card.glow})
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
    ogImageAlt: () => toValue(options.title),
    ogSiteName: 'Dauren Abasov — dadashi',
    ogLocale: () => (locale.value === 'en' ? 'en_US' : 'ru_RU'),
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(options.title),
    twitterDescription: () => toValue(options.description)
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
