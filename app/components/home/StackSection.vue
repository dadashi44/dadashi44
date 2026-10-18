<script setup lang="ts">
const rows = [
  ['HTML5', 'CSS3', 'SCSS', 'LESS', 'Tailwind', 'BEM', 'Cross-browser'],
  ['JavaScript', 'TypeScript', 'Vue 3', 'Vue 2', 'Nuxt 3', 'Pinia', 'Vuex'],
  ['SSR', 'REST API', 'vue-query', 'Axios', 'Quasar', 'Ionic', 'Ant Design'],
  ['Jest', 'Vitest', 'FSD', 'Core Web Vitals', 'JSON-LD', 'GSAP', 'Git']
]

const {t, locale} = useI18n()
const localePath = useLocalePath()
const {downloads} = useLibraries()

// one line instead of a whole section: the libraries themselves live on /work
const libraryDownloads = computed(() => {
  const total = Object.values(downloads.value ?? {}).reduce<number>((sum, n) => sum + (n ?? 0), 0)
  return total
    ? new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'ru-RU', {notation: 'compact', maximumFractionDigits: 1}).format(total)
    : null
})

const stats = [
  {value: '4', label: t('stats.years')},
  {value: '35', label: t('stats.ttfb')},
  {value: '93', label: t('stats.payload')},
  {value: '60', label: t('stats.pages')}
]

const statsRoot = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !statsRoot.value) return
  const {gsap} = api

  gsap.utils.toArray<HTMLElement>('[data-counter]', statsRoot.value).forEach((el) => {
    const raw = el.dataset.counter as string
    const target = parseInt(raw, 10)
    const suffix = raw.replace(/[0-9]/g, '')
    const proxy = {v: 0}

    gsap.to(proxy, {
      v: target,
      duration: 1.6,
      ease: 'expo.out',
      scrollTrigger: {trigger: el, start: 'top 90%', once: true},
      onUpdate: () => (el.textContent = `${Math.round(proxy.v)}${suffix}`)
    })
  })
})
</script>

<template>
  <section class="border-y border-line/15 py-20 lg:py-28">
    <div class="container">
      <SectionLabel index="04" :title="t('home.stackTitle')" />
    </div>

    <div class="space-y-4">
      <AppMarquee
        v-for="(row, i) in rows"
        :key="i"
        :items="row"
        :direction="i % 2 === 0 ? 1 : -1"
        :speed="40 + i * 12"
      >
        <template #default="{item}">
          <span class="font-display text-3xl uppercase tracking-tight text-ink/80 lg:text-5xl">{{ item }}</span>
        </template>
      </AppMarquee>
    </div>

    <div ref="statsRoot" class="container mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="border-t border-line/20 pt-5">
        <p :data-counter="stat.value" class="font-display text-6xl leading-none lg:text-7xl">0</p>
        <p class="mt-3 text-sm text-ink-soft">{{ stat.label }}</p>
      </div>
    </div>

    <div v-if="libraryDownloads" class="container mt-12">
      <NuxtLink
        v-cursor="'link'"
        :to="`${localePath('/work')}#open-source`"
        class="group inline-flex items-center gap-3 text-sm text-ink-soft transition-colors duration-300 hover:text-ink"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-accent" />
        {{ t('home.openSourceTeaser', {downloads: libraryDownloads}) }}
        <span class="transition-transform duration-500 ease-expo group-hover:translate-x-1">→</span>
      </NuxtLink>
    </div>
  </section>
</template>
