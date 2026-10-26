import { SITE_URL } from '../components/SEO'

export interface SchemaFaq {
  question: string
  /** Plain-text answer (must match what is visible on the page). */
  text: string
}

export const BUSINESS_ID = `${SITE_URL}/#business`

export const localBusinessSchema = {
  '@type': 'LocalBusiness',
  '@id': BUSINESS_ID,
  name: 'Howard Wedding Rentals',
  url: `${SITE_URL}/`,
  telephone: '+1-270-903-5890',
  email: 'contact@howardweddingrentals.com',
  image: `${SITE_URL}/images/pew1.jpg`,
  logo: `${SITE_URL}/images/logo.png`,
  description:
    'Church pew rentals for outdoor and indoor weddings, delivered, set up and picked up in Owensboro, KY and within about 120 miles, including Nashville, TN.',
  areaServed: [
    { '@type': 'City', name: 'Owensboro, KY' },
    { '@type': 'City', name: 'Nashville, TN' },
  ],
  sameAs: ['https://www.facebook.com/profile.php?id=61573674576448'],
}

export const pewServiceSchema = {
  '@type': 'Service',
  '@id': `${SITE_URL}/services#church-pew-rental`,
  serviceType: 'Church pew rental for weddings',
  name: 'Church Pew Rentals for Weddings',
  description:
    'Wooden church pews for rent for wedding ceremonies, delivered, set up and picked up. Each pew seats 6-7 adults, up to 14 pews.',
  provider: { '@id': BUSINESS_ID },
  areaServed: [
    { '@type': 'City', name: 'Owensboro, KY' },
    { '@type': 'City', name: 'Nashville, TN' },
  ],
  url: `${SITE_URL}/services`,
}

export function faqPageSchema(faqs: SchemaFaq[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.text },
    })),
  }
}

export function graph(...nodes: Record<string, unknown>[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}
