import {escapeHtml, sendMessageApi, TelegramNotConfiguredError} from '../utils/send-message.api'

interface ContactPayload {
  name?: string
  email?: string
  budget?: string
  message?: string
  /** honeypot — must stay empty */
  company?: string
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactPayload>(event)

  if (body?.company) {
    // bot filled the honeypot — pretend everything is fine
    return {ok: true}
  }

  const name = body?.name?.trim() ?? ''
  const email = body?.email?.trim() ?? ''
  const message = body?.message?.trim() ?? ''
  const budget = body?.budget?.trim() ?? '—'

  // codes only — the client renders the localized wording
  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'too-short'
  if (!isEmail(email)) errors.email = 'invalid'
  if (message.length < 10) errors.message = 'too-short'

  if (Object.keys(errors).length) {
    throw createError({statusCode: 422, statusMessage: 'Validation failed', data: {errors}})
  }

  const text = [
    '📬 <b>Новое сообщение с портфолио</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    `<b>Бюджет:</b> ${escapeHtml(budget)}`,
    '',
    escapeHtml(message)
  ].join('\n')

  try {
    await sendMessageApi(text, {parseMode: 'HTML'})
  } catch (err) {
    if (err instanceof TelegramNotConfiguredError) {
      throw createError({
        statusCode: 501,
        statusMessage: 'Contact channel is not configured',
        data: {reason: 'missing-config'}
      })
    }
    console.error('[contact]', err)
    throw createError({statusCode: 502, statusMessage: 'Delivery failed', data: {reason: 'delivery-failed'}})
  }

  return {ok: true}
})
