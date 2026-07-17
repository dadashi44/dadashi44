<script setup lang="ts">
const props = withDefaults(
  defineProps<{items: string[]; speed?: number; direction?: 1 | -1; separator?: string}>(),
  {speed: 60, direction: 1, separator: '✳'}
)

const track = ref<HTMLElement | null>(null)
const inner = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !inner.value) return
  const {gsap, ScrollTrigger, reduced} = api
  if (reduced) return

  const width = inner.value.offsetWidth / 2
  const tween = gsap.to(inner.value, {
    x: -width,
    duration: width / props.speed,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: (x: string) => `${gsap.utils.wrap(-width, 0, parseFloat(x))}px`
    }
  })
  tween.timeScale(props.direction)

  // scroll velocity speeds the belt up without ever flipping its base direction
  const st = ScrollTrigger.create({
    trigger: track.value,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self: any) => {
      const v = gsap.utils.clamp(0, 3, Math.abs(self.getVelocity()) / 600)
      gsap.to(tween, {timeScale: props.direction * (1 + v), duration: 0.5, overwrite: true})
    }
  })

  onBeforeUnmount(() => {
    tween.kill()
    st.kill()
  })
})
</script>

<template>
  <div ref="track" class="w-full overflow-hidden">
    <div ref="inner" class="flex w-max whitespace-nowrap will-change-transform">
      <span v-for="pass in 2" :key="pass" class="flex items-center">
        <span v-for="(item, i) in items" :key="`${pass}-${i}`" class="flex items-center">
          <span class="px-6"><slot :item="item">{{ item }}</slot></span>
          <span class="text-accent">{{ separator }}</span>
        </span>
      </span>
    </div>
  </div>
</template>
