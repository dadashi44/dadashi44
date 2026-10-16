<script setup lang="ts">
/**
 * Day/night toggle: a disc split by a terminator line, like a globe. The dark
 * half turns over on every switch, and the new theme spreads from the button
 * as a growing circle (View Transitions API). Browsers without the API, and
 * visitors who prefer reduced motion, get an instant switch instead.
 */
const {theme, set} = useTheme()
const {t} = useI18n()

const button = ref<HTMLButtonElement | null>(null)

const nextLabel = computed(() => t(theme.value === 'dark' ? 'theme.light' : 'theme.dark'))

const toggle = () => {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!document.startViewTransition || reduced || !button.value) {
    set(next)
    return
  }

  // the circle starts at the button and grows to the farthest viewport corner
  const rect = button.value.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

  const transition = document.startViewTransition(() => set(next))
  transition.ready.then(() => {
    document.documentElement.animate(
      {clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]},
      {duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)'}
    )
  })
}
</script>

<template>
  <button
    ref="button"
    v-cursor="'link'"
    type="button"
    class="group relative flex h-9 w-9 items-center justify-center rounded-full border border-line/25 transition-colors duration-300 hover:border-line/60"
    :aria-label="t('theme.switch', {mode: nextLabel})"
    @click="toggle"
  >
    <svg viewBox="0 0 20 20" class="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" stroke-width="1.5" />
      <!-- the night half: turns over on every switch, leans a little on hover -->
      <g
        class="origin-center transition-transform duration-700 ease-expo group-hover:[--lean:25deg]"
        :style="{transform: `rotate(calc(${theme === 'dark' ? 0 : 180}deg + var(--lean, 0deg)))`}"
      >
        <path d="M10 2.75a7.25 7.25 0 0 0 0 14.5z" fill="currentColor" />
      </g>
      <!-- the accent dot marks the lit side -->
      <circle
        cx="10"
        cy="10"
        r="1.6"
        class="fill-accent transition-transform duration-700 ease-expo"
        :style="{transform: `translateX(${theme === 'dark' ? 3 : -3}px)`}"
      />
    </svg>
  </button>
</template>

<style>
/* the old snapshot stays put underneath while the new one grows over it */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
</style>
