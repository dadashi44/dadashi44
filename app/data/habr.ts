/** One article from the Habr RSS feed, as served by /api/habr-articles. */
export interface HabrArticle {
  /** the numeric id from the article URL — libraries refer to articles by it */
  id: string
  title: string
  /** canonical article URL, without the feed's utm tags */
  url: string
  /** ISO date */
  publishedAt: string
  cover: string | null
  /** plain text from above the cut, trimmed for a teaser */
  excerpt: string
  /** hubs and tags, deduplicated */
  tags: string[]
}

export const HABR_PROFILE = 'https://habr.com/ru/users/dadash_i/articles/'
