export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'dadashi-theme'

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')

  const apply = (value: Theme) => {
    if (import.meta.server) return
    document.documentElement.classList.toggle('dark', value === 'dark')
    document.documentElement.style.colorScheme = value
    localStorage.setItem(STORAGE_KEY, value)
  }

  const set = (value: Theme) => {
    theme.value = value
    apply(value)
  }

  const toggle = () => set(theme.value === 'dark' ? 'light' : 'dark')

  const init = () => {
    if (import.meta.server) return
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    set(stored ?? 'dark')
  }

  return {theme, set, toggle, init}
}
