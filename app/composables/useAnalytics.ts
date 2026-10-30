import type {PostHog} from 'posthog-js'

/**
 * PostHog lives in a module singleton, like the motion runtime, so the SDK can
 * stay lazily imported: callers never touch `posthog-js` directly.
 */
let client: PostHog | null = null
// errors thrown before the SDK finished loading, replayed once it is ready
const pendingErrors: unknown[] = []

export const setAnalytics = (posthog: PostHog) => {
  client = posthog
  pendingErrors.splice(0).forEach((error) => posthog.captureException(error))
}

/** Sends an error to PostHog error tracking; the first few before load are kept. */
export const captureError = (error: unknown) => {
  if (client) client.captureException(error)
  else if (pendingErrors.length < 10) pendingErrors.push(error)
}

/**
 * No-op on the server, in dev, without a key, and before the SDK loaded —
 * tracking must never break the feature it observes.
 */
export const track = (event: string, properties?: Record<string, unknown>) => {
  client?.capture(event, properties)
}
