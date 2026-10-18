<script setup lang="ts">
/**
 * Mobile menu. Beyond the links it behaves like a proper dialog: the current
 * page is marked, Escape closes it, focus moves in on open and back to the
 * burger on close, and the page underneath can't scroll.
 */
const {menuOpen} = useAppState()
const {t} = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const resumeHref = useResumeHref()

const panel = ref<HTMLElement | null>(null)

const links = computed(() => [
  {label: t('nav.home'), to: localePath('/')},
  {label: t('nav.work'), to: localePath('/work')},
  {label: t('nav.about'), to: localePath('/about')},
  {label: t('nav.contact'), to: localePath('/contact')}
])

// the home link would otherwise match every page by prefix
const isActive = (to: string) => (to === localePath('/') ? route.path === to : route.path.startsWith(to))

const close = () => (menuOpen.value = false)

watch(() => route.fullPath, close)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

watch(
  menuOpen,
  (open) => {
    if (import.meta.server) return
    // touch scrolling ignores Lenis, so the root itself has to stop scrolling
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open) {
      window.addEventListener('keydown', onKeydown)
      nextTick(() => {
        // a selector list matches in document order, so the current page is looked up first
        const target =
          panel.value?.querySelector<HTMLElement>('a[aria-current="page"]') ?? panel.value?.querySelector<HTMLElement>('a')
        target?.focus({preventScroll: true})
      })
    } else {
      window.removeEventListener('keydown', onKeydown)
      document.querySelector<HTMLElement>('[aria-controls="site-menu"]')?.focus({preventScroll: true})
    }
  },
  {flush: 'post'}
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.documentElement.style.overflow = ''
})

const onEnter = (el: Element, done: () => void) => {
  const api = useMotion()
  if (!api || api.reduced) return done()
  const {gsap} = api
  gsap
    .timeline({onComplete: done})
    .fromTo(el, {clipPath: 'inset(0 0 100% 0)'}, {clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut'})
    .from(
      el.querySelectorAll('[data-menu-item]'),
      {yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out'},
      '-=0.35'
    )
}

const onLeave = (el: Element, done: () => void) => {
  const api = useMotion()
  if (!api || api.reduced) return done()
  api.gsap.to(el, {clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut', onComplete: done})
}
</script>

<template>
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div
      v-if="menuOpen"
      id="site-menu"
      ref="panel"
      role="dialog"
      aria-modal="true"
      :aria-label="t('nav.menu')"
      class="fixed inset-0 z-[75] flex flex-col justify-between overflow-y-auto overscroll-contain bg-surface-alt px-5 pb-8 pt-24"
    >
      <nav>
        <ul class="divide-y divide-line/10 border-y border-line/10">
          <li v-for="(link, i) in links" :key="link.to" class="overflow-hidden">
            <!-- a tap on the current page still closes the menu -->
            <NuxtLink
              :to="link.to"
              :aria-current="isActive(link.to) ? 'page' : undefined"
              class="group flex items-center gap-4 py-3"
              @click="close"
            >
              <span data-menu-item class="flex w-full items-center gap-4">
                <span class="w-6 font-display text-xs tracking-[0.2em]" :class="isActive(link.to) ? 'text-accent' : 'text-ink-faint'">
                  0{{ i + 1 }}
                </span>
                <span
                  class="font-display text-5xl uppercase leading-none transition-colors duration-300"
                  :class="isActive(link.to) ? 'text-ink' : 'text-ink-soft group-hover:text-ink'"
                >
                  {{ link.label }}
                </span>
                <span
                  class="ml-auto h-2 w-2 rounded-full bg-accent transition-transform duration-500 ease-expo"
                  :class="isActive(link.to) ? 'scale-100' : 'scale-0'"
                  aria-hidden="true"
                />
              </span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="mt-10 space-y-6">
        <!-- the two things a visitor most likely came for -->
        <div data-menu-item class="grid grid-cols-2 gap-3">
          <NuxtLink
            :to="localePath('/contact')"
            class="flex h-12 items-center justify-center rounded-full bg-ink text-sm uppercase tracking-[0.15em] text-surface"
            @click="close"
          >
            {{ t('home.startProject') }}
          </NuxtLink>
          <a
            :href="resumeHref"
            target="_blank"
            rel="noopener"
            class="flex h-12 items-center justify-center rounded-full border border-line/30 text-sm uppercase tracking-[0.15em]"
          >
            {{ t('common.cv') }}
          </a>
        </div>

        <div data-menu-item>
          <p class="mb-3 font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('nav.language') }}</p>
          <LangSwitch full />
        </div>

        <div data-menu-item class="space-y-3 border-t border-line/10 pt-6">
          <a href="mailto:asian.paradissseee@gmail.com" class="block break-all text-base">
            asian.paradissseee@gmail.com
          </a>
          <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm uppercase tracking-[0.2em] text-ink-soft">
            <a href="https://t.me/tadashi_brooo" target="_blank" rel="noopener">Telegram</a>
            <a href="https://github.com/dadashi44" target="_blank" rel="noopener">GitHub</a>
            <a href="https://www.linkedin.com/in/d-abasov-e60/" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
