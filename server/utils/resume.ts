import type {H3Event} from 'h3'

/**
 * The CV lives in Telegram, so updating it needs no deploy: post the PDF to a
 * resume channel (the bot is an admin there) and pin it. It has to be a
 * channel or a group — for a private chat with the bot, getChat never returns
 * the pinned message. A chat exposes only its latest pin, so each language
 * gets its own channel.
 *
 * Both the site (/resume.pdf, /resume-en.pdf) and the bot's buttons read it
 * from here.
 */
const FALLBACK = '/Abasov_Dauren_Resume.pdf'
/** the Bot API refuses to hand out files above 20 MB */
const MAX_BYTES = 20 * 1024 * 1024

export type ResumeLang = 'ru' | 'en'

export interface TelegramDocument {
  file_id: string
  file_name?: string
  mime_type?: string
  file_size?: number
}

/** channels to try for a language — English falls back to Russian until it has a pin */
export const resumeChannels = (lang: ResumeLang) => {
  const {telegramResumeChatId, telegramResumeEnChatId} = useRuntimeConfig()
  return (lang === 'en' ? [telegramResumeEnChatId, telegramResumeChatId] : [telegramResumeChatId]).filter(Boolean)
}

/** Telegram URLs carry the bot token, so errors are scrubbed before they are logged. */
export const scrubToken = (err: unknown) =>
  err instanceof Error ? err.message.replace(/bot[^/\s]+/g, 'bot***') : String(err)

/**
 * The pinned PDF of the first channel that has one. Throws with every reason
 * when none does.
 */
export const findPinnedResume = async (lang: ResumeLang): Promise<TelegramDocument> => {
  const channels = resumeChannels(lang)
  if (!channels.length) throw new Error('no resume channel is configured')

  const reasons: string[] = []
  for (const chatId of channels) {
    try {
      const chat = await telegramApi<{pinned_message?: {document?: TelegramDocument}}>('getChat', {chat_id: chatId})
      const document = chat.pinned_message?.document
      if (!document || document.mime_type !== 'application/pdf') throw new Error('no pinned PDF in the channel')
      if ((document.file_size ?? 0) > MAX_BYTES) throw new Error('pinned PDF is over 20 MB')
      return document
    } catch (err) {
      reasons.push(scrubToken(err))
    }
  }
  throw new Error(reasons.join('; '))
}

/**
 * Streams the pinned PDF through the site — redirecting would hand out
 * Telegram's download URL, which contains the bot token. The CDN keeps a copy
 * for 10 minutes, so visitors don't wait on Telegram and a new pin shows up
 * within that window. Anything off falls back to the static copy in /public,
 * so the link never breaks.
 */
export const serveResume = async (event: H3Event, lang: ResumeLang, filename: string) => {
  try {
    const document = await findPinnedResume(lang)
    const file = await telegramApi<{file_path: string}>('getFile', {file_id: document.file_id})
    const {telegramBotToken} = useRuntimeConfig(event)
    const pdf = await fetch(`https://api.telegram.org/file/bot${telegramBotToken}/${file.file_path}`)
    if (!pdf.ok || !pdf.body) throw new Error(`download failed: ${pdf.status}`)

    setHeaders(event, {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="${filename}"`,
      'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
    })
    const length = Number(pdf.headers.get('content-length'))
    if (length) setHeader(event, 'content-length', length)

    return sendStream(event, pdf.body)
  } catch (err) {
    console.warn('[resume] serving the static copy:', scrubToken(err))
    // short cache, so a fresh pin is picked up soon after Telegram recovers
    setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=60')
    return sendRedirect(event, FALLBACK, 302)
  }
}
