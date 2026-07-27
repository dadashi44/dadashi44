import {projects, resolveProject, type Locale, type ResolvedProject} from '~/data/projects'

/**
 * Projects with every localized field already flattened for the active locale,
 * so components only ever deal with plain strings.
 */
export const useProjects = () => {
  const {locale} = useI18n()

  const list = computed<ResolvedProject[]>(() =>
    projects.map((project) => resolveProject(project, locale.value as Locale))
  )

  const bySlug = (slug: string) => computed(() => list.value.find((p) => p.slug === slug))

  const indexOf = (slug: string) => list.value.findIndex((p) => p.slug === slug)

  return {list, bySlug, indexOf, total: projects.length}
}
