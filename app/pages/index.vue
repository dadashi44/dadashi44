<script setup lang="ts">
const {t} = useI18n()

useSiteSeo({
  title: () => t('home.seoTitle'),
  description: () => t('home.seoDescription'),
  type: 'profile',
  // the hero's own words: the name in Latin, the intro and the status line
  card: {title: 'Dauren Abasov', description: t('home.heroIntro'), eyebrow: t('home.heroStatus')}
})
</script>

<template>
  <div>
    <HeroSection />
    <IntroSection />
    <ServicesSection />
    <WorksShowcase />
    <StackSection />
    <LocationSection />
    <ContactCta />
  </div>
</template>
