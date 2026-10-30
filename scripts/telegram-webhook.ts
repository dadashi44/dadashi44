/**
 * Points @dadashi44_bot at the site and sets up its command menu.
 *
 *   bun scripts/telegram-webhook.ts                         # https://dadashi44.is-a.dev
 *   bun scripts/telegram-webhook.ts https://my-domain.kz    # another deployment
 *   bun scripts/telegram-webhook.ts --info                  # show the current webhook
 *
 * Bun loads .env, so NUXT_TELEGRAM_BOT_TOKEN and NUXT_TELEGRAM_WEBHOOK_SECRET
 * come from there. The same secret must be set in Vercel, otherwise the site
 * rejects every update with 401.
 *
 * Note: while a webhook is set, getUpdates stops working for this bot.
 */
const token = process.env.NUXT_TELEGRAM_BOT_TOKEN
const secret = process.env.NUXT_TELEGRAM_WEBHOOK_SECRET
if (!token) throw new Error('NUXT_TELEGRAM_BOT_TOKEN is missing in .env')

const api = async (method: string, body: Record<string, unknown> = {}) => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(body)
  })
  const json = (await response.json()) as {ok: boolean; result?: unknown; description?: string}
  if (!json.ok) throw new Error(`${method}: ${json.description}`)
  return json.result
}

const arg = process.argv[2]

if (arg === '--info') {
  const info = (await api('getWebhookInfo')) as Record<string, unknown>
  console.log({url: info.url || '(none)', pending: info.pending_update_count, lastError: info.last_error_message})
} else {
  if (!secret) throw new Error('NUXT_TELEGRAM_WEBHOOK_SECRET is missing in .env')
  const origin = (arg ?? 'https://dadashi44.is-a.dev').replace(/\/$/, '')

  await api('setWebhook', {
    url: `${origin}/api/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true
  })

  // the "/" menu next to the input field, per user language
  await api('setMyCommands', {
    commands: [
      {command: 'start', description: 'Начать'},
      {command: 'resume', description: 'Получить резюме'}
    ],
    language_code: 'ru'
  })
  await api('setMyCommands', {
    commands: [
      {command: 'start', description: 'Start'},
      {command: 'resume', description: 'Get the CV'}
    ]
  })

  console.log(`webhook → ${origin}/api/telegram/webhook`)
}
