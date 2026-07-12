import {cursorDirective} from '~/composables/useCursor'

export default defineNuxtPlugin((nuxtApp) => {
  // registered on both sides: SSR needs getSSRProps, the browser needs the listeners
  nuxtApp.vueApp.directive('cursor', cursorDirective)
})
