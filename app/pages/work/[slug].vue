<script setup lang="ts">
const route = useRoute()
const {t} = useI18n()
const localePath = useLocalePath()
const {list: projects} = useProjects()

const slug = computed(() => String(route.params.slug))
const project = computed(() => projects.value.find((p) => p.slug === slug.value))

if (!project.value) {
  throw createError({statusCode: 404, statusMessage: 'Project not found', fatal: true})
}

const index = computed(() => projects.value.findIndex((p) => p.slug === slug.value))
const next = computed(() => projects.value[(index.value + 1) % projects.value.length]!)

useSiteSeo({
  title: () => `${project.value!.name} — ${project.value!.client}`,
  description: () => project.value!.summary,
  // dedicated 1200x630 JPEG card — crawlers handle WebP inconsistently
  image: () => `/works/og/${project.value!.slug}.jpg`,
  type: 'article'
})

const site = useSiteUrl()
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: project.value!.name,
  headline: `${project.value!.name} — ${project.value!.client}`,
  description: project.value!.summary,
  url: project.value!.href,
  image: `${site}/works/og/${project.value!.slug}.jpg`,
  dateCreated: project.value!.year,
  keywords: project.value!.stack.join(', '),
  author: {'@id': `${site}/#person`},
  creator: {'@id': `${site}/#person`}
}))

const hero = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !hero.value) return
  api.gsap.from(hero.value, {clipPath: 'inset(15% 15% 15% 15%)', duration: 1.4, ease: 'expo.out'})
})
</script>

<template>
  <article v-if="project">
    <PageHero
      :index="String(index + 1).padStart(2, '0')"
      :title="project.name"
      :subtitle="project.summary"
      :meta="[
        {label: t('work.client'), value: project.client},
        {label: t('work.year'), value: project.year},
        {label: t('work.role'), value: project.role},
        {label: t('work.type'), value: project.kind === 'mobile' ? t('common.mobileApp') : t('common.website')},
        {
          label: t('work.status'),
          value: project.status === 'production' ? t('work.statusProduction') : t('work.statusDev')
        }
      ]"
    >
      <template #eyebrow>{{ t('work.caseStudy') }}</template>
    </PageHero>

    <div class="container">
      <div ref="hero" class="aspect-[16/10] w-full overflow-hidden rounded-xl lg:aspect-[16/8]">
        <ProjectVisual :project="project" parallax />
      </div>
    </div>

    <section class="container grid gap-14 py-20 lg:grid-cols-[1.3fr_1fr] lg:gap-24 lg:py-28">
      <div class="space-y-6">
        <SplitReveal
          v-for="(paragraph, i) in project.description"
          :key="i"
          as="p"
          class="text-lg leading-relaxed text-ink-soft lg:text-xl"
          :text="paragraph"
        />

        <div class="pt-4">
          <ArrowLink
            :href="project.href"
            :label="project.kind === 'mobile' ? t('work.openLanding') : t('work.openSite')"
            size="lg"
          />
        </div>
      </div>

      <aside class="space-y-10">
        <div>
          <p class="mb-5 font-display text-xs uppercase tracking-[0.3em] text-ink-faint">
            {{ t('work.contribution') }}
          </p>
          <FadeUp selector="li">
            <ul class="space-y-3">
              <li
                v-for="item in project.contribution"
                :key="item"
                class="flex gap-3 border-b border-line/15 pb-3 text-sm text-ink-soft"
              >
                <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {{ item }}
              </li>
            </ul>
          </FadeUp>
        </div>

        <div>
          <p class="mb-5 font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('work.stack') }}</p>
          <ul class="flex flex-wrap gap-2">
            <li
              v-for="tech in project.stack"
              :key="tech"
              class="rounded-full border border-line/25 px-4 py-2 text-xs uppercase tracking-wider"
            >
              {{ tech }}
            </li>
          </ul>
        </div>
      </aside>
    </section>

    <section class="border-t border-line/15">
      <NuxtLink
        v-cursor="{mode: 'view', label: t('common.next')}"
        :to="localePath(`/work/${next.slug}`)"
        class="group container flex flex-col gap-4 py-16 lg:py-24"
      >
        <span class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('work.nextProject') }}</span>
        <span
          class="font-display text-display uppercase leading-[0.85] transition-transform duration-700 ease-expo group-hover:translate-x-4"
        >
          {{ next.name }}
        </span>
        <span class="text-sm text-ink-soft">{{ next.client }}</span>
      </NuxtLink>
    </section>
  </article>
</template>
