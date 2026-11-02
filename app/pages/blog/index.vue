<script setup lang="ts">
import {HABR_PROFILE} from '~/data/habr'

const {t, locale} = useI18n()
const {entries, formatDate} = useHabrArticles()

useSiteSeo({
  title: () => t('blog.seoTitle'),
  description: () => t('blog.seoDescription'),
  card: {title: t('blog.title'), description: t('blog.subtitle'), eyebrow: t('blog.eyebrow')}
})

const site = useSiteUrl()
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: t('blog.seoTitle'),
  url: locale.value === 'en' ? `${site}/en/blog` : HABR_PROFILE,
  author: {'@id': `${site}/#person`},
  blogPost: entries.value.map((entry) => ({
    '@type': 'BlogPosting',
    headline: entry.title,
    url: entry.to ? `${site}${entry.to}` : entry.url,
    datePublished: entry.publishedAt,
    inLanguage: locale.value === 'en' ? 'en' : 'ru',
    ...(entry.cover && {image: entry.cover}),
    keywords: entry.tags.join(', '),
    author: {'@id': `${site}/#person`}
  }))
}))

const heroMeta = computed(() => [
  {label: t('blog.metaArticles'), value: String(entries.value.length || '—')},
  {label: t('blog.metaPlatform'), value: t('blog.metaPlatformValue')},
  {label: t('blog.metaLanguage'), value: t('blog.metaLanguageValue')}
])

const onProfileClick = () => track('blog_profile_clicked')
</script>

<template>
  <div>
    <PageHero index="03" :title="t('blog.title')" :subtitle="t('blog.subtitle')" :meta="heroMeta">
      <template #eyebrow>{{ t('blog.eyebrow') }}</template>
    </PageHero>

    <section class="container pb-10">
      <FadeUp v-if="entries.length" selector="[data-article]" :stagger="0.12" class="border-t border-line/15">
        <ArticleRow
          v-for="(entry, i) in entries"
          :key="entry.id"
          :article="entry"
          :index="i"
          :date="formatDate(entry.publishedAt)"
        />
      </FadeUp>

      <div v-else class="flex flex-col items-start gap-6 border-y border-line/15 py-16">
        <p class="max-w-md text-ink-soft">{{ t('blog.empty') }}</p>
        <ArrowLink :href="HABR_PROFILE" :label="t('blog.openProfile')" />
      </div>
    </section>

    <section v-if="entries.length" class="border-t border-line/15">
      <a
        v-cursor="{mode: 'view', label: t('common.open')}"
        :href="HABR_PROFILE"
        target="_blank"
        rel="noopener"
        class="group container flex flex-col gap-4 py-16 lg:py-24"
        @click="onProfileClick"
      >
        <span class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('blog.allOnHabr') }}</span>
        <span
          class="flex items-baseline gap-6 font-display text-display uppercase leading-[0.85] transition-transform duration-700 ease-expo group-hover:translate-x-4"
        >
          Habr
          <svg
            viewBox="0 0 16 16"
            fill="none"
            class="h-[0.5em] w-[0.5em] text-accent transition-transform duration-700 ease-expo group-hover:-translate-y-2 group-hover:translate-x-2"
            aria-hidden="true"
          >
            <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </span>
        <span class="text-sm text-ink-soft">@dadash_i</span>
      </a>
    </section>

    <ContactCta />
  </div>
</template>
