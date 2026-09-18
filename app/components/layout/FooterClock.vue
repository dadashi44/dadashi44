<script setup lang="ts">
/**
 * Own component on purpose. Inline in TheFooter the ticking ref would be read
 * inside the <ClientOnly> slot, and ClientOnly invokes that slot from its own
 * render — so the every-second update showed up as a ClientOnly re-render.
 * Here it stays where it belongs, on the smallest node that actually changes.
 */
const {t} = useI18n()

const time = ref('')
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  const tick = () => {
    time.value = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Almaty'
    }).format(new Date())
  }
  tick()
  timer = setInterval(tick, 1000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <span>{{ t('common.location', {time}) }}</span>
</template>
