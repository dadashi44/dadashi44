<script setup lang="ts">
const bar = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !bar.value) return
  const {gsap, ScrollTrigger} = api

  const st = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self: any) => gsap.set(bar.value, {scaleX: self.progress})
  })
  onBeforeUnmount(() => st.kill())
})
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-0 z-[65] h-px bg-transparent">
    <div ref="bar" class="h-full origin-left scale-x-0 bg-accent" />
  </div>
</template>
