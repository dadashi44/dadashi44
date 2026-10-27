<script setup lang="ts">
/**
 * Segmented RU / EN switch. A pill slides under the active language instead of
 * jumping, the active option isn't a link (clicking it would only reload the
 * page), and `full` spells the names out — used in the mobile menu.
 */
const props = withDefaults(defineProps<{full?: boolean}>(), {full: false})

const {locale, locales, t} = useI18n()
const switchLocalePath = useSwitchLocalePath()

const options = computed(() =>
  (locales.value as {code: string; name?: string; language?: string}[]).map((l) => ({
    code: l.code,
    label: props.full ? (l.name ?? l.code) : l.code.toUpperCase(),
    name: l.name ?? l.code,
    hreflang: l.language ?? l.code
  }))
)

const activeIndex = computed(() => Math.max(0, options.value.findIndex((o) => o.code === locale.value)))
</script>

<template>
  <div
    role="group"
    :aria-label="t('nav.language')"
    class="relative grid grid-flow-col auto-cols-fr items-center rounded-full border border-line/25 p-0.5 uppercase"
    :class="full ? 'h-11 text-sm tracking-[0.12em]' : 'h-9 text-xs tracking-[0.15em]'"
  >
    <!-- the pill under the active option; columns are equal, so a percentage shift is exact -->
    <span
      aria-hidden="true"
      class="absolute inset-y-0.5 left-0.5 rounded-full bg-ink transition-transform duration-500 ease-expo"
      :style="{width: `calc((100% - 4px) / ${options.length})`, transform: `translateX(${activeIndex * 100}%)`}"
    />

    <template v-for="option in options" :key="option.code">
      <span
        v-if="option.code === locale"
        aria-current="true"
        :lang="option.hreflang"
        class="relative z-10 flex h-full items-center justify-center rounded-full text-surface transition-colors duration-500"
        :class="full ? 'px-5' : 'px-3'"
      >
        {{ option.label }}
      </span>
      <NuxtLink
        v-else
        v-cursor="'link'"
        :to="switchLocalePath(option.code as any)"
        :hreflang="option.hreflang"
        :lang="option.hreflang"
        :aria-label="option.name"
        @click="track('language_switched', {from: locale, to: option.code})"
        class="relative z-10 flex h-full items-center justify-center rounded-full text-ink-soft transition-colors duration-500 hover:text-ink"
        :class="full ? 'px-5' : 'px-3'"
      >
        {{ option.label }}
      </NuxtLink>
    </template>
  </div>
</template>
