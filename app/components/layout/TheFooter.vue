<script setup lang="ts">
const {t} = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()

const useful = computed(() => [
  {name: t('nav.home'), path: localePath('/')},
  {name: t('nav.work'), path: localePath('/work')},
  {name: t('nav.about'), path: localePath('/about')},
  {name: t('nav.contact'), path: localePath('/contact')}
])

const social = [
  {name: 'Telegram', path: 'https://t.me/tadashi_brooo'},
  {name: 'GitHub', path: 'https://github.com/dadashi44'},
  {name: 'LinkedIn', path: 'https://www.linkedin.com/in/d-abasov-e60/'},
  {name: 'Instagram', path: 'https://www.instagram.com/daurenkx/'}
]

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
  <footer class="relative overflow-hidden border-t border-line/15 bg-surface-alt pt-20">
    <div class="container">
      <div class="grid gap-14 pb-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p class="max-w-md font-display text-title uppercase leading-[0.95]">{{ t('home.footerCta') }}</p>
          <div class="mt-8 flex flex-wrap gap-4">
            <ArrowLink :to="localePath('/contact')" :label="t('home.startProject')" size="lg" />
            <ArrowLink href="/Abasov_Dauren_Resume.pdf" :label="t('common.cv')" size="lg" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-10">
          <nav>
            <p class="mb-6 font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('common.menu') }}</p>
            <ul class="space-y-3">
              <li v-for="link in useful" :key="link.path">
                <NuxtLink v-cursor="'link'" :to="link.path" class="link-underline text-sm text-ink-soft hover:text-ink">
                  {{ link.name }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
          <nav>
            <p class="mb-6 font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('common.social') }}</p>
            <ul class="space-y-3">
              <li v-for="link in social" :key="link.path">
                <a
                  v-cursor="'link'"
                  :href="link.path"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-underline text-sm text-ink-soft hover:text-ink"
                >
                  {{ link.name }}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div
        class="flex flex-col gap-3 border-t border-line/15 py-8 text-xs uppercase tracking-[0.2em] text-ink-faint sm:flex-row sm:items-center sm:justify-between"
      >
        <span>{{ t('common.rights', {year}) }}</span>
        <ClientOnly>
          <span>{{ t('common.location', {time}) }}</span>
          <template #fallback><span>{{ t('common.location', {time: '--:--:--'}) }}</span></template>
        </ClientOnly>
        <span>{{ t('common.builtWith') }}</span>
      </div>
    </div>

    <div class="select-none overflow-hidden">
      <p class="translate-y-[18%] whitespace-nowrap text-center font-display text-[22vw] leading-none text-ink/10">
        DADASHI
      </p>
    </div>
  </footer>
</template>
