<script setup lang="ts">
const props = withDefaults(defineProps<{strength?: number; as?: string}>(), {
  strength: 0.35,
  as: 'div'
})

const el = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !el.value) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const {gsap} = api
  const xTo = gsap.quickTo(el.value, 'x', {duration: 0.6, ease: 'elastic.out(1, 0.4)'})
  const yTo = gsap.quickTo(el.value, 'y', {duration: 0.6, ease: 'elastic.out(1, 0.4)'})

  const move = (e: MouseEvent) => {
    const rect = el.value!.getBoundingClientRect()
    xTo((e.clientX - (rect.left + rect.width / 2)) * props.strength)
    yTo((e.clientY - (rect.top + rect.height / 2)) * props.strength)
  }
  const leave = () => {
    xTo(0)
    yTo(0)
  }

  el.value.addEventListener('mousemove', move)
  el.value.addEventListener('mouseleave', leave)

  onBeforeUnmount(() => {
    el.value?.removeEventListener('mousemove', move)
    el.value?.removeEventListener('mouseleave', leave)
  })
})
</script>

<template>
  <component :is="as" ref="el" class="inline-block will-change-transform">
    <slot />
  </component>
</template>
