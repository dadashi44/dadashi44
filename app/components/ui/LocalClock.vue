<script setup lang="ts">
const {locale} = useI18n()
const time = ref('')
let timer: ReturnType<typeof setInterval>

const tick = () => {
  time.value = new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Almaty'
  }).format(new Date())
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <p class="mt-2 font-display text-5xl leading-none tabular-nums">{{ time }}</p>
</template>
