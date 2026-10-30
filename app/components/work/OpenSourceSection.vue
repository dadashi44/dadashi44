<script setup lang="ts">
const {t, locale} = useI18n()
const localePath = useLocalePath()
const {list: libraries, downloads} = useLibraries()
const {list: projects} = useProjects()

const compact = computed(
  () => new Intl.NumberFormat(locale.value === 'en' ? 'en-US' : 'ru-RU', {notation: 'compact', maximumFractionDigits: 1})
)

const downloadsOf = (pkg: string) => {
  const value = downloads.value?.[pkg]
  return typeof value === 'number' ? compact.value.format(value) : null
}

const projectName = (slug?: string) => projects.value.find((p) => p.slug === slug)?.name

const site = useSiteUrl()
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@graph': libraries.value.map((library) => ({
    '@type': 'SoftwareSourceCode',
    name: library.name,
    description: library.tagline,
    codeRepository: library.repo,
    url: library.npm,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Vue 3',
    license: 'https://opensource.org/licenses/MIT',
    author: {'@id': `${site}/#person`}
  }))
}))
</script>

<template>
  <section id="open-source" class="container scroll-mt-24 border-t border-line/15 py-20 lg:py-32">
    <SectionLabel index="02" :title="t('work.openSource.title')" />

    <div class="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-12 lg:items-end">
      <h2 class="font-display text-headline uppercase lg:col-span-7">{{ t('work.openSource.heading') }}</h2>
      <p class="max-w-md text-ink-soft lg:col-span-5">{{ t('work.openSource.text') }}</p>
    </div>

    <FadeUp class="grid gap-px overflow-hidden rounded-xl bg-line/15 lg:grid-cols-2">
      <article
        v-for="(library, i) in libraries"
        :key="library.pkg"
        class="group flex flex-col gap-8 bg-surface p-8 transition-colors duration-500 hover:bg-surface-alt lg:p-10 lg:last:odd:col-span-2"
      >
        <div class="flex items-start justify-between gap-4">
          <span class="font-display text-xs tracking-[0.3em] text-accent">0{{ i + 1 }}</span>
          <div v-if="downloadsOf(library.pkg)" class="text-right">
            <p class="font-display text-4xl leading-none lg:text-5xl">{{ downloadsOf(library.pkg) }}</p>
            <p class="mt-1 text-[11px] uppercase tracking-wider text-ink-faint">{{ t('work.openSource.downloads') }}</p>
          </div>
        </div>

        <div>
          <p
            v-if="library.badge"
            class="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 px-3 py-1 text-[11px] uppercase tracking-wider text-accent"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-accent" />
            {{ library.badge }}
          </p>
          <h3 class="break-words font-display text-[2.25rem] uppercase leading-none sm:text-5xl">{{ library.name }}</h3>
          <p class="mt-4 text-lg leading-snug">{{ library.tagline }}</p>
          <p class="mt-4 text-sm leading-relaxed text-ink-soft">{{ library.summary }}</p>
        </div>

        <dl v-if="library.facts.length" class="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line/15">
          <div v-for="fact in library.facts" :key="fact.value" class="bg-surface p-4 transition-colors duration-500 group-hover:bg-surface-alt">
            <dt class="font-display text-3xl leading-none text-accent lg:text-4xl">{{ fact.value }}</dt>
            <dd class="mt-2 text-xs leading-snug text-ink-soft">{{ fact.label }}</dd>
          </div>
        </dl>

        <ul class="space-y-3">
          <li
            v-for="item in library.highlights"
            :key="item"
            class="flex gap-3 border-b border-line/15 pb-3 text-sm text-ink-soft"
          >
            <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
            {{ item }}
          </li>
        </ul>

        <ul class="flex flex-wrap gap-2">
          <li
            v-for="tech in library.stack"
            :key="tech"
            class="rounded-full border border-line/20 px-3 py-1 text-[11px] uppercase tracking-wider text-ink-faint"
          >
            {{ tech }}
          </li>
        </ul>

        <div class="mt-auto flex flex-wrap gap-3 pt-2">
          <ArrowLink v-for="link in library.links" :key="link.href" :href="link.href" :label="link.label" size="sm" />
          <ArrowLink :href="library.npm" label="npm" size="sm" />
          <ArrowLink :href="library.repo" label="GitHub" size="sm" />
          <ArrowLink
            v-if="library.project && projectName(library.project)"
            :to="localePath(`/work/${library.project}`)"
            :label="t('work.openSource.fromCase', {name: projectName(library.project)})"
            size="sm"
          />
        </div>
      </article>
    </FadeUp>
  </section>
</template>
