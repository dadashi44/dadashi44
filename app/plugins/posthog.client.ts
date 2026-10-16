/**
 * Product analytics: pageviews, clicks (autocapture) and visitor geo.
 *
 * Disabled until NUXT_PUBLIC_POSTHOG_KEY is set, and never runs in dev so
 * local clicking around doesn't pollute the numbers. The SDK is imported
 * lazily, after hydration, to keep it off the critical path.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const {posthogKey, posthogHost} = useRuntimeConfig().public
  if (import.meta.dev || !posthogKey) return

  nuxtApp.hook('app:suspense:resolve', async () => {
    const {default: posthog} = await import('posthog-js')

    posthog.init(posthogKey, {
      api_host: posthogHost,
      // SPA route changes count as pageviews too
      capture_pageview: 'history_change',
      person_profiles: 'identified_only'
    })

    setAnalytics(posthog)
  })
})
