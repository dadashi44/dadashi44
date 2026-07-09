import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {ScrollToPlugin} from 'gsap/ScrollToPlugin'
import {SplitText} from 'gsap/SplitText'
import Lenis from 'lenis'
import {setMotion} from '~/composables/useMotion'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  gsap.defaults({ease: 'power3.out', duration: 0.9})
  gsap.config({nullTargetWarn: false})

  const lenis = new Lenis({
    duration: 1.1,
    lerp: 0.09,
    smoothWheel: !reduced,
    touchMultiplier: 1.6,
    autoRaf: false
  })

  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  setMotion({gsap, ScrollTrigger, SplitText, lenis, reduced})

  // keep triggers honest after route changes and late font loading
  nuxtApp.hook('page:finish', () => {
    lenis.scrollTo(0, {immediate: true})
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }
})
