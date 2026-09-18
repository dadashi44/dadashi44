/**
 * Dev-only re-render profiler: highlights components that re-render and names
 * the reactive dependency that triggered it.
 *
 * The import is dynamic and guarded by `import.meta.dev` on purpose — that way
 * the bundler drops both the call and the package itself from the production
 * build (the package never disables itself, see its README).
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  if (!import.meta.dev) return

  const {default: VueWhyRender} = await import('vue-why-render')

  nuxtApp.vueApp.use(VueWhyRender, {
    // framework wrappers re-render by design — they are noise, not findings
    exclude: [/^RouterLink/, /^Nuxt/, /^Transition/, /^I18n/],
    // clicking a row in the panel opens the SFC in the IDE via Nuxt devtools
    openInEditorUrl: '/__nuxt_devtools__/open-in-editor?file={file}'
  })
})
