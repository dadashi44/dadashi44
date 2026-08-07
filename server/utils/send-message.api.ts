/**
 * Telegram delivery — same shape as the old `sendMessageApi(message)` helper,
 * with two changes that matter:
 *  - token and chat id come from the environment, not from the source file;
 *  - the text goes in the POST body, so long messages and `&`, `#`, `+`
 *    are not mangled the way a query string mangles them.
 */
export interface SendMessageOptions {
  /** override the chat from NUXT_TELEGRAM_CHAT_ID (e.g. a second recipient) */
  chatId?: string
  parseMode?: 'HTML' | 'MarkdownV2'
}

export class TelegramNotConfiguredError extends Error {
  constructor() {
    super('Telegram is not configured: set NUXT_TELEGRAM_BOT_TOKEN and NUXT_TELEGRAM_CHAT_ID')
    this.name = 'TelegramNotConfiguredError'
  }
}

/** Escapes the five characters Telegram treats as HTML in `parse_mode: 'HTML'`. */
export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const sendMessageApi = async (message: string, options: SendMessageOptions = {}) => {
  const {telegramBotToken, telegramChatId} = useRuntimeConfig()
  const chatId = options.chatId ?? telegramChatId

  if (!telegramBotToken || !chatId) throw new TelegramNotConfiguredError()

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`

  try {
    return await $fetch<{ok: boolean}>(url, {
      method: 'POST',
      body: {
        chat_id: chatId,
        text: message,
        parse_mode: options.parseMode,
        disable_web_page_preview: true
      }
    })
  } catch (err: any) {
    // Telegram puts the real reason in `description` — keep it, it is the
    // difference between "wrong chat id" and "bot was blocked"
    const description = err?.data?.description ?? err?.message ?? 'unknown error'
    throw new Error(`Failed to send message. ${description}`)
  }
}
