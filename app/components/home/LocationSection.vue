<script setup lang="ts">
const {t} = useI18n()
</script>

<template>
  <section class="pt-20 lg:pt-28">
    <div class="container">
      <SectionLabel index="05" :title="t('home.location.title')" />

      <div class="grid gap-10 lg:grid-cols-12 lg:items-end">
        <h2 class="font-display text-headline uppercase lg:col-span-7">{{ t('home.location.heading') }}</h2>

        <div class="lg:col-span-5">
          <p class="max-w-md text-ink-soft">{{ t('home.location.text') }}</p>
          <p class="mt-8 font-display text-xs uppercase tracking-[0.3em] text-ink-faint">
            {{ t('home.location.timeLabel') }} · GMT+5
          </p>
          <LocalClock />
        </div>
      </div>
    </div>

    <div class="mt-14 h-[66vh] max-h-[40rem] border-y border-line/15 sm:h-[52vh] lg:mt-20 lg:h-[70vh] lg:max-h-none">
      <ClientOnly>
        <TerrainMap />
        <template #fallback>
          <div class="h-full w-full bg-surface-alt" />
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
