<script setup lang="ts">
const {init} = useTheme()
onMounted(init)

// sets <html lang>, og:locale and hreflang alternates for both languages
const head = useLocaleHead()
useHead(head)

const site = useSiteUrl()
useJsonLd({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${site}/#person`,
      name: 'Dauren Abasov',
      alternateName: 'dadashi',
      jobTitle: 'Frontend Developer',
      email: 'mailto:asian.paradissseee@gmail.com',
      telephone: '+7-700-298-20-30',
      image: `${site}/me.jpg`,
      url: site,
      address: {'@type': 'PostalAddress', addressLocality: 'Almaty', addressCountry: 'KZ'},
      worksFor: {'@type': 'Organization', name: 'Bigplay.gg'},
      alumniOf: {'@type': 'CollegeOrUniversity', name: 'Kyrgyz National University named after Jusup Balasagyn'},
      knowsLanguage: ['ru', 'en'],
      knowsAbout: ['Vue.js', 'Nuxt', 'React', 'TypeScript', 'GSAP', 'Web Performance', 'SSR'],
      sameAs: [
        'https://github.com/dadashi44',
        'https://www.linkedin.com/in/d-abasov-e60/',
        'https://t.me/tadashi_brooo'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${site}/#website`,
      url: site,
      name: 'Dauren Abasov — Frontend Developer',
      inLanguage: ['ru-RU', 'en-US'],
      publisher: {'@id': `${site}/#person`}
    }
  ]
})

const pageTransition = {
  name: 'page',
  mode: 'out-in' as const,
  onEnter: (el: Element, done: () => void) => {
    const api = useMotion()
    if (!api) return done()
    api.gsap.fromTo(
      el,
      {autoAlpha: 0, y: 24},
      {autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', onComplete: done, clearProps: 'transform'}
    )
  },
  onLeave: (el: Element, done: () => void) => {
    const api = useMotion()
    if (!api) return done()
    api.gsap.to(el, {autoAlpha: 0, y: -18, duration: 0.35, ease: 'power2.in', onComplete: done})
  }
}
</script>

<template>
  <div>
    <Head>
      <Link rel="icon" href="/favicon.ico" />
    </Head>

    <ThePreloader />
    <AppCursor />

    <NuxtLayout>
      <NuxtPage :transition="pageTransition" />
    </NuxtLayout>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  will-change: transform, opacity;
}
</style>
