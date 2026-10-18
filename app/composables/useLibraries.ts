import {libraries, resolveLibrary, type ResolvedLibrary} from '~/data/libraries'
import type {Locale} from '~/data/projects'

/**
 * Open-source libraries for the active locale, plus their monthly npm downloads.
 * Downloads are best effort: the cards render fine without them.
 */
export const useLibraries = () => {
  const {locale} = useI18n()

  const list = computed<ResolvedLibrary[]>(() =>
    libraries.map((library) => resolveLibrary(library, locale.value as Locale))
  )

  const {data: downloads} = useFetch<Record<string, number | null>>('/api/npm-downloads', {
    key: 'npm-downloads',
    default: () => ({})
  })

  return {list, downloads}
}
