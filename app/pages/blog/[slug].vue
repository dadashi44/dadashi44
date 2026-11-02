<script setup lang="ts">
import type {TranslatedArticle} from '~/data/translations'

definePageMeta({englishOnly: true})

const route = useRoute()
const {t, locale} = useI18n()
const localePath = useLocalePath()
const slug = computed(() => String(route.params.slug))

const {data: article, error} = await useFetch<TranslatedArticle>(() => `/api/blog/${slug.value}`, {
  key: () => `blog-article-${slug.value}`
})

if (error.value || !article.value) {
  throw createError({statusCode: 404, statusMessage: 'Article not found', fatal: true})
}

const habrUrl = computed(() => `https://habr.com/ru/articles/${article.value!.id}/`)

// translations only exist in English; the Russian version of an article is the Habr original
if (locale.value !== 'en') {
  await navigateTo(habrUrl.value, {external: true, redirectCode: 301})
}

const {articles, entries, formatDate} = useHabrArticles()
// date, cover and tags come from the Habr feed; the article page still works without them
const original = computed(() => articles.value.find((a) => a.id === article.value!.id))
const next = computed(() => {
  const list = entries.value
  const index = list.findIndex((e) => e.id === article.value!.id)
  return list.length > 1 && index !== -1 ? list[(index + 1) % list.length] : undefined
})

useSiteSeo({
  title: () => article.value!.title,
  description: () => article.value!.description,
  type: 'article',
  card: {title: article.value!.title, description: article.value!.description, eyebrow: t('blog.title')}
})

const site = useSiteUrl()
useJsonLd(() => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.value!.title,
  description: article.value!.description,
  url: `${site}${route.path}`,
  inLanguage: 'en',
  ...(original.value && {datePublished: original.value.publishedAt}),
  ...(original.value?.cover && {image: original.value.cover}),
  ...(original.value && {keywords: original.value.tags.join(', ')}),
  translationOfWork: {'@type': 'BlogPosting', url: habrUrl.value, inLanguage: 'ru'},
  author: {'@id': `${site}/#person`}
}))

const heroMeta = computed(() => [
  ...(original.value ? [{label: t('blog.published'), value: formatDate(original.value.publishedAt)}] : []),
  {label: t('blog.readingTime'), value: t('blog.minutes', {count: article.value!.readingMinutes})},
  {label: t('blog.original'), value: t('blog.originalValue')}
])

const cover = ref<HTMLElement | null>(null)

onMounted(() => {
  const api = useMotion()
  if (!api || !cover.value || api.reduced) return
  api.gsap.from(cover.value, {clipPath: 'inset(12% 12% 12% 12% round 12px)', duration: 1.4, ease: 'expo.out', delay: 0.2})
})

const onOriginalClick = () => track('blog_original_clicked', {article_id: article.value!.id})
</script>

<template>
  <article v-if="article">
    <header class="container pb-12 pt-16 lg:pb-16 lg:pt-24">
      <div class="flex items-center gap-4 border-b border-line/15 pb-5">
        <NuxtLink
          v-cursor="'link'"
          :to="localePath('/blog')"
          class="group flex items-center gap-2 font-display text-xs uppercase tracking-[0.3em] text-ink-soft transition-colors duration-300 hover:text-ink"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            class="h-3 w-3 transition-transform duration-500 ease-expo group-hover:-translate-x-1"
            aria-hidden="true"
          >
            <path d="M13 8H3M3 8L7.5 3.5M3 8L7.5 12.5" stroke="currentColor" stroke-width="1.5" />
          </svg>
          {{ t('blog.title') }}
        </NuxtLink>
        <span class="ml-auto font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('blog.translated') }}</span>
      </div>

      <h1 class="mt-10 max-w-6xl font-display uppercase">
        <SplitReveal as="span" type="words" :stagger="0.03" class="block text-headline" :text="article.title" />
      </h1>

      <div class="mt-10 flex flex-wrap items-start justify-between gap-8">
        <SplitReveal as="p" class="max-w-2xl text-base text-ink-soft lg:text-lg" :text="article.description" />
        <dl class="grid grid-cols-2 gap-x-10 gap-y-4 text-sm sm:grid-cols-3">
          <div v-for="item in heroMeta" :key="item.label">
            <dt class="font-display text-[10px] uppercase tracking-[0.25em] text-ink-faint">{{ item.label }}</dt>
            <dd class="mt-1 text-ink">{{ item.value }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <div v-if="original?.cover" class="container">
      <div ref="cover" class="overflow-hidden rounded-xl">
        <img :src="original.cover" alt="" referrerpolicy="no-referrer" class="block h-auto w-full" />
      </div>
    </div>

    <div class="container py-16 lg:py-24">
      <!-- eslint-disable-next-line vue/no-v-html -- our own Markdown, rendered on the server -->
      <div class="article-body mx-auto max-w-[44rem]" v-html="article.html" />

      <aside class="mx-auto mt-16 flex max-w-[44rem] flex-col gap-6 rounded-xl border border-line/15 p-8 sm:flex-row sm:items-center sm:justify-between">
        <p class="max-w-sm text-sm leading-relaxed text-ink-soft">{{ t('blog.originalNote') }}</p>
        <ArrowLink :href="habrUrl" :label="t('blog.readOriginal')" size="sm" @click="onOriginalClick" />
      </aside>
    </div>

    <section v-if="next?.to" class="border-t border-line/15">
      <NuxtLink
        v-cursor="{mode: 'view', label: t('common.next')}"
        :to="next.to"
        class="group container flex flex-col gap-4 py-16 lg:py-24"
      >
        <span class="font-display text-xs uppercase tracking-[0.3em] text-ink-faint">{{ t('blog.nextArticle') }}</span>
        <span
          class="max-w-5xl font-display text-headline uppercase transition-transform duration-700 ease-expo group-hover:translate-x-4"
        >
          {{ next.title }}
        </span>
      </NuxtLink>
    </section>

    <ContactCta />
  </article>
</template>
