import type {HabrArticle} from '../../app/data/habr'

// the old /users/<name>/articles/ feed only answers with a "document moved" page
const FEED_URL = 'https://habr.com/ru/rss/users/dadash_i/publications/articles/?fl=ru'
const EXCERPT_LENGTH = 220

const ENTITIES: Record<string, string> = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '}

const decode = (text: string) =>
  text.replace(/&(#x?[\da-f]+|\w+);/gi, (match, code: string) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match
    const point = code[1]?.toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
    return Number.isNaN(point) ? match : String.fromCodePoint(point)
  })

const cdata = (value = '') => value.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim()

const tag = (xml: string, name: string) => cdata(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1])

/** The feed carries only the text above the cut; the first paragraphs are enough for a teaser. */
const excerptOf = (html: string) => {
  const text = decode(
    html
      .replace(/<a[^>]*#habracut[^>]*>[\s\S]*?<\/a>/g, '')
      .replace(/<\/p>|<br\s*\/?>/g, ' ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= EXCERPT_LENGTH) return text
  const cut = text.slice(0, EXCERPT_LENGTH)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:—–-]+$/, '')}…`
}

const parseItem = (xml: string): HabrArticle | null => {
  const url = tag(xml, 'guid')
  const id = url.match(/\/articles\/(\d+)/)?.[1]
  if (!id) return null

  const description = tag(xml, 'description')
  const categories = [...xml.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((m) => decode(cdata(m[1])))

  return {
    id,
    // Habr titles use non-breaking hyphens (vue‑why‑render), which break search and copy-paste
    title: decode(tag(xml, 'title')).replace(/‑/g, '-'),
    url,
    publishedAt: new Date(tag(xml, 'pubDate')).toISOString(),
    cover: description.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? null,
    excerpt: excerptOf(description),
    // hubs come first, then the author's tags; the same word can appear in both
    tags: categories.filter((c, i) => categories.findIndex((other) => other.toLowerCase() === c.toLowerCase()) === i)
  }
}

/**
 * Articles from the Habr profile, newest first. A failed fetch throws instead of
 * returning [] so the cache never keeps an empty list; with swr the last good
 * list is served while the refresh is retried.
 */
export default defineCachedEventHandler(
  async () => {
    const xml = await $fetch<string>(FEED_URL, {responseType: 'text', timeout: 5000})
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => parseItem(m[1]!))

    return items
      .filter((item): item is HabrArticle => item !== null)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  },
  {name: 'habr-articles', maxAge: 60 * 60 * 6, swr: true}
)
