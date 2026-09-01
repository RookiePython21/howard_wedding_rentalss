import { Phone, CheckCircle, ArrowRight } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'

const chairIncludes = [
  'Delivery to your ceremony or reception venue',
  'Setup arranged to match your seating layout',
  'Pre-event coordination call',
  'Pickup after your event — no breakdown required from you',
]

export default function ChairRentals() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Chair Rentals"
        description="Folding chair rentals for weddings and receptions in Owensboro, KY and surrounding areas. Delivery, setup, and pickup included — call for pricing and availability."
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* Hero */}
        <div className="relative py-20 sm:py-28 overflow-hidden">
          {/* TODO: replace with real chair rental photo once available */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/pew2.jpg')" }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/80" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
              Seating for Every Guest
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-4">
              Chair Rentals
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-6" />
            <p className="font-raleway text-white/70 text-base max-w-xl mx-auto">
              Comfortable, event-ready folding chairs for your ceremony and reception — delivered,
              set up, and picked up so you don't have to lift a finger.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

          {/* Intro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                Chair Rentals
              </p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] mb-5 leading-tight">
                Folding Chairs for Weddings & Receptions
              </h2>
              <p className="font-raleway text-[#6b5744] text-base leading-relaxed mb-6">
                We rent folding chairs for ceremonies, receptions, and every seat in between. Whether
                you need a handful for an intimate gathering or enough for a full guest list, we
                deliver, set up in your layout, and pick everything back up when the celebration is over.
              </p>
              <ul className="space-y-3 mb-8">
                {chairIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={17} className="text-[#c9a96e] shrink-0 mt-0.5" />
                    <span className="font-raleway text-sm text-[#6b5744]">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="tel:2709035890"
                className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#2c1f0e] text-white px-7 py-3 hover:bg-[#c9a96e] transition-colors duration-300"
              >
                Call to Check Availability <ArrowRight size={15} />
              </a>
            </div>

            <div className="bg-[#fdfcf8] border border-cream-200 rounded-sm p-8 space-y-6">
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  What We Offer
                </h3>
                <ul className="space-y-2 font-raleway text-sm text-[#6b5744]">
                  <li>Folding chairs, event-ready and clean</li>
                  <li>Delivery, setup, and pickup included</li>
                  <li>Serving Owensboro, KY & surrounding areas</li>
                </ul>
              </div>
              <div className="w-full h-px bg-cream-200" />
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  Pricing
                </h3>
                <p className="font-raleway text-sm text-[#6b5744] mb-4">
                  Pricing depends on chair count, delivery distance, and your event date — call us
                  for a quote.
                </p>
                <a
                  href="tel:2709035890"
                  className="inline-flex items-center gap-2 font-raleway font-semibold text-[#c9a96e] hover:text-[#a8813e] transition-colors text-lg tracking-wide"
                >
                  <Phone size={18} />
                  270.903.5890
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Closing CTA */}
        <div className="relative py-20 sm:py-24 overflow-hidden mt-4">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/pew2.jpg')" }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/85" />
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-playfair text-3xl sm:text-4xl text-white leading-tight mb-6">
              Ready to Reserve Your Chairs?
            </h2>
            <p className="font-raleway text-white/70 text-base mb-8">
              Give us a call and we'll help you figure out exactly what you need.
            </p>
            <a
              href="tel:2709035890"
              className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#c9a96e] text-[#2c1f0e] px-8 py-4 hover:bg-white transition-colors duration-300"
            >
              <Phone size={16} />
              Call 270.903.5890
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
