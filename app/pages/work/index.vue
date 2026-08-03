<script setup lang="ts">
const {t} = useI18n()
const {list: projects} = useProjects()

useSiteSeo({
  title: () => t('work.seoTitle'),
  description: () => t('work.seoDescription')
})

type Filter = 'all' | 'web' | 'mobile'
const filter = ref<Filter>('all')
const view = ref<'grid' | 'list'>('grid')

const filters = computed<{key: Filter; label: string}[]>(() => [
  {key: 'all', label: t('work.filterAll')},
  {key: 'web', label: t('work.filterWeb')},
  {key: 'mobile', label: t('work.filterMobile')}
])

const visible = computed(() =>
  filter.value === 'all' ? projects.value : projects.value.filter((p) => p.kind === filter.value)
)

const listRoot = ref<HTMLElement | null>(null)

watch([filter, view], async () => {
  await nextTick()
  const api = useMotion()
  if (!api || !listRoot.value) return
  api.gsap.from(listRoot.value.children, {
    y: 24,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.05,
    ease: 'expo.out'
  })
  api.ScrollTrigger.refresh()
})
</script>

<template>
  <div>
    <PageHero
      index="01"
      :title="t('work.title')"
      :subtitle="t('work.subtitle')"
      :meta="[
        {label: t('work.metaProjects'), value: String(projects.length)},
        {label: t('work.metaYears'), value: '2022 — 2026'},
        {label: t('work.metaRole'), value: t('work.roleValue')}
      ]"
    >
      <template #eyebrow>{{ t('work.eyebrow') }}</template>
    </PageHero>

    <div class="container">
      <div class="flex flex-wrap items-center justify-between gap-4 border-y border-line/15 py-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="f in filters"
            :key="f.key"
            v-cursor="'link'"
            type="button"
            class="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors duration-300"
            :class="filter === f.key ? 'border-ink bg-ink text-surface' : 'border-line/25 text-ink-soft hover:text-ink'"
            @click="filter = f.key"
          >
            {{ f.label }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-for="mode in (['grid', 'list'] as const)"
            :key="mode"
            v-cursor="'link'"
            type="button"
            class="rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors duration-300"
            :class="view === mode ? 'border-ink text-ink' : 'border-line/20 text-ink-faint hover:text-ink'"
            :aria-pressed="view === mode"
            @click="view = mode"
          >
            {{ mode === 'grid' ? t('work.viewGrid') : t('work.viewList') }}
          </button>
        </div>
      </div>

      <div
        v-if="view === 'grid'"
        ref="listRoot"
        class="grid gap-x-8 gap-y-16 py-16 md:grid-cols-2 lg:gap-y-24 lg:py-24"
      >
        <WorkCard
          v-for="(project, i) in visible"
          :key="project.slug"
          :project="project"
          :index="i"
          :class="i % 2 === 1 ? 'md:mt-24' : ''"
        />
      </div>

      <div v-else ref="listRoot" class="py-10 lg:py-16">
        <WorkRow v-for="(project, i) in visible" :key="project.slug" :project="project" :index="i" />
      </div>
    </div>

    <ContactCta />
  </div>
</template>
