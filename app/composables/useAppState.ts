/** Global flags shared between preloader, menu and page animations. */
export const useAppState = () => {
  const introDone = useState<boolean>('intro-done', () => false)
  const menuOpen = useState<boolean>('menu-open', () => false)
  return {introDone, menuOpen}
}
