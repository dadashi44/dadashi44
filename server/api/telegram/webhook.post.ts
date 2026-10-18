import {timingSafeEqual} from 'node:crypto'

/**
 * Telegram webhook for @dadashi44_bot: /start and /resume answer with buttons,
 * and a button sends the CV in that language straight from the resume channel
 * (by file_id, so nothing is downloaded). The owner gets a note on every
 * request. Registered by scripts/telegram-webhook.ts.
 *
 * Telegram signs each call with the secret from setWebhook; anything without
 * it is rejected before the body is read.
 */
interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
}

interface TelegramUpdate {
  message?: {chat: {id: number; type: string}; from?: TelegramUser; text?: string}
  callback_query?: {id: string; from: TelegramUser; data?: string; message?: {chat: {id: number}}}
}

/** Russian for the post-Soviet languages, English for everyone else */
const langOf = (user?: TelegramUser): ResumeLang =>
  ['ru', 'kk', 'ky', 'uk', 'be', 'uz'].includes(user?.language_code?.slice(0, 2) ?? '') ? 'ru' : 'en'

const COPY = {
  ru: {
    greeting:
      'Привет! Я бот Даурена Абасова — frontend-разработчика из Алматы.\n\nЗдесь можно скачать резюме или открыть сайт с проектами.',
    pick: 'Какое резюме прислать?',
    site: '🌐 Сайт',
    caption: 'Резюме — Даурен Абасов',
    unavailable: 'Не получилось достать файл из Telegram. Резюме можно скачать на сайте:'
  },
  en: {
    greeting:
      "Hi! I'm the bot of Dauren Abasov, a frontend developer from Almaty.\n\nGrab the CV here or open the site with the projects.",
    pick: 'Which CV should I send?',
    site: '🌐 Website',
    caption: 'CV — Dauren Abasov',
    unavailable: "Couldn't fetch the file from Telegram. The CV is also on the site:"
  }
} as const

const isSecretValid = (given: string | undefined, expected: string) => {
  if (!given || !expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const displayName = (user: TelegramUser) =>
  [user.first_name, user.last_name].filter(Boolean).join(' ') + (user.username ? ` (@${user.username})` : '')

export default defineEventHandler(async (event) => {
  const {telegramWebhookSecret, telegramChatId, public: {siteUrl}} = useRuntimeConfig(event)

  if (!isSecretValid(getHeader(event, 'x-telegram-bot-api-secret-token'), telegramWebhookSecret)) {
    throw createError({statusCode: 401, statusMessage: 'Unauthorized'})
  }

  const update = await readBody<TelegramUpdate>(event)
  const site = String(siteUrl).replace(/\/$/, '')

  const siteLink = (lang: ResumeLang) => `${site}${lang === 'en' ? '/en' : ''}?utm_source=telegram_bot`
  const resumeLink = (lang: ResumeLang) => `${site}/resume${lang === 'en' ? '-en' : ''}.pdf`

  const keyboard = (lang: ResumeLang) => ({
    inline_keyboard: [
      [
        {text: '📄 Резюме (RU)', callback_data: 'cv:ru'},
        {text: '📄 Resume (EN)', callback_data: 'cv:en'}
      ],
      [{text: COPY[lang].site, url: siteLink(lang)}]
    ]
  })

  const sendResume = async (chatId: number, lang: ResumeLang, user: TelegramUser) => {
    try {
      const document = await findPinnedResume(lang)
      await telegramApi('sendDocument', {chat_id: chatId, document: document.file_id, caption: COPY[lang].caption})
    } catch (err) {
      console.warn('[bot] resume unavailable:', scrubToken(err))
      await telegramApi('sendMessage', {chat_id: chatId, text: `${COPY[lang].unavailable}\n${resumeLink(lang)}`})
    }

    // a heads-up for the owner, unless they are testing the bot themselves
    if (telegramChatId && String(user.id) !== String(telegramChatId)) {
      await telegramApi('sendMessage', {
        chat_id: telegramChatId,
        text: `📄 <b>Запросили резюме (${lang.toUpperCase()})</b>\n${escapeHtml(displayName(user))}`,
        parse_mode: 'HTML'
      }).catch((err) => console.warn('[bot] owner note failed:', scrubToken(err)))
    }
  }

  try {
    const message = update.message
    // the bot only talks in private chats; channel posts and groups are ignored
    if (message?.text && message.chat.type === 'private') {
      const command = message.text.trim().split(/[\s@]/)[0]?.toLowerCase()
      const lang = langOf(message.from)

      if (command === '/start') {
        await telegramApi('sendMessage', {chat_id: message.chat.id, text: COPY[lang].greeting, reply_markup: keyboard(lang)})
      } else if (command === '/resume' || command === '/cv') {
        await telegramApi('sendMessage', {chat_id: message.chat.id, text: COPY[lang].pick, reply_markup: keyboard(lang)})
      }
    }

    const callback = update.callback_query
    if (callback?.data?.startsWith('cv:') && callback.message) {
      const lang: ResumeLang = callback.data === 'cv:en' ? 'en' : 'ru'
      // stop the button's loading spinner right away
      await telegramApi('answerCallbackQuery', {callback_query_id: callback.id})
      await sendResume(callback.message.chat.id, lang, callback.from)
    }
  } catch (err) {
    console.error('[bot]', scrubToken(err))
  }

  // always 200: a failed update retried by Telegram would only fail again
  return {ok: true}
})
