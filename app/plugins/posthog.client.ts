/**
 * Product analytics: pageviews, clicks (autocapture) and visitor geo.
 *
 * Disabled until NUXT_PUBLIC_POSTHOG_KEY is set, and never runs in dev so
 * local clicking around doesn't pollute the numbers. The SDK is imported
 * lazily, after hydration, to keep it off the critical path.
 */
// matches "/en" and "/en/..." but not "/english"
const EN_PREFIX = /^\/en(?=\/|$)\/?/

export default defineNuxtPlugin((nuxtApp) => {
  const {posthogKey, posthogHost} = useRuntimeConfig().public
  if (import.meta.dev || !posthogKey) return

  nuxtApp.hook('app:suspense:resolve', async () => {
    const {default: posthog} = await import('posthog-js')

    posthog.init(posthogKey, {
      api_host: posthogHost,
      // SPA route changes count as pageviews too
      capture_pageview: 'history_change',
      person_profiles: 'identified_only',
      // /en/about and /about are the same page: report the path without the
      // locale prefix and carry the language as a property on every event
      before_send: (event) => {
        if (!event) return event
        const props = event.properties
        const pathname: string = props.$pathname ?? location.pathname
        const match = pathname.match(EN_PREFIX)
        props.locale = match ? 'en' : 'ru'
        if (match) {
          props.$pathname = pathname.replace(EN_PREFIX, '/')
          if (props.$current_url) {
            const url = new URL(props.$current_url)
            url.pathname = url.pathname.replace(EN_PREFIX, '/')
            props.$current_url = url.href
          }
        }
        return event
      }
    })

    setAnalytics(posthog)
  })
})
