<script setup lang="ts">
const {t} = useI18n()
const localePath = useLocalePath()
const {list: projects} = useProjects()

const section = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !section.value || !track.value) return
  const {gsap, ScrollTrigger} = api

  const mm = gsap.matchMedia()

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => track.value!.scrollWidth - window.innerWidth + 80

    const tween = gsap.to(track.value, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section.value,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    })

    // slight counter-parallax for the card labels
    gsap.utils.toArray<HTMLElement>('[data-showcase-label]').forEach((label) => {
      gsap.to(label, {
        x: 60,
        ease: 'none',
        scrollTrigger: {trigger: section.value, start: 'top top', end: () => `+=${distance()}`, scrub: true}
      })
    })

    return () => tween.kill()
  })

  onBeforeUnmount(() => {
    mm.revert()
    ScrollTrigger.refresh()
  })
})
</script>

<template>
  <section ref="section" class="relative overflow-hidden py-20 lg:h-svh lg:py-0">
    <div class="container lg:pt-24">
      <SectionLabel index="03" :title="t('home.worksTitle')" />
    </div>

    <div ref="track" class="flex flex-col gap-10 px-5 lg:h-[62vh] lg:w-max lg:flex-row lg:items-stretch lg:gap-8 lg:px-10">
      <NuxtLink
        v-for="(project, i) in projects"
        :key="project.slug"
        v-cursor="{mode: 'view', label: t('common.view')}"
        :to="localePath(`/work/${project.slug}`)"
        class="group relative block shrink-0 overflow-hidden rounded-xl lg:w-[34rem]"
      >
        <div class="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:h-full">
          <div class="absolute inset-0 transition-transform duration-[900ms] ease-expo group-hover:scale-105">
            <ProjectVisual :project="project" />
          </div>

          <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
            <div data-showcase-label>
              <span class="font-display text-xs uppercase tracking-[0.25em] text-white/70">
                {{ String(i + 1).padStart(2, '0') }} —
                {{ project.kind === 'mobile' ? t('common.mobileApp') : t('common.website') }}
              </span>
              <h3 class="mt-1 font-display text-4xl uppercase leading-none text-white lg:text-5xl">
                {{ project.name }}
              </h3>
              <p class="mt-2 max-w-sm text-xs text-white/70">{{ project.client }}</p>
            </div>
            <span class="shrink-0 font-display text-xs tracking-[0.2em] text-white/70">{{ project.year }}</span>
          </div>
        </div>
      </NuxtLink>

      <div class="flex shrink-0 items-center justify-center lg:w-[26rem]">
        <div class="text-center">
          <p class="whitespace-pre-line font-display text-title uppercase leading-none">
            {{ t('home.moreProjects') }}
          </p>
          <ArrowLink :to="localePath('/work')" :label="t('common.allWork')" size="lg" class="mt-6" />
        </div>
      </div>
    </div>
  </section>
</template>
