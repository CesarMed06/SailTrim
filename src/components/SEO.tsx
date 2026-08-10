import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

interface SEOProps {
  title?: string
  description?: string
  path?: string
  image?: string
}

const BASE_URL = 'https://sail-trim.vercel.app'
const SITE_NAME = 'SailTrim AI'
const DEFAULT_TITLE = 'SailTrim AI — Tu asistente de trimado'
const DEFAULT_DESC_ES = 'Asistente IA de trimado de velas gratuito. Describe tu rumbo, viento y barco y recibe recomendaciones náuticas precisas en lenguaje marinero real. Sin registro, sin pagos.'
const DEFAULT_DESC_EN = 'Free AI sail trim assistant. Describe your heading, wind and boat and get precise nautical trim recommendations in real maritime language. No signup, no payments.'
const OG_IMAGE = `${BASE_URL}/og-image.svg`

function SEO({ title, description, path = '/', image = OG_IMAGE }: SEOProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'es' | 'en'
  const canonical = `${BASE_URL}${path}`
  const finalTitle = title || DEFAULT_TITLE
  const finalDesc = description || (lang === 'es' ? DEFAULT_DESC_ES : DEFAULT_DESC_EN)

  return (
    <Helmet>
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <link rel="canonical" href={canonical} />

      {lang === 'es' && <link rel="alternate" hrefLang="en" href={`${BASE_URL}${path}`} />}
      {lang === 'en' && <link rel="alternate" hrefLang="es" href={`${BASE_URL}${path}`} />}
      <link rel="alternate" hrefLang={lang} href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/`} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={lang === 'es' ? 'es_ES' : 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={finalTitle} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: SITE_NAME,
          url: BASE_URL,
          description: finalDesc,
          applicationCategory: 'NavigationApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          author: { '@type': 'Person', name: 'César Medina', url: 'https://github.com/CesarMed06' },
          inLanguage: ['es', 'en'],
          browserRequirements: 'Requires JavaScript',
          softwareVersion: '1.0',
          datePublished: '2026-06-01',
        })}
      </script>
    </Helmet>
  )
}

export default SEO
