/**
 * Serves the CV from Telegram, so updating it needs no deploy: post the PDF to
 * the resume channel (NUXT_TELEGRAM_RESUME_CHAT_ID, the bot is an admin there)
 * and pin it. It has to be a channel or a group — for a private chat with the
 * bot, getChat never returns the pinned message.
 *
 * The file is proxied rather than redirected to — Telegram's download URL
 * contains the bot token. The CDN keeps a copy for 10 minutes, so visitors
 * don't wait on Telegram and a new pin shows up within that window.
 *
 * Anything off (not configured, nothing pinned, the pin isn't a PDF, Telegram
 * down) falls back to the static copy in /public, so the link never breaks.
 */
const FALLBACK = '/Abasov_Dauren_Resume.pdf'
const FILENAME = 'Abasov_Dauren_Resume.pdf'
/** the Bot API refuses to hand out files above 20 MB */
const MAX_BYTES = 20 * 1024 * 1024

interface TelegramDocument {
  file_id: string
  mime_type?: string
  file_size?: number
}

interface TelegramResponse<T> {
  ok: boolean
  result: T
}

export default defineEventHandler(async (event) => {
  const {telegramBotToken, telegramResumeChatId} = useRuntimeConfig(event)

  try {
    if (!telegramBotToken || !telegramResumeChatId) throw new Error('resume channel is not configured')

    const api = (method: string, query: Record<string, string>) =>
      $fetch<TelegramResponse<any>>(`https://api.telegram.org/bot${telegramBotToken}/${method}`, {query})

    const chat = await api('getChat', {chat_id: telegramResumeChatId})
    const document: TelegramDocument | undefined = chat.result?.pinned_message?.document
    if (!document || document.mime_type !== 'application/pdf') throw new Error('no pinned PDF in the channel')
    if ((document.file_size ?? 0) > MAX_BYTES) throw new Error('pinned PDF is over 20 MB')

    const file = await api('getFile', {file_id: document.file_id})
    const pdf = await fetch(`https://api.telegram.org/file/bot${telegramBotToken}/${file.result.file_path}`)
    if (!pdf.ok || !pdf.body) throw new Error(`download failed: ${pdf.status}`)

    setHeaders(event, {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="${FILENAME}"`,
      'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
    })
    const length = Number(pdf.headers.get('content-length'))
    if (length) setHeader(event, 'content-length', length)

    return sendStream(event, pdf.body)
  } catch (err) {
    // never log the error object as is — Telegram URLs in it carry the token
    console.warn('[resume] serving the static copy:', err instanceof Error ? err.message.replace(/bot[^/]+/g, 'bot***') : err)
    // short cache, so a fresh pin is picked up soon after Telegram recovers
    setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=60')
    return sendRedirect(event, FALLBACK, 302)
  }
})
