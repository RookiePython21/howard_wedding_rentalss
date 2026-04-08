import { CheckCircle } from 'lucide-react'
import Button from '../ui/Button'
import { useCheckout } from '../../hooks/useCheckout'
import type { PricingTier } from '../../types'

const tiers: PricingTier[] = [
  {
    id: 'intimate',
    name: 'Intimate',
    price: 349,
    description: 'Perfect for small, intimate ceremonies',
    features: [
      'Up to 10 pews (50–60 guests)',
      'Natural or walnut finish',
      'Delivery & setup included',
      'Teardown & pickup included',
      'Up to 5 miles from our location',
      'Day-of coordination support',
    ],
    stripePriceId: 'price_intimate_placeholder',
  },
  {
    id: 'classic',
    name: 'Classic',
    price: 649,
    description: 'Our most popular package for mid-size weddings',
    features: [
      'Up to 20 pews (100–120 guests)',
      'Any finish: natural, walnut, or whitewash',
      'Delivery & setup included',
      'Teardown & pickup included',
      'Up to 25 miles from our location',
      'Ribbon or fabric sash decorating',
      'Day-of coordination support',
    ],
    highlighted: true,
    stripePriceId: 'price_classic_placeholder',
  },
  {
    id: 'grand',
    name: 'Grand',
    price: 999,
    description: 'Full-scale setup for large, grand celebrations',
    features: [
      'Up to 40 pews (200–240 guests)',
      'Any finish: natural, walnut, or whitewash',
      'Delivery & setup included',
      'Teardown & pickup included',
      'Up to 50 miles from our location',
      'Full floral & ribbon decorating',
      'Cushioned seating upgrade available',
      'Dedicated on-site attendant',
    ],
    stripePriceId: 'price_grand_placeholder',
  },
]

export default function Pricing() {
  const { initiateCheckout, loading, error } = useCheckout()

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#f5edd8]/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            Packages & Pricing
          </p>
          <h2 className="section-title mb-4">Simple, Transparent Pricing</h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-6 max-w-xl mx-auto">
            No hidden fees. No surprises. Just beautiful pews at a fair price — with full service included.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-sm border bg-white flex flex-col transition-all duration-300 hover:shadow-xl ${
                tier.highlighted
                  ? 'border-[#c9a96e] shadow-lg shadow-[#c9a96e]/10 scale-[1.02]'
                  : 'border-cream-200 hover:border-[#c9a96e]/50'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#c9a96e] text-white font-raleway text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`p-7 pb-6 ${tier.highlighted ? 'pt-10' : ''}`}>
                <h3 className="font-playfair text-2xl text-[#2c1f0e] mb-1">{tier.name}</h3>
                <p className="font-raleway text-sm text-[#6b5744] mb-6">{tier.description}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="font-raleway text-sm text-[#6b5744] mt-1">Starting at</span>
                  <span className="font-playfair text-4xl font-bold text-[#2c1f0e] ml-2">
                    ${tier.price}
                  </span>
                </div>

                <ul className="space-y-3 mb-7">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-[#c9a96e] shrink-0 mt-0.5" />
                      <span className="font-raleway text-sm text-[#6b5744]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.highlighted ? 'gold' : 'outline'}
                  className="w-full"
                  loading={loading}
                  onClick={() => initiateCheckout(tier.stripePriceId ?? '')}
                >
                  Reserve This Package
                </Button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-center mt-6 font-raleway text-sm text-red-600">{error}</p>
        )}

        <p className="text-center mt-8 font-raleway text-sm text-[#6b5744]">
          Need a custom quote?{' '}
          <a href="mailto:hello@howardweddingrentals.com" className="text-[#c9a96e] underline hover:text-[#a8813e]">
            Contact us
          </a>{' '}
          and we'll tailor a package for your exact needs.
        </p>
      </div>
    </section>
  )
}
