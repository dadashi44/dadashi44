<script setup lang="ts">
const {t, tm, rt} = useI18n()
const localePath = useLocalePath()

useSiteSeo({
  title: () => t('about.seoTitle'),
  description: () => t('about.seoDescription'),
  type: 'profile'
})

interface Job {year: string; title: string; role: string; place: string}
interface School {period: string; school: string; degree: string; note: string; place: string}
interface Highlight {value: string; label: string}

/**
 * tm() hands back raw message nodes, so every leaf goes through rt() — that is
 * what resolves escapes like {'@'} instead of printing them verbatim.
 */
const resolve = (value: unknown) => rt(value as string)
const listOf = (key: string) => computed(() => (tm(key) as unknown[]).map(resolve))
const objectsOf = <T,>(key: string) =>
  computed(() =>
    (tm(key) as Record<string, unknown>[]).map(
      (item) => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, resolve(v)])) as T
    )
  )

const bio = listOf('about.bio')
const principles = listOf('about.principlesList')
const jobs = objectsOf<Job>('about.jobs')
const education = objectsOf<School>('about.schools')
const highlights = objectsOf<Highlight>('about.highlights')

const photo = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !photo.value) return
  const {gsap} = api

  gsap.from(photo.value, {clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.out'})
  gsap.to(photo.value.querySelector('img'), {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: {trigger: photo.value, start: 'top bottom', end: 'bottom top', scrub: true}
  })
})
</script>

<template>
  <div>
    <PageHero
      index="02"
      :title="t('about.title')"
      :subtitle="t('about.subtitle')"
      :meta="[
        {label: t('about.metaBased'), value: t('about.metaBasedValue')},
        {label: t('about.metaExperience'), value: t('about.metaExperienceValue')},
        {label: t('about.metaLanguages'), value: t('about.metaLanguagesValue')}
      ]"
    >
      <template #eyebrow>{{ t('about.eyebrow') }}</template>
    </PageHero>

    <section class="container grid gap-14 pb-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div ref="photo" class="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-alt">
        <img src="/me.jpg" alt="Dauren Abasov" class="h-full w-full scale-110 object-cover" />
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <p class="font-display text-xs uppercase tracking-[0.3em] text-white/80">Dauren Abasov · dadashi</p>
        </div>
      </div>

      <div class="space-y-6">
        <SplitReveal
          v-for="(paragraph, i) in bio"
          :key="i"
          as="p"
          class="text-lg leading-relaxed text-ink-soft lg:text-xl"
          :text="paragraph"
        />

        <div class="flex flex-wrap gap-4 pt-4">
          <ArrowLink :to="localePath('/contact')" :label="t('about.hireMe')" />
          <ArrowLink href="/Abasov_Dauren_Resume.pdf" :label="t('common.downloadCv')" />
          <ArrowLink href="https://github.com/dadashi44" label="GitHub" />
        </div>
      </div>
    </section>

    <section class="border-y border-line/15 py-20 lg:py-28">
      <div class="container">
        <SectionLabel index="03" :title="t('about.experience')" />
        <FadeUp selector="[data-row]">
          <div>
            <div
              v-for="item in jobs"
              :key="item.title"
              data-row
              class="group grid gap-3 border-b border-line/15 py-8 transition-colors duration-500 lg:grid-cols-[10rem_1fr_1.1fr] lg:items-baseline lg:gap-10"
            >
              <span class="font-display text-sm tracking-[0.2em] text-ink-faint">{{ item.year }}</span>
              <span
                class="font-display text-3xl uppercase leading-none transition-colors duration-500 group-hover:text-accent lg:text-5xl"
              >
                {{ item.title }}
              </span>
              <span class="text-sm text-ink-soft">
                <span class="block text-ink">{{ item.role }}</span>
                {{ item.place }}
              </span>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>

    <section class="container py-20 lg:py-28">
      <SectionLabel index="04" :title="t('about.education')" />
      <FadeUp selector="[data-edu]">
        <div class="grid gap-6 lg:grid-cols-2">
          <article
            v-for="item in education"
            :key="item.school"
            data-edu
            class="group flex flex-col justify-between gap-8 rounded-xl border border-line/15 p-8 transition-colors duration-500 hover:bg-surface-alt lg:p-10"
          >
            <div class="flex items-start justify-between gap-6">
              <span class="font-display text-sm tracking-[0.2em] text-ink-faint">{{ item.period }}</span>
              <span
                class="h-8 w-8 shrink-0 rounded-full border border-line/25 transition-all duration-500 ease-expo group-hover:scale-125 group-hover:border-accent group-hover:bg-accent"
              />
            </div>

            <div>
              <h3 class="text-2xl leading-tight lg:text-3xl">{{ item.school }}</h3>
              <p class="mt-3 font-display text-sm uppercase tracking-[0.2em] text-accent">{{ item.degree }}</p>
              <p class="mt-4 text-sm text-ink-soft">{{ item.note }}</p>
              <p class="mt-1 text-sm text-ink-faint">{{ item.place }}</p>
            </div>
          </article>
        </div>
      </FadeUp>
    </section>

    <section class="container pb-20 lg:pb-28">
      <SectionLabel index="05" :title="t('about.impact')" />
      <FadeUp selector="[data-highlight]">
        <div class="grid gap-px overflow-hidden rounded-xl bg-line/15 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="h in highlights" :key="h.label" data-highlight class="bg-surface p-8">
            <p class="font-display text-5xl leading-none text-accent lg:text-6xl">{{ h.value }}</p>
            <p class="mt-4 text-sm text-ink-soft">{{ h.label }}</p>
          </div>
        </div>
      </FadeUp>
    </section>

    <section class="container pb-20 lg:pb-28">
      <SectionLabel index="06" :title="t('about.principles')" />
      <FadeUp selector="[data-card]">
        <div class="grid gap-6 sm:grid-cols-2">
          <div
            v-for="(p, i) in principles"
            :key="p"
            data-card
            class="rounded-xl border border-line/15 p-8 transition-colors duration-500 hover:bg-surface-alt"
          >
            <span class="font-display text-xs tracking-[0.3em] text-accent">0{{ i + 1 }}</span>
            <p class="mt-4 text-xl leading-snug lg:text-2xl">{{ p }}</p>
          </div>
        </div>
      </FadeUp>
    </section>

    <StackSection />
    <ContactCta />
  </div>
</template>
