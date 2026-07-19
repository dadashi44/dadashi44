<script setup lang="ts">
const {theme, toggle} = useTheme()
const {t} = useI18n()

const label = computed(() => t(theme.value === 'dark' ? 'theme.dark' : 'theme.light'))
const nextLabel = computed(() => t(theme.value === 'dark' ? 'theme.light' : 'theme.dark'))
</script>

<template>
  <button
    v-cursor="'link'"
    type="button"
    class="group relative flex h-9 items-center gap-2 rounded-full border border-line/25 px-3 text-xs uppercase tracking-[0.2em]"
    :aria-label="t('theme.switch', {mode: nextLabel})"
    @click="toggle"
  >
    <span
      class="h-2 w-2 rounded-full bg-accent transition-transform duration-500 ease-expo"
      :class="theme === 'dark' ? 'translate-x-0' : 'translate-x-1'"
    />
    <ClientOnly>
      <span class="hidden sm:inline">{{ label }}</span>
      <template #fallback><span class="hidden sm:inline">{{ t('theme.dark') }}</span></template>
    </ClientOnly>
  </button>
</template>
