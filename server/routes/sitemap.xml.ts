import {projects} from '../../app/data/projects'

const LOCALES = ['ru', 'en'] as const
const STATIC_PATHS = ['/', '/work', '/about', '/contact']

/** RU lives at /, EN under /en — mirrors the i18n `prefix_except_default` strategy. */
const localized = (path: string, locale: (typeof LOCALES)[number]) =>
  locale === 'ru' ? path : `/en${path === '/' ? '' : path}`

export default defineEventHandler((event) => {
  const {public: {siteUrl}} = useRuntimeConfig(event)
  // an empty NUXT_PUBLIC_SITE_URL would produce relative URLs here
  const site = String(siteUrl ?? '').trim().replace(/\/$/, '') || getRequestURL(event).origin

  const paths = [...STATIC_PATHS, ...projects.map((p) => `/work/${p.slug}`)]
  const lastmod = new Date().toISOString().slice(0, 10)

  const urls = paths.flatMap((path) =>
    LOCALES.map((locale) => {
      const alternates = LOCALES.map(
        (alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${site}${localized(path, alt)}"/>`
      ).join('\n')

      return [
        '  <url>',
        `    <loc>${site}${localized(path, locale)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${path === '/' ? 'weekly' : 'monthly'}</changefreq>`,
        `    <priority>${path === '/' ? '1.0' : path.startsWith('/work/') ? '0.7' : '0.8'}</priority>`,
        alternates,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${site}${localized(path, 'ru')}"/>`,
        '  </url>'
      ].join('\n')
    })
  )

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    ''
  ].join('\n')
})
