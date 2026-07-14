<script setup lang="ts">
const {state} = useCursor()
const wrap = ref<HTMLElement | null>(null)
const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const enabled = ref(false)

// registered synchronously: the mount handler awaits, which would detach the hook
let cleanup: (() => void) | null = null
onBeforeUnmount(() => cleanup?.())

onMounted(async () => {
  const api = useMotion()
  if (!api) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (api.reduced) return

  enabled.value = true
  // ClientOnly renders its children on the next tick — wait for the refs
  await nextTick()
  if (!dot.value || !ring.value) {
    enabled.value = false
    return
  }

  const {gsap} = api
  // gsap owns the transform, so centering has to live there too —
  // a Tailwind -translate-x-1/2 would simply be overwritten.
  gsap.set([dot.value, ring.value], {xPercent: -50, yPercent: -50})
  gsap.set(wrap.value, {autoAlpha: 0})

  const xDot = gsap.quickTo(dot.value, 'x', {duration: 0.12, ease: 'power3'})
  const yDot = gsap.quickTo(dot.value, 'y', {duration: 0.12, ease: 'power3'})
  const xRing = gsap.quickTo(ring.value, 'x', {duration: 0.5, ease: 'power3'})
  const yRing = gsap.quickTo(ring.value, 'y', {duration: 0.5, ease: 'power3'})

  // start where the pointer already is instead of the top-left corner
  let placed = false
  const move = (e: PointerEvent) => {
    if (!placed) {
      placed = true
      // hide the native cursor only once ours is on screen, never before
      document.documentElement.classList.add('has-custom-cursor')
      gsap.set([dot.value, ring.value], {x: e.clientX, y: e.clientY})
      gsap.to(wrap.value, {autoAlpha: 1, duration: 0.2})
    }
    xDot(e.clientX)
    yDot(e.clientY)
    xRing(e.clientX)
    yRing(e.clientY)
  }

  const down = () => gsap.to(ring.value, {scale: 0.75, duration: 0.25})
  const up = () => gsap.to(ring.value, {scale: 1, duration: 0.35})
  const leaveWindow = () => gsap.to(wrap.value, {autoAlpha: 0, duration: 0.2})
  const enterWindow = () => gsap.to(wrap.value, {autoAlpha: placed ? 1 : 0, duration: 0.2})

  window.addEventListener('pointermove', move, {passive: true})
  window.addEventListener('pointerdown', down)
  window.addEventListener('pointerup', up)
  document.addEventListener('mouseleave', leaveWindow)
  document.addEventListener('mouseenter', enterWindow)

  cleanup = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointerup', up)
    document.removeEventListener('mouseleave', leaveWindow)
    document.removeEventListener('mouseenter', enterWindow)
    document.documentElement.classList.remove('has-custom-cursor')
  }
})

const ringClass = computed(() => {
  switch (state.value.mode) {
    case 'view':
      return 'h-24 w-24 bg-accent border-transparent'
    case 'link':
      return 'h-16 w-16 bg-ink/10 border-ink/40 backdrop-blur-[2px]'
    case 'drag':
      return 'h-20 w-20 bg-ink text-surface border-transparent'
    case 'hidden':
      return 'h-0 w-0 opacity-0 border-transparent'
    default:
      return 'h-8 w-8 border-ink/50'
  }
})
</script>

<template>
  <ClientOnly>
    <div v-show="enabled" ref="wrap" class="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div
        ref="ring"
        class="absolute left-0 top-0 flex items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-500 ease-expo"
        :class="ringClass"
      >
        <span
          class="font-display text-xs uppercase tracking-[0.2em] text-white transition-opacity duration-300"
          :class="state.label ? 'opacity-100' : 'opacity-0'"
        >
          {{ state.label }}
        </span>
      </div>
      <div
        ref="dot"
        class="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-ink transition-opacity duration-300"
        :class="state.mode === 'view' || state.mode === 'hidden' ? 'opacity-0' : 'opacity-100'"
      />
    </div>
  </ClientOnly>
</template>
