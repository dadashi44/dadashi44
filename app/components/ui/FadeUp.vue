<script setup lang="ts">
const props = withDefaults(
  defineProps<{y?: number; delay?: number; stagger?: number; start?: string; selector?: string}>(),
  {y: 40, delay: 0, stagger: 0.08, start: 'top 88%'}
)

const el = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !el.value) return
  const {gsap} = api

  const targets = props.selector
    ? Array.from(el.value.querySelectorAll(props.selector))
    : Array.from(el.value.children)

  if (!targets.length) return

  gsap.from(targets, {
    y: props.y,
    autoAlpha: 0,
    duration: 1,
    delay: props.delay,
    ease: 'expo.out',
    stagger: props.stagger,
    scrollTrigger: {trigger: el.value, start: props.start, once: true}
  })
})
</script>

<template>
  <div ref="el">
    <slot />
  </div>
</template>
