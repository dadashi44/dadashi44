export default defineEventHandler((event) => {
  const {public: {siteUrl}} = useRuntimeConfig(event)
  // an empty NUXT_PUBLIC_SITE_URL would produce relative URLs here
  const site = String(siteUrl ?? '').trim().replace(/\/$/, '') || getRequestURL(event).origin

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site}/sitemap.xml`,
    ''
  ].join('\n')
})
