<script setup lang="ts">
const {menuOpen} = useAppState()
const {t} = useI18n()
const localePath = useLocalePath()
const header = ref<HTMLElement | null>(null)
const route = useRoute()

const links = computed(() => [
  {label: t('nav.work'), to: localePath('/work')},
  {label: t('nav.about'), to: localePath('/about')},
  {label: t('nav.contact'), to: localePath('/contact')}
])

onMounted(() => {
  const api = useMotion()
  if (!api || !header.value) return
  const {gsap, ScrollTrigger} = api

  const show = gsap.from(header.value, {yPercent: -100, paused: true, duration: 0.5}).progress(1)

  const st = ScrollTrigger.create({
    start: 'top -120',
    end: 'max',
    onUpdate: (self: any) => {
      if (menuOpen.value) return
      self.direction === -1 ? show.play() : show.reverse()
    },
    onLeaveBack: () => show.play()
  })

  onBeforeUnmount(() => st.kill())
})

watch(
  menuOpen,
  (open) => {
    const api = useMotion()
    if (!api) return
    open ? api.lenis.stop() : api.lenis.start()
  },
  {flush: 'post'}
)
</script>

<template>
  <header
    ref="header"
    class="fixed inset-x-0 top-0 z-[80] border-b border-line/10 bg-surface/70 backdrop-blur-md"
  >
    <div class="container flex h-16 items-center justify-between lg:h-20">
      <NuxtLink
        v-cursor="'link'"
        :to="localePath('/')"
        class="group flex items-center gap-3"
        @click="menuOpen = false"
      >
        <span class="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-ink">
          <span class="font-display text-sm leading-none text-surface">D</span>
        </span>
        <span class="font-display text-sm uppercase tracking-[0.28em]">dadashi</span>
      </NuxtLink>

      <nav class="hidden items-center gap-9 md:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          v-cursor="'link'"
          :to="link.to"
          class="link-underline text-sm uppercase tracking-[0.18em]"
          :class="route.path.startsWith(link.to) ? 'text-ink' : 'text-ink-soft hover:text-ink'"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2 sm:gap-3">
        <LangSwitch />
        <ThemeToggle />
        <button
          v-cursor="'link'"
          type="button"
          class="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border border-line/25 md:hidden"
          :aria-expanded="menuOpen"
          :aria-label="t('nav.toggleMenu')"
          @click="menuOpen = !menuOpen"
        >
          <span
            class="block h-px w-4 bg-ink transition-transform duration-500 ease-expo"
            :class="menuOpen ? 'translate-y-[3px] rotate-45' : ''"
          />
          <span
            class="block h-px w-4 bg-ink transition-transform duration-500 ease-expo"
            :class="menuOpen ? '-translate-y-[3px] -rotate-45' : ''"
          />
        </button>
      </div>
    </div>
  </header>
</template>
