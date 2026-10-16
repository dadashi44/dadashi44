/** The English CV — falls back to the Russian one until its channel has a pin. */
export default defineEventHandler((event) => {
  const {telegramResumeEnChatId, telegramResumeChatId} = useRuntimeConfig(event)
  return serveResume(event, [telegramResumeEnChatId, telegramResumeChatId], 'Abasov_Dauren_Resume_EN.pdf')
})
