/** One translated article, rendered to HTML with highlighted code. */
export default defineCachedEventHandler(
  async (event) => {
    const article = await getTranslatedArticle(getRouterParam(event, 'slug') ?? '')
    if (!article) throw createError({statusCode: 404, statusMessage: 'Article not found'})
    return article
  },
  {
    name: 'blog-article',
    maxAge: 60 * 60 * 24,
    getKey: (event) => getRouterParam(event, 'slug') ?? ''
  }
)
