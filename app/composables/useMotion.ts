import type gsapType from 'gsap'
import type {ScrollTrigger as ScrollTriggerType} from 'gsap/ScrollTrigger'
import type {SplitText as SplitTextType} from 'gsap/SplitText'
import type Lenis from 'lenis'

export interface MotionApi {
  gsap: typeof gsapType
  ScrollTrigger: typeof ScrollTriggerType
  SplitText: typeof SplitTextType
  lenis: Lenis
  reduced: boolean
}

/**
 * The animation runtime lives in a module singleton instead of `useNuxtApp()`,
 * so it can be read from transition hooks, watchers and directives — places
 * where the Nuxt instance is not guaranteed to be active.
 */
let motion: MotionApi | null = null

export const setMotion = (api: MotionApi) => {
  motion = api
}

/** Returns null on the server (and before the client plugin ran). */
export const useMotion = (): MotionApi | null => motion
