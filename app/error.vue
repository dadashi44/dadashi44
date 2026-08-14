<script setup lang="ts">
import type {NuxtError} from '#app'

defineProps<{error: NuxtError}>()

const {t} = useI18n()

// Deliberately self-contained: no MagneticEl / ArrowLink / v-cursor here.
// The error page has to render even when the app around it is broken, and
// slot-heavy components have tripped over Vue's null currentRenderingInstance
// inside Nuxt's error boundary.
const goHome = () => clearError({redirect: '/'})
</script>

<template>
  <div class="relative flex min-h-svh flex-col overflow-hidden bg-[#05060f] px-5 text-center text-white">
    <ClientOnly>
      <LazySpaceScene />
    </ClientOnly>

    <!-- the car floats through the gap between these two blocks -->
    <div class="relative z-10 flex min-h-svh w-full flex-col items-center justify-between py-14 lg:py-20">
      <div class="flex flex-col items-center gap-3">
        <p class="font-display text-sm uppercase tracking-[0.4em] text-white/40">error {{ error.statusCode }}</p>
        <p class="font-display text-headline uppercase leading-none">
          {{ error.statusCode === 404 ? t('error.notFound') : t('error.generic') }}
        </p>
      </div>

      <p class="pointer-events-none select-none font-display text-[34vw] leading-none text-white/[0.06] lg:text-[20vw]">
        {{ error.statusCode }}
      </p>

      <div class="flex flex-col items-center gap-6">
        <p class="max-w-md text-sm text-white/50">{{ error.statusMessage }}</p>

        <button
          type="button"
          class="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-white/25 px-9 py-5 text-lg font-medium uppercase tracking-wider text-white backdrop-blur-sm"
          @click="goHome"
        >
          <span
            class="absolute inset-0 -z-10 translate-y-full rounded-full bg-white transition-transform duration-500 ease-expo group-hover:translate-y-0"
          />
          <span class="transition-colors duration-500 group-hover:text-[#05060f]">{{ t('error.home') }}</span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            class="h-4 w-4 transition-colors duration-500 group-hover:text-[#05060f]"
            aria-hidden="true"
          >
            <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
