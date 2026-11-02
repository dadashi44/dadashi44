import {marked, type Token} from 'marked'
import {createHighlighter, type Highlighter} from 'shiki'
import {translations, type TranslatedArticle, type TranslationMeta} from '../../app/data/translations'

const LANGS = ['ts', 'js', 'vue', 'html', 'css', 'json', 'bash', 'rust', 'diff']
const THEMES = {light: 'github-light', dark: 'github-dark-default'} as const

let highlighter: Promise<Highlighter> | null = null
const getHighlighter = () =>
  (highlighter ??= createHighlighter({themes: Object.values(THEMES), langs: LANGS}))

/** `key: value` lines between --- fences; values are never quoted, so only the first colon splits */
const parseFile = (source: string) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return {data: {} as Record<string, string>, body: source}
  const data = Object.fromEntries(
    match[1]!
      .split('\n')
      .map((line) => line.match(/^(\w+):\s*(.*)$/))
      .filter((m): m is RegExpMatchArray => !!m)
      .map((m) => [m[1], m[2]!.trim()])
  )
  return {data, body: match[2]!}
}

const readSource = async (slug: string) => {
  const source = await useStorage('assets:blog').getItem<string>(`en/${slug}.md`)
  return source ? parseFile(String(source)) : null
}

const render = async (markdown: string) => {
  const shiki = await getHighlighter()
  const tokens = marked.lexer(markdown)

  // code blocks are swapped for shiki's markup before marked renders the rest;
  // both themes are emitted as CSS variables and the site's .dark class picks one
  const highlighted = tokens.map((token): Token => {
    if (token.type !== 'code') return token
    const lang = LANGS.includes(token.lang) ? token.lang : 'text'
    const html = shiki.codeToHtml(token.text, {lang, themes: THEMES, defaultColor: false})
    return {type: 'html', raw: token.raw, text: html, block: true, pre: true}
  })

  return (marked.parser(highlighted) as string)
    .replace(/<img /g, '<img loading="lazy" decoding="async" referrerpolicy="no-referrer" ')
    .replace(/<a href="(https?:)/g, '<a target="_blank" rel="noopener" href="$1')
}

const readingMinutes = (markdown: string) =>
  Math.max(1, Math.round(markdown.replace(/```[\s\S]*?```/g, '').split(/\s+/).length / 220))

export const getTranslationList = async (): Promise<TranslationMeta[]> => {
  const list = await Promise.all(
    translations.map(async (t) => {
      const file = await readSource(t.slug)
      return file ? {...t, title: file.data.title ?? '', description: file.data.description ?? ''} : null
    })
  )
  return list.filter((t): t is TranslationMeta => t !== null)
}

export const getTranslatedArticle = async (slug: string): Promise<TranslatedArticle | null> => {
  const entry = translations.find((t) => t.slug === slug)
  const file = entry && (await readSource(slug))
  if (!entry || !file) return null

  return {
    ...entry,
    title: file.data.title ?? '',
    description: file.data.description ?? '',
    html: await render(file.body),
    readingMinutes: readingMinutes(file.body)
  }
}
