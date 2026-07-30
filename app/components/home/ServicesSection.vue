<script setup lang="ts">
const {t, tm, rt} = useI18n()

const services = computed(() =>
  (['design', 'build', 'grow'] as const).map((key) => ({
    title: t(`services.${key}.title`),
    body: t(`services.${key}.body`),
    points: (tm(`services.${key}.points`) as unknown[]).map((point) => rt(point as string))
  }))
)

const root = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !root.value) return
  const {gsap} = api

  gsap.from(root.value.querySelectorAll('[data-service]'), {
    yPercent: 12,
    autoAlpha: 0,
    duration: 1,
    stagger: 0.12,
    ease: 'expo.out',
    scrollTrigger: {trigger: root.value, start: 'top 80%', once: true}
  })
})
</script>

<template>
  <section class="container py-20 lg:py-32">
    <SectionLabel index="02" :title="t('home.servicesTitle')" />

    <div ref="root" class="grid gap-px overflow-hidden rounded-xl bg-line/15 lg:grid-cols-3">
      <article
        v-for="(service, i) in services"
        :key="service.title"
        data-service
        class="group flex min-h-[22rem] flex-col justify-between bg-surface p-8 transition-colors duration-500 hover:bg-surface-alt lg:p-10"
      >
        <div class="flex items-start justify-between">
          <span class="font-display text-xs tracking-[0.3em] text-accent">0{{ i + 1 }}</span>
          <span
            class="h-8 w-8 rounded-full border border-line/25 transition-all duration-500 ease-expo group-hover:scale-125 group-hover:bg-accent group-hover:border-accent"
          />
        </div>

        <div>
          <h3 class="font-display text-5xl uppercase leading-none lg:text-6xl">{{ service.title }}</h3>
          <p class="mt-5 text-sm leading-relaxed text-ink-soft">{{ service.body }}</p>
          <ul class="mt-6 flex flex-wrap gap-2">
            <li
              v-for="p in service.points"
              :key="p"
              class="rounded-full border border-line/20 px-3 py-1 text-[11px] uppercase tracking-wider text-ink-faint"
            >
              {{ p }}
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>
