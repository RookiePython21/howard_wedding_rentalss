import { Phone, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO, SITE_URL } from '../components/SEO'
import TrustBar from '../components/ui/TrustBar'
import StickyCallBar from '../components/ui/StickyCallBar'
import ServiceFAQ from '../components/sections/ServiceFAQ'

const tableIncludes = [
  'Delivery to your ceremony or reception venue',
  'Setup arranged to match your floor plan',
  'Pre-event coordination call',
  'Pickup after your event — no breakdown required from you',
]

const tableFaqs = [
  {
    id: 'booking',
    question: 'How far in advance should I book table rentals?',
    answer:
      'We recommend booking 3–6 months out, especially during peak wedding season (May–October). Shorter timelines are often still possible — call and we\'ll check availability for your date.',
  },
  {
    id: 'delivery',
    question: 'Do you deliver, set up, and pick up the tables?',
    answer:
      'Yes — every rental includes delivery, setup arranged to your floor plan, and pickup after your event. You won\'t need to lift a finger.',
  },
  {
    id: 'count',
    question: 'How many tables do I need for my guest count?',
    answer: (
      <>
        Round tables typically seat about 8 guests each; rectangular tables vary by length. Try
        our free{' '}
        <Link to="/seating-chart-tool" className="text-[#c9a96e] underline">
          seating chart tool
        </Link>{' '}
        to lay out your floor plan, or just call and we'll help you figure out the right mix.
      </>
    ),
  },
  {
    id: 'distance',
    question: 'What areas do you deliver to?',
    answer:
      'We serve Owensboro, KY and the surrounding areas, and we\'re happy to travel farther for your wedding. Call and we\'ll confirm delivery to your venue.',
  },
  {
    id: 'damage',
    question: 'What if a table gets damaged during my event?',
    answer:
      'Minor scuffs and normal wear are expected and covered. In the rare case of significant damage, we\'ll work with you fairly — we\'ll walk through our policy when you book.',
  },
]

export default function TableRentals() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Table Rentals"
        description="Round and rectangular table rentals for weddings and receptions in Owensboro, KY and surrounding areas. Delivery, setup, and pickup included — call for a free quote."
        image={`${SITE_URL}/images/table_rental_hero.jpg`}
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-24 md:pb-20">

        {/* Hero */}
        <div className="relative py-24 sm:py-32 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/table_rental_hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/70" />
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
              Delivered · Set Up · Picked Up
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-5">
              Table Rentals for Your Wedding Day
            </h1>
            <p className="font-raleway text-white/80 text-base max-w-lg mx-auto mb-8">
              Round and rectangular tables for your reception, delivered and arranged in your
              floor plan. One call gets you a free, no-obligation quote.
            </p>
            <a
              href="tel:2709035890"
              className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#c9a96e] text-[#2c1f0e] px-8 py-4 hover:bg-white transition-colors duration-300 mb-8"
            >
              <Phone size={16} />
              Call for Your Free Quote — 270.903.5890
            </a>
            <TrustBar dark note="The same team trusted for our 5-star pew rentals" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">

          {/* Intro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                Built for Your Reception
              </p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] mb-5 leading-tight">
                Round &amp; Rectangular Tables, Delivered and Set Up for You
              </h2>
              <p className="font-raleway text-[#6b5744] text-base leading-relaxed mb-6">
                We rent round and rectangular tables for receptions, head tables, gift tables, and
                more. Tell us your floor plan and we'll deliver, set up, and pick everything back
                up so your day stays effortless.
              </p>
              <ul className="space-y-3">
                {tableIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={17} className="text-[#c9a96e] shrink-0 mt-0.5" />
                    <span className="font-raleway text-sm text-[#6b5744]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#fdfcf8] border border-cream-200 rounded-sm p-8">
              <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                Get Your Free Quote
              </h3>
              <ul className="space-y-2 font-raleway text-sm text-[#6b5744] mb-6">
                <li>Round &amp; rectangular tables</li>
                <li>Delivery, setup, and pickup included</li>
                <li>Serving Owensboro, KY &amp; surrounding areas</li>
              </ul>
              <p className="font-raleway text-sm text-[#6b5744] mb-5">
                Pricing depends on table count, delivery distance, and your event date — call us
                for a free quote, no obligation.
              </p>
              <a
                href="tel:2709035890"
                className="flex items-center justify-center gap-2 font-raleway text-sm font-semibold bg-[#2c1f0e] text-white px-6 py-3.5 hover:bg-[#c9a96e] transition-colors duration-300"
              >
                <Phone size={16} />
                Call 270.903.5890
              </a>
            </div>
          </div>

        </div>

        {/* Mid-page CTA strip */}
        <div className="bg-[#2c1f0e] py-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <p className="font-raleway text-white text-base">
              Have questions about your event? We're one call away.
            </p>
            <a
              href="tel:2709035890"
              className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#c9a96e] text-[#2c1f0e] px-6 py-3 hover:bg-white transition-colors duration-300 shrink-0"
            >
              <Phone size={15} />
              Call 270.903.5890
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="py-16 sm:py-24 bg-[#fdfcf8]">
          <ServiceFAQ faqs={tableFaqs} />
        </div>

        {/* Closing CTA */}
        <div className="relative py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/table_rental_hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/85" />
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
              Your Date is Waiting
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl text-white leading-tight mb-6">
              Ready to Reserve Your Tables?
            </h2>
            <p className="font-raleway text-white/70 text-base mb-8">
              Dates fill up fast, especially in peak season. Give us a call and we'll help you
              figure out exactly what you need.
            </p>
            <a
              href="tel:2709035890"
              className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#c9a96e] text-[#2c1f0e] px-8 py-4 hover:bg-white transition-colors duration-300"
            >
              Call 270.903.5890 <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </main>
      <StickyCallBar />
      <Footer />
    </div>
  )
}
