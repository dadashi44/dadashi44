<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text?: string
    as?: string
    type?: 'lines' | 'words' | 'chars'
    delay?: number
    stagger?: number
    start?: string
    once?: boolean
  }>(),
  {
    as: 'p',
    type: 'lines',
    delay: 0,
    stagger: 0.06,
    start: 'top 85%',
    once: true
  }
)

const el = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !el.value) return
  const {gsap, SplitText, reduced} = api

  if (reduced) {
    gsap.set(el.value, {autoAlpha: 1})
    return
  }

  const run = () => {
    const split = new SplitText(el.value!, {
      type: props.type === 'chars' ? 'chars,words,lines' : props.type === 'words' ? 'words,lines' : 'lines',
      linesClass: 'split-line',
      mask: 'lines'
    })

    const targets =
      props.type === 'chars' ? split.chars : props.type === 'words' ? split.words : split.lines

    gsap.set(el.value, {autoAlpha: 1})
    gsap.from(targets, {
      yPercent: 115,
      opacity: props.type === 'lines' ? 1 : 0,
      duration: 1,
      delay: props.delay,
      ease: 'expo.out',
      stagger: props.stagger,
      scrollTrigger: {
        trigger: el.value,
        start: props.start,
        once: props.once
      }
    })
  }

  document.fonts?.ready ? document.fonts.ready.then(run) : run()
})
</script>

<template>
  <component :is="as" ref="el" class="invisible">
    <slot>{{ text }}</slot>
  </component>
</template>
