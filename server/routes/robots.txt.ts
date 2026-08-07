export default defineEventHandler((event) => {
  const {public: {siteUrl}} = useRuntimeConfig(event)
  const site = String(siteUrl).replace(/\/$/, '')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site}/sitemap.xml`,
    ''
  ].join('\n')
})
