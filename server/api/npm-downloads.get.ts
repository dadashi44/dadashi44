import {libraries} from '../../app/data/libraries'

/**
 * Last-month npm downloads for every library on the site.
 * The bulk endpoint skips scoped packages, so each one is asked for separately.
 * A package that fails comes back as null and its card simply hides the number.
 */
export default defineCachedEventHandler(
  async () => {
    const entries = await Promise.all(
      libraries.map(async ({pkg}) => {
        try {
          const res = await $fetch<{downloads: number}>(
            `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkg)}`,
            {timeout: 4000}
          )
          return [pkg, res.downloads] as const
        } catch {
          return [pkg, null] as const
        }
      })
    )

    return Object.fromEntries(entries)
  },
  // npm refreshes these once a day anyway
  {name: 'npm-downloads', maxAge: 60 * 60 * 12, swr: true}
)
