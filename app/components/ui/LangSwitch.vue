<script setup lang="ts">
const {locale, locales} = useI18n()
const switchLocalePath = useSwitchLocalePath()

const options = computed(() =>
  (locales.value as {code: string; name?: string}[]).map((l) => ({
    code: l.code,
    label: l.code.toUpperCase(),
    name: l.name ?? l.code
  }))
)
</script>

<template>
  <div class="flex items-center rounded-full border border-line/25 p-0.5 text-xs uppercase tracking-[0.15em]">
    <NuxtLink
      v-for="option in options"
      :key="option.code"
      v-cursor="'link'"
      :to="switchLocalePath(option.code as any)"
      :aria-label="option.name"
      :aria-current="locale === option.code ? 'true' : undefined"
      class="rounded-full px-2.5 py-1 transition-colors duration-300"
      :class="locale === option.code ? 'bg-ink text-surface' : 'text-ink-soft hover:text-ink'"
    >
      {{ option.label }}
    </NuxtLink>
  </div>
</template>
