<script setup lang="ts">
const {menuOpen} = useAppState()
const {t} = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const links = computed(() => [
  {label: t('nav.home'), to: localePath('/')},
  {label: t('nav.work'), to: localePath('/work')},
  {label: t('nav.about'), to: localePath('/about')},
  {label: t('nav.contact'), to: localePath('/contact')}
])

watch(() => route.fullPath, () => (menuOpen.value = false))

const onEnter = (el: Element, done: () => void) => {
  const api = useMotion()
  if (!api) return done()
  const {gsap} = api
  gsap
    .timeline({onComplete: done})
    .fromTo(el, {clipPath: 'inset(0 0 100% 0)'}, {clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut'})
    .from(
      el.querySelectorAll('[data-menu-item]'),
      {yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out'},
      '-=0.35'
    )
}

const onLeave = (el: Element, done: () => void) => {
  const api = useMotion()
  if (!api) return done()
  api.gsap.to(el, {clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut', onComplete: done})
}
</script>

<template>
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-if="menuOpen" class="fixed inset-0 z-[75] flex flex-col justify-between bg-surface-alt px-5 pb-10 pt-24">
      <nav>
        <ul class="space-y-1">
          <li v-for="link in links" :key="link.to" class="overflow-hidden">
            <NuxtLink :to="link.to" class="block">
              <span data-menu-item class="block font-display text-6xl uppercase leading-[0.95]">
                {{ link.label }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="space-y-4">
        <a data-menu-item href="mailto:asian.paradissseee@gmail.com" class="block text-lg">
          asian.paradissseee@gmail.com
        </a>
        <div data-menu-item class="flex flex-wrap gap-4 text-sm uppercase tracking-[0.2em] text-ink-soft">
          <a href="https://t.me/tadashi_brooo" target="_blank" rel="noopener">Telegram</a>
          <a href="https://github.com/dadashi44" target="_blank" rel="noopener">GitHub</a>
          <a href="https://www.linkedin.com/in/d-abasov-e60/" target="_blank" rel="noopener">LinkedIn</a>
        </div>
        <div data-menu-item><LangSwitch /></div>
      </div>
    </div>
  </Transition>
</template>
