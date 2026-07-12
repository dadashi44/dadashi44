export type CursorMode = 'default' | 'link' | 'view' | 'drag' | 'hidden'

interface CursorState {
  mode: CursorMode
  label: string
}

/**
 * Module singleton on purpose: the cursor is client-only (never rendered during
 * SSR), and the v-cursor directive needs to reach it outside of a setup scope.
 */
const state = ref<CursorState>({mode: 'default', label: ''})

export const useCursor = () => {
  const set = (mode: CursorMode, label = '') => {
    state.value = {mode, label}
  }
  const reset = () => set('default')
  return {state, set, reset}
}

/** v-cursor="'view'" or v-cursor="{ mode: 'link', label: 'Open' }" */
export const cursorDirective = {
  /** SSR is a no-op — the custom cursor only exists on pointer-fine clients. */
  getSSRProps: () => ({}),
  mounted(el: HTMLElement, binding: any) {
    const {set, reset} = useCursor()
    const value = binding.value
    const mode: CursorMode = typeof value === 'string' ? (value as CursorMode) : value?.mode ?? 'link'
    const label: string = typeof value === 'string' ? '' : value?.label ?? ''
    const node = el as any

    node.__cursorEnter = () => set(mode, label)
    node.__cursorLeave = () => reset()
    el.addEventListener('mouseenter', node.__cursorEnter)
    el.addEventListener('mouseleave', node.__cursorLeave)
  },
  unmounted(el: HTMLElement) {
    const node = el as any
    el.removeEventListener('mouseenter', node.__cursorEnter)
    el.removeEventListener('mouseleave', node.__cursorLeave)
    node.__cursorLeave?.()
  }
}
