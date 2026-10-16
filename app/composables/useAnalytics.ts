import type {PostHog} from 'posthog-js'

/**
 * PostHog lives in a module singleton, like the motion runtime, so the SDK can
 * stay lazily imported: callers never touch `posthog-js` directly.
 */
let client: PostHog | null = null

export const setAnalytics = (posthog: PostHog) => {
  client = posthog
}

/**
 * No-op on the server, in dev, without a key, and before the SDK loaded —
 * tracking must never break the feature it observes.
 */
export const track = (event: string, properties?: Record<string, unknown>) => {
  client?.capture(event, properties)
}
