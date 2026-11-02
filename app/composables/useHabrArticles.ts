import type {HabrArticle} from '~/data/habr'
import type {TranslationMeta} from '~/data/translations'

/** An article as the blog shows it: `to` is set when it opens on the site instead of Habr. */
export interface BlogEntry extends HabrArticle {
  to?: string
}

/**
 * Articles from Habr. Best effort like the npm downloads: if the feed is down,
 * the list is empty and pages fall back to a link to the profile.
 *
 * In English only the articles with a translation are listed, with the English
 * title and teaser, and they open on the site — never a Russian text.
 */
export const useHabrArticles = () => {
  const {locale} = useI18n()
  const localePath = useLocalePath()

  const {data: articles, status} = useFetch<HabrArticle[]>('/api/habr-articles', {
    key: 'habr-articles',
    default: () => []
  })

  const {data: translations} = useFetch<TranslationMeta[]>('/api/blog/translations', {
    key: 'blog-translations',
    default: () => []
  })

  const entries = computed<BlogEntry[]>(() => {
    if (locale.value !== 'en') return articles.value

    return articles.value.flatMap((article) => {
      const translation = translations.value.find((t) => t.id === article.id)
      if (!translation) return []
      return [
        {
          ...article,
          title: translation.title,
          excerpt: translation.description,
          to: localePath(`/blog/${translation.slug}`)
        }
      ]
    })
  })

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Almaty'
    }).format(new Date(iso))

  const byIds = (ids: string[] = []) =>
    ids.map((id) => entries.value.find((entry) => entry.id === id)).filter((e): e is BlogEntry => !!e)

  return {articles, entries, status, formatDate, byIds}
}
