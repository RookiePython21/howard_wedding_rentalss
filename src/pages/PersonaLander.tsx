import { Phone, CheckCircle, ArrowRight } from 'lucide-react'
import Footer from '../components/layout/Footer'
import { SEO, SITE_URL } from '../components/SEO'
import StickyCallBar from '../components/ui/StickyCallBar'
import ServiceFAQ from '../components/sections/ServiceFAQ'
import Pricing from '../components/sections/Pricing'
import type { Persona } from '../content/personas'

// Ad landing page for one persona. Ad traffic only: noindex, no full navigation.
// The page's own tel: links carry data-call-placement="lander-<key>-<spot>"; the shared quote
// tool and sticky bar keep their placements, and analytics.ts records page_path on every click.

const scrollToQuote = () => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })

export default function PersonaLander({ persona }: { persona: Persona }) {
  const placement = (spot: string) => `lander-${persona.key}-${spot}`

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={persona.seoTitle}
        description={persona.seoDescription}
        image={`${SITE_URL}${persona.heroImage}`}
        noindex
      />

      {/* Slim header: logo and call only, so ad traffic stays on the page */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="font-playfair text-lg sm:text-xl text-white">Howard Wedding Rentals</span>
          <a
            href="tel:+12709035890"
            data-call-placement={placement('header')}
            className="inline-flex items-center gap-2 font-raleway text-sm font-semibold text-white border border-white/60 px-4 py-2 hover:bg-white hover:text-[#2c1f0e] transition-colors duration-300"
          >
            <Phone size={15} />
            <span className="hidden sm:inline">270.903.5890</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </header>

      <main className="flex-1 pb-16 md:pb-0">
        {/* Hero */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${persona.heroImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">{persona.eyebrow}</p>
            <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6">
              {persona.headline}{' '}
              <span className="italic text-[#c9a96e]">{persona.headlineAccent}</span>
            </h1>
            <p className="font-raleway text-white/85 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              {persona.subhead}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={scrollToQuote}
                className="inline-flex items-center justify-center gap-2 font-raleway text-sm font-semibold bg-[#c9a96e] text-[#2c1f0e] px-8 py-4 hover:bg-white transition-colors duration-300"
              >
                Get Your Instant Estimate <ArrowRight size={15} />
              </button>
              <a
                href="tel:+12709035890"
                data-call-placement={placement('hero')}
                className="inline-flex items-center justify-center gap-2 font-raleway text-sm font-semibold border border-white text-white px-8 py-4 hover:bg-white hover:text-[#2c1f0e] transition-colors duration-300"
              >
                <Phone size={16} />
                Call 270.903.5890
              </a>
            </div>
          </div>
        </section>

        {/* Reframe: what they blame vs. the real cause */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-playfair italic text-xl sm:text-2xl text-[#9b836e] mb-6">{persona.blame}</p>
            <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] leading-tight mb-6">
              {persona.reframeTitle}
            </h2>
            <p className="font-raleway text-[#6b5744] text-base sm:text-lg leading-relaxed">{persona.reframe}</p>
          </div>
        </section>

        {/* Benefits + photos */}
        <section className="py-16 sm:py-24 bg-[#fdfcf8]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ul className="space-y-8">
              {persona.benefits.map((b) => (
                <li key={b.title} className="flex items-start gap-4">
                  <CheckCircle size={22} className="text-[#c9a96e] shrink-0 mt-1" />
                  <div>
                    <h3 className="font-playfair text-xl text-[#2c1f0e] mb-1">{b.title}</h3>
                    <p className="font-raleway text-sm sm:text-base text-[#6b5744] leading-relaxed">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-3">
              <img src="/images/pew2.jpg" alt="Wooden church pews set in rows for an outdoor ceremony" className="col-span-2 w-full h-56 sm:h-64 object-cover rounded-sm" loading="lazy" />
              <img src="/images/pew1.jpg" alt="Church pews lining a ceremony aisle" className="w-full h-40 object-cover rounded-sm" loading="lazy" />
              <img src="/images/pew3.jpg" alt="Close-up of a wooden church pew" className="w-full h-40 object-cover rounded-sm" loading="lazy" />
            </div>
          </div>
        </section>

        {/* Quote tool: the only place numbers appear (src/config/pricing.ts) */}
        <Pricing />

        {/* FAQ: one question per awareness stage */}
        <section className="py-16 sm:py-24 bg-[#fdfcf8]">
          <ServiceFAQ faqs={persona.faqs} />
        </section>

        {/* Closing CTA */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${persona.heroImage}')` }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/85" />
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-playfair text-3xl sm:text-4xl text-white leading-tight mb-5">{persona.closingTitle}</h2>
            <p className="font-raleway text-white/75 text-base mb-8">{persona.closingBody}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={scrollToQuote}
                className="inline-flex items-center justify-center gap-2 font-raleway text-sm font-semibold bg-[#c9a96e] text-[#2c1f0e] px-8 py-4 hover:bg-white transition-colors duration-300"
              >
                Get Your Instant Estimate <ArrowRight size={15} />
              </button>
              <a
                href="tel:+12709035890"
                data-call-placement={placement('closing')}
                className="inline-flex items-center justify-center gap-2 font-raleway text-sm font-semibold border border-white text-white px-8 py-4 hover:bg-white hover:text-[#2c1f0e] transition-colors duration-300"
              >
                <Phone size={16} />
                Call 270.903.5890
              </a>
            </div>
          </div>
        </section>
      </main>

      <StickyCallBar label="Call to Hold Your Date" />
      <Footer />
    </div>
  )
}
