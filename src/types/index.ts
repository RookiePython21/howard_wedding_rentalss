export interface PricingTier {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  highlighted?: boolean
  stripePriceId?: string
}

export interface Testimonial {
  id: string
  quote: string
  name: string
  location: string
  avatar?: string
}

export interface Benefit {
  id: string
  icon: string
  title: string
  description: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface CheckoutRequest {
  priceId: string
  quantity: number
  guestNames?: string[]
  /** Merged into Stripe session / payment_intent metadata (short string values). */
  checkoutMetadata?: Record<string, string>
}

export interface CheckoutResponse {
  url: string
}
