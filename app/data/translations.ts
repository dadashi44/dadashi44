/**
 * English versions of Habr articles, hosted on the site at /en/blog/<slug>.
 * The text lives in content/blog/en/<slug>.md; this list ties each file to its
 * Habr original. An article without an entry here is simply not listed in English.
 */
export interface Translation {
  /** Habr article id — the number in habr.com/ru/articles/<id>/ */
  id: string
  slug: string
}

export const translations: Translation[] = [
  {id: '1101308', slug: 'vue-llm'},
  {id: '1098942', slug: 'vue-why-render-0-8'},
  {id: '1085472', slug: 'why-did-my-component-rerender'}
]

/** what /api/blog/translations serves: the list plus the English title and teaser */
export interface TranslationMeta extends Translation {
  title: string
  description: string
}

export interface TranslatedArticle extends TranslationMeta {
  html: string
  /** whole minutes, at least 1 */
  readingMinutes: number
}
