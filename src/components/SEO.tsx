import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

export const SITE_URL = 'https://www.howardweddingrentals.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/pew1.jpg`

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  schema?: Record<string, unknown>
}

export function SEO({ title, description, image, url, type = 'website', schema }: SEOProps) {
  const fullTitle = `${title} | Howard Wedding Rentals`
  const ogImage = image || DEFAULT_OG_IMAGE
  // Derive the canonical from the router path so it is deterministic at build
  // time (prerendering) — never tied to window.location / the dev or preview host.
  const { pathname } = useLocation()
  const canonical = url ?? `${SITE_URL}${pathname}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Howard Wedding Rentals" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  )
}
