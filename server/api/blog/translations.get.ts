/** English titles and teasers for the articles that have a translation on the site. */
export default defineCachedEventHandler(() => getTranslationList(), {
  name: 'blog-translations',
  // the files only change with a deploy, which clears the cache anyway
  maxAge: 60 * 60 * 24
})
