<script setup lang="ts">
const {t, tm, rt} = useI18n()

useSiteSeo({
  title: () => t('contact.seoTitle'),
  description: () => t('contact.seoDescription')
})

const form = reactive({name: '', email: '', budget: '', message: '', company: ''})
const errors = ref<Record<string, string>>({})
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const errorText = ref('')

const budgets = computed(() => (tm('contact.budgets') as unknown[]).map((b) => rt(b as string)))

const mailtoFallback = computed(() => {
  const subject = encodeURIComponent(t('contact.mailSubject', {name: form.name || t('contact.mailFrom')}))
  const body = encodeURIComponent(`${form.message}\n\n${t('contact.budget')}: ${form.budget || '—'}\nEmail: ${form.email}`)
  return `mailto:asian.paradissseee@gmail.com?subject=${subject}&body=${body}`
})

const submit = async () => {
  status.value = 'sending'
  errors.value = {}
  errorText.value = ''

  try {
    await $fetch('/api/contact', {method: 'POST', body: {...form}})
    status.value = 'sent'
    Object.assign(form, {name: '', email: '', budget: '', message: '', company: ''})
  } catch (err: any) {
    const data = err?.data?.data
    if (data?.errors) {
      // the server returns field keys; the copy lives in the locale files
      errors.value = Object.fromEntries(
        Object.keys(data.errors).map((field) => [field, t(`contact.errors.${field}`)])
      )
      status.value = 'idle'
      return
    }
    status.value = 'error'
    errorText.value =
      data?.reason === 'missing-config' ? t('contact.errorNotConfigured') : t('contact.errorGeneric')
  }
}

const channels = computed(() => [
  {label: t('contact.labelEmail'), value: 'asian.paradissseee@gmail.com', href: 'mailto:asian.paradissseee@gmail.com'},
  {label: t('contact.labelPhone'), value: '+7 (700) 298-20-30', href: 'tel:+77002982030'},
  {label: t('contact.labelTelegram'), value: '@tadashi_brooo', href: 'https://t.me/tadashi_brooo'},
  {label: t('contact.labelGithub'), value: 'dadashi44', href: 'https://github.com/dadashi44'},
  {label: t('contact.labelLinkedin'), value: 'Dauren Abasov', href: 'https://www.linkedin.com/in/d-abasov-e60/'}
])

const fieldClass =
  'w-full border-b border-line/25 bg-transparent py-4 text-lg outline-none transition-colors duration-300 placeholder:text-ink-faint focus:border-accent'
</script>

<template>
  <div>
    <PageHero
      index="03"
      :title="t('contact.title')"
      :subtitle="t('contact.subtitle')"
      :meta="[
        {label: t('contact.metaStatus'), value: t('contact.metaStatusValue')},
        {label: t('contact.metaTimezone'), value: t('contact.metaTimezoneValue')},
        {label: t('contact.metaResponse'), value: t('contact.metaResponseValue')}
      ]"
    >
      <template #eyebrow>{{ t('contact.eyebrow') }}</template>
    </PageHero>

    <section class="container grid gap-16 pb-24 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24">
      <form class="space-y-8" novalidate @submit.prevent="submit">
        <!-- honeypot -->
        <input
          v-model="form.company"
          type="text"
          tabindex="-1"
          autocomplete="off"
          class="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        <div>
          <label for="name" class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">
            {{ t('contact.name') }}
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            :placeholder="t('contact.namePlaceholder')"
            :class="fieldClass"
          />
          <p v-if="errors.name" class="mt-2 text-xs text-accent">{{ errors.name }}</p>
        </div>

        <div>
          <label for="email" class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">
            {{ t('contact.email') }}
          </label>
          <input id="email" v-model="form.email" type="email" placeholder="you@company.com" :class="fieldClass" />
          <p v-if="errors.email" class="mt-2 text-xs text-accent">{{ errors.email }}</p>
        </div>

        <div>
          <span class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('contact.budget') }}</span>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="b in budgets"
              :key="b"
              v-cursor="'link'"
              type="button"
              class="rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors duration-300"
              :class="form.budget === b ? 'border-ink bg-ink text-surface' : 'border-line/25 text-ink-soft hover:text-ink'"
              @click="form.budget = form.budget === b ? '' : b"
            >
              {{ b }}
            </button>
          </div>
        </div>

        <div>
          <label for="message" class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">
            {{ t('contact.message') }}
          </label>
          <textarea
            id="message"
            v-model="form.message"
            rows="4"
            :placeholder="t('contact.messagePlaceholder')"
            :class="[fieldClass, 'resize-none']"
          />
          <p v-if="errors.message" class="mt-2 text-xs text-accent">{{ errors.message }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-6">
          <MagneticEl :strength="0.25">
            <button
              v-cursor="{mode: 'view', label: t('common.send')}"
              type="submit"
              :disabled="status === 'sending'"
              class="rounded-full bg-ink px-10 py-5 text-sm uppercase tracking-[0.2em] text-surface transition-opacity duration-300 disabled:opacity-50"
            >
              {{ status === 'sending' ? t('contact.sending') : status === 'sent' ? t('contact.sent') : t('contact.submit') }}
            </button>
          </MagneticEl>

          <p v-if="status === 'sent'" class="text-sm text-ink-soft">{{ t('contact.thanks') }}</p>
          <div v-else-if="status === 'error'" class="text-sm text-ink-soft">
            {{ errorText }}
            <a :href="mailtoFallback" class="link-underline ml-1 text-ink">{{ t('contact.writeByMail') }}</a>
          </div>
        </div>
      </form>

      <aside class="space-y-10">
        <div>
          <p class="mb-6 font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('contact.channels') }}</p>
          <ul class="space-y-4">
            <li v-for="channel in channels" :key="channel.label" class="border-b border-line/15 pb-4">
              <p class="text-xs uppercase tracking-[0.2em] text-ink-faint">{{ channel.label }}</p>
              <a
                v-cursor="'link'"
                :href="channel.href"
                target="_blank"
                rel="noopener noreferrer"
                class="link-underline mt-1 inline-block text-lg"
              >
                {{ channel.value }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p class="mb-6 font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('contact.resume') }}</p>
          <ArrowLink href="/Abasov_Dauren_Resume.pdf" :label="t('contact.downloadCvPdf')" />
        </div>

        <div class="rounded-xl border border-line/15 p-6">
          <p class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('contact.nowIn') }}</p>
          <ClientOnly>
            <LocalClock />
          </ClientOnly>
        </div>
      </aside>
    </section>
  </div>
</template>
