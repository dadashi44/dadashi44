<script setup lang="ts">
import {NuxtLink} from '#components'

const props = withDefaults(
  defineProps<{to?: string; href?: string; label: string; size?: 'sm' | 'md' | 'lg'}>(),
  {size: 'md'}
)

const tag = computed(() => (props.to ? NuxtLink : 'a'))

const sizes = {
  sm: 'text-sm px-5 py-2.5',
  md: 'text-base px-7 py-3.5',
  lg: 'text-lg px-9 py-5'
}
</script>

<template>
  <MagneticEl :strength="0.25">
    <component
      :is="tag"
      v-cursor="'link'"
      :to="to"
      :href="href"
      :target="href ? '_blank' : undefined"
      :rel="href ? 'noopener noreferrer' : undefined"
      class="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-line/30 font-medium uppercase tracking-wider"
      :class="sizes[size]"
    >
      <span
        class="absolute inset-0 -z-10 translate-y-full rounded-full bg-ink transition-transform duration-500 ease-expo group-hover:translate-y-0"
      />
      <span class="transition-colors duration-500 group-hover:text-surface">{{ label }}</span>
      <span class="relative h-4 w-4 overflow-hidden">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          class="absolute inset-0 h-4 w-4 transition-transform duration-500 ease-expo group-hover:translate-x-5 group-hover:-translate-y-5 group-hover:text-surface"
        >
          <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          class="absolute inset-0 h-4 w-4 -translate-x-5 translate-y-5 transition-transform duration-500 ease-expo group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-surface"
        >
          <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </span>
    </component>
  </MagneticEl>
</template>
