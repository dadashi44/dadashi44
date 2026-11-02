import type {HabrArticle} from '~/data/habr'

/**
 * Articles from Habr. Best effort like the npm downloads: if the feed is down,
 * the list is empty and pages fall back to a link to the profile.
 */
export const useHabrArticles = () => {
  const {locale} = useI18n()

  const {data: articles, status} = useFetch<HabrArticle[]>('/api/habr-articles', {
    key: 'habr-articles',
    default: () => []
  })

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Almaty'
    }).format(new Date(iso))

  const byIds = (ids: string[] = []) =>
    ids.map((id) => articles.value.find((article) => article.id === id)).filter((a): a is HabrArticle => !!a)

  return {articles, status, formatDate, byIds}
}
