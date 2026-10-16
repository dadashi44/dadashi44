/** The CV in the current language: /resume.pdf or /resume-en.pdf. */
export const useResumeHref = () => {
  const {locale} = useI18n()
  return computed(() => (locale.value === 'en' ? '/resume-en.pdf' : '/resume.pdf'))
}
