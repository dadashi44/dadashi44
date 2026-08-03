<script setup lang="ts">
const {t} = useI18n()

useSiteSeo({
  title: () => t('home.seoTitle'),
  description: () => t('home.seoDescription'),
  type: 'profile'
})
</script>

<template>
  <div>
    <HeroSection />
    <IntroSection />
    <ServicesSection />
    <WorksShowcase />
    <StackSection />
    <ContactCta />
  </div>
</template>
