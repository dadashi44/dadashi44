<script setup lang="ts">
const {t, tm, rt} = useI18n()
const localePath = useLocalePath()
const {introDone} = useAppState()

const root = ref<HTMLElement | null>(null)
const roleEl = ref<HTMLElement | null>(null)
const videoWrap = ref<HTMLElement | null>(null)

const roles = computed(() => (tm('home.roles') as unknown[]).map((r) => rt(r as string)))
/** the list renders roles + a duplicate of the first one for a seamless loop */
const roleItems = computed(() => [...roles.value, roles.value[0] ?? ''])

onMounted(() => {
  const api = useMotion()
  if (!api || !root.value) return
  const {gsap, SplitText, reduced} = api

  let intro: gsap.core.Timeline | null = null
  const playIntro = () => {
    if (introDone.value) intro?.play()
  }
  // registered synchronously so it survives the async font wait below
  const stopWatch = watch(introDone, playIntro)

  const ctx = gsap.context(() => {
    gsap.set('[data-hero-line]', {autoAlpha: 1})

    const build = () => {
      const tl = gsap.timeline({paused: true, defaults: {ease: 'expo.out'}})

      root.value!.querySelectorAll('[data-hero-line]').forEach((line, i) => {
        const split = new SplitText(line as HTMLElement, {type: 'chars,words', mask: 'words'})
        tl.from(split.chars, {yPercent: 120, duration: 1.1, stagger: 0.025}, i * 0.12)
      })

      tl.from('[data-hero-meta]', {y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.1}, 0.5).from(
        '[data-hero-media]',
        {clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut'},
        0.3
      )

      intro = tl
      playIntro()
    }

    document.fonts?.ready ? document.fonts.ready.then(build) : build()

    // Rotating role. yPercent is relative to the whole strip, so one step is
    // 100 / itemCount — using -100 per step would scroll the list clean away.
    if (!reduced && roleEl.value) {
      const count = roleItems.value.length
      const step = 100 / count
      const rotate = gsap.timeline({repeat: -1, repeatDelay: 1.8, delay: 1.6})

      roles.value.forEach((_, i) => {
        rotate.to(roleEl.value, {yPercent: -step * (i + 1), duration: 0.7, ease: 'expo.inOut'}, i === 0 ? 0 : '>1.8')
      })
      rotate.set(roleEl.value, {yPercent: 0})
    }

    // parallax the video inside its mask so no edge is ever exposed
    gsap.fromTo(
      videoWrap.value!.querySelector('video'),
      {yPercent: -5},
      {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {trigger: videoWrap.value, start: 'top bottom', end: 'bottom top', scrub: true}
      }
    )
  }, root.value)

  onBeforeUnmount(() => {
    stopWatch()
    ctx.revert()
  })
})
</script>

<template>
  <section ref="root" class="relative pt-16 lg:pt-24">
    <div class="container">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <p data-hero-meta class="max-w-xs text-sm leading-relaxed text-ink-soft">
          {{ t('home.heroIntro') }}
        </p>
        <p data-hero-meta class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">
          {{ t('home.heroStatus') }}
        </p>
      </div>

      <h1 class="mt-10 font-display uppercase leading-[0.82] tracking-tight">
        <span data-hero-line class="invisible block text-display">Dauren</span>
        <span data-hero-line class="invisible block pl-[8vw] text-display">Abasov</span>
      </h1>

      <div class="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-line/15 pt-6">
        <div class="flex items-baseline gap-3 text-lg lg:text-2xl">
          <span class="text-ink-soft">{{ t('home.heroRolePrefix') }}</span>
          <span class="relative block h-[1.3em] overflow-hidden">
            <span ref="roleEl" class="block will-change-transform">
              <span
                v-for="(role, i) in roleItems"
                :key="`${role}-${i}`"
                class="block h-[1.3em] whitespace-nowrap font-medium"
              >
                {{ role }}
              </span>
            </span>
          </span>
        </div>

        <div data-hero-meta class="flex items-center gap-4">
          <ArrowLink :to="localePath('/work')" :label="t('home.selectedWork')" />
          <ArrowLink :to="localePath('/contact')" :label="t('home.sayHello')" />
        </div>
      </div>
    </div>

    <div data-hero-media class="mt-14 overflow-hidden lg:mt-20">
      <div ref="videoWrap" class="h-[46vh] w-full lg:h-[78vh]">
        <video
          class="h-full w-full scale-110 object-cover"
          src="/banner.mp4"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
        />
      </div>
    </div>
  </section>
</template>
