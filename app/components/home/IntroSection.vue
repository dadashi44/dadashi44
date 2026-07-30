<script setup lang="ts">
const {t, locale} = useI18n()
const words = computed(() => t('home.approachText').split(' '))
const root = ref<HTMLElement | null>(null)

const animate = () => {
  const api = useMotion()
  if (!api || !root.value) return
  const {gsap} = api

  gsap.fromTo(
    root.value.querySelectorAll('[data-word]'),
    {opacity: 0.15},
    {
      opacity: 1,
      stagger: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: true
      }
    }
  )
}

onMounted(animate)
// the sentence is re-split when the language changes, so re-run the scrub
watch(locale, () => nextTick(animate))
</script>

<template>
  <section class="container py-28 lg:py-44">
    <SectionLabel index="01" :title="t('home.approach')" />
    <p ref="root" class="max-w-5xl text-2xl leading-[1.25] sm:text-4xl lg:text-5xl">
      <span v-for="(word, i) in words" :key="i" data-word class="inline-block">{{ word }}&nbsp;</span>
    </p>
  </section>
</template>
