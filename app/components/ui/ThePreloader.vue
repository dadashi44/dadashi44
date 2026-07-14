<script setup lang="ts">
const {introDone} = useAppState()
const root = ref<HTMLElement | null>(null)
const counter = ref<HTMLElement | null>(null)
const bar = ref<HTMLElement | null>(null)
const value = ref(0)
const hidden = ref(false)

const {tm, rt} = useI18n()
const words = computed(() => (tm('preloader.greetings') as unknown[]).map((w) => rt(w as string)))
const word = ref('')

onMounted(() => {
  word.value = words.value[0] ?? ''

  const api = useMotion()
  if (!api) {
    introDone.value = true
    hidden.value = true
    return
  }

  const {gsap, ScrollTrigger, lenis, reduced} = api

  if (reduced || sessionStorage.getItem('intro-played')) {
    introDone.value = true
    hidden.value = true
    return
  }

  lenis.stop()
  document.body.style.overflow = 'hidden'

  const counterProxy = {v: 0}
  const tl = gsap.timeline({
    onComplete: () => {
      sessionStorage.setItem('intro-played', '1')
      hidden.value = true
      introDone.value = true
      lenis.start()
      document.body.style.overflow = ''
      ScrollTrigger.refresh()
    }
  })

  tl.to(counterProxy, {
    v: 100,
    duration: 2,
    ease: 'power2.inOut',
    onUpdate: () => {
      value.value = Math.round(counterProxy.v)
      const list = words.value
      word.value = list[Math.min(list.length - 1, Math.floor((counterProxy.v / 100) * list.length))] as string
    }
  })
    .to(bar.value, {scaleX: 1, duration: 2, ease: 'power2.inOut'}, 0)
    .to([counter.value, bar.value], {autoAlpha: 0, duration: 0.4}, '>-0.1')
    .to(root.value, {
      yPercent: -100,
      duration: 1.1,
      ease: 'expo.inOut'
    })
})
</script>

<template>
  <div
    v-if="!hidden"
    ref="root"
    class="fixed inset-0 z-[90] flex flex-col justify-between bg-surface px-5 py-8 lg:px-10"
  >
    <div class="font-display text-sm uppercase tracking-[0.3em] text-ink-soft">Dauren Abasov</div>

    <div class="flex items-end justify-between gap-6">
      <span class="font-display text-headline leading-none text-ink">{{ word }}</span>
      <span ref="counter" class="font-display text-display leading-none text-ink">{{ value }}</span>
    </div>

    <div class="h-px w-full bg-line/20">
      <div ref="bar" class="h-full w-full origin-left scale-x-0 bg-ink" />
    </div>
  </div>
</template>
