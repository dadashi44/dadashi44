/** The Russian CV — see server/utils/resume.ts. */
export default defineEventHandler((event) => {
  const {telegramResumeChatId} = useRuntimeConfig(event)
  return serveResume(event, [telegramResumeChatId], 'Abasov_Dauren_Resume.pdf')
})
