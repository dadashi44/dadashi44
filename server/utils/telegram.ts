/**
 * A thin Bot API client: POSTs JSON and returns `result`, or throws with
 * Telegram's own `description` (the difference between "wrong chat id" and
 * "bot was blocked"). The token comes from NUXT_TELEGRAM_BOT_TOKEN.
 */
export const telegramApi = async <T = unknown>(method: string, body: Record<string, unknown> = {}): Promise<T> => {
  const {telegramBotToken} = useRuntimeConfig()
  if (!telegramBotToken) throw new Error('bot token is not configured')

  try {
    const response = await $fetch<{ok: boolean; result: T}>(
      `https://api.telegram.org/bot${telegramBotToken}/${method}`,
      {method: 'POST', body}
    )
    return response.result
  } catch (err: any) {
    throw new Error(`${method}: ${err?.data?.description ?? err?.message ?? 'unknown error'}`)
  }
}
