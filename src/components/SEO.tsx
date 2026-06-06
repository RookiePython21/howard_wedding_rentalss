import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
}

export function SEO({ title, description }: SEOProps) {
  return (
    <Helmet>
      <title>{title} | Howard Wedding Rentals</title>
      <meta name="description" content={description} />
    </Helmet>
  )
}
