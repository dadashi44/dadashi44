/** The English CV — falls back to the Russian one until its channel has a pin. */
export default defineEventHandler((event) => serveResume(event, 'en', 'Abasov_Dauren_Resume_EN.pdf'))
