<script setup lang="ts">
const {t} = useI18n()
const root = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !root.value) return
  const {gsap} = api

  gsap.fromTo(
    root.value.querySelector('[data-cta-inner]'),
    {scale: 0.94, yPercent: 6},
    {
      scale: 1,
      yPercent: 0,
      ease: 'none',
      scrollTrigger: {trigger: root.value, start: 'top bottom', end: 'center center', scrub: true}
    }
  )
})
</script>

<template>
  <section ref="root" class="container py-28 lg:py-40">
    <div
      data-cta-inner
      class="relative overflow-hidden rounded-2xl bg-ink px-6 py-20 text-center text-surface lg:px-16 lg:py-32"
    >
      <SplitReveal
        as="h2"
        type="chars"
        :stagger="0.02"
        class="font-display text-headline uppercase leading-[0.9]"
        :text="t('home.ctaTitle')"
      />
      <p class="mx-auto mt-6 max-w-xl text-sm text-surface/70">
        {{ t('home.ctaText') }}
      </p>

      <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
        <MagneticEl :strength="0.3">
          <a
            v-cursor="{mode: 'view', label: t('common.mail')}"
            href="mailto:asian.paradissseee@gmail.com"
            class="inline-block rounded-full bg-accent px-10 py-5 text-sm uppercase tracking-[0.2em] text-white"
          >
            asian.paradissseee@gmail.com
          </a>
        </MagneticEl>
        <a
          v-cursor="'link'"
          href="https://t.me/tadashi_brooo"
          target="_blank"
          rel="noopener noreferrer"
          class="link-underline text-sm uppercase tracking-[0.2em] text-surface/80"
        >
          Telegram
        </a>
      </div>
    </div>
  </section>
</template>
