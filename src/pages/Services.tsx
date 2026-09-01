import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'

const pewIncludes = [
  'White-glove delivery to your venue',
  'Professional placement per your seating layout',
  'Aisle runner placement (if provided)',
  'Pre-wedding coordination call',
  'Post-ceremony teardown &amp; retrieval',
  'Clean, polished pews ready for photos',
]

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Our Services"
        description="Explore church pew rentals, printed place cards, seating chart foam boards, and free planning tools from Howard Wedding Rentals in Western Kentucky."
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* Hero */}
        <div className="relative py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/pew1.jpg')" }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/80" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
              What We Offer
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-4">
              Our Services
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-6" />
            <p className="font-raleway text-white/70 text-base max-w-xl mx-auto">
              Everything you need for a beautiful, stress-free wedding day — from elegant pew rentals
              to custom stationery and free planning tools.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-20">

          {/* ── Section 1: Church Pew Rentals ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                Our Flagship Service
              </p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] mb-5 leading-tight">
                Church Pew Rentals
              </h2>
              <p className="font-raleway text-[#6b5744] text-base leading-relaxed mb-6">
                We rent solid hardwood church pews in a classic Golden Oak finish for weddings of all
                sizes. Whether you're hosting an intimate backyard ceremony or a larger outdoor
                celebration, we handle everything from delivery to retrieval.
              </p>
              <ul className="space-y-3 mb-8">
                {pewIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={17} className="text-[#c9a96e] shrink-0 mt-0.5" />
                    <span
                      className="font-raleway text-sm text-[#6b5744]"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#2c1f0e] text-white px-7 py-3 hover:bg-[#c9a96e] transition-colors duration-300"
              >
                Check Availability <ArrowRight size={15} />
              </Link>
            </div>

            <div className="bg-[#fdfcf8] border border-cream-200 rounded-sm p-8 space-y-6">
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  Pew Specifications
                </h3>
                <ul className="space-y-2 font-raleway text-sm text-[#6b5744]">
                  <li>9 ft long &times; 18 in deep &times; 34 in tall</li>
                  <li>Solid hardwood — oak &amp; pine construction</li>
                  <li>Finish: Golden Oak</li>
                  <li>Seats 5–6 adults per pew</li>
                  <li>Accommodates ribbons, sashes, and florals</li>
                </ul>
              </div>
              <div className="w-full h-px bg-cream-200" />
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  Pricing
                </h3>
                <p className="font-playfair text-3xl text-[#2c1f0e] mb-1">$50 <span className="text-lg font-raleway font-normal text-[#9b836e]">/ pew</span></p>
                <p className="font-raleway text-sm text-[#6b5744]">Up to 14 pews available</p>
                <p className="font-raleway text-sm text-[#6b5744] mt-1">Serving Owensboro, KY &amp; surrounding areas</p>
                <p className="font-raleway text-xs text-[#9b836e] mt-2">
                  Travel &amp; installation fees vary — determined during your coordination call.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-cream-200" />

          {/* ── Section 2: Chair Rentals ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                Seating for Every Guest
              </p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] mb-5 leading-tight">
                Chair Rentals
              </h2>
              <p className="font-raleway text-[#6b5744] text-base leading-relaxed mb-6">
                We rent folding chairs for ceremonies, receptions, and every seat in between.
                Delivered, set up in your layout, and picked up when your event is over.
              </p>
              <ul className="space-y-3 mb-8">
                {['Delivery, setup, and pickup included', 'Arranged to match your seating layout', 'Pre-event coordination call'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={17} className="text-[#c9a96e] shrink-0 mt-0.5" />
                    <span className="font-raleway text-sm text-[#6b5744]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/chair-rentals"
                className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#2c1f0e] text-white px-7 py-3 hover:bg-[#c9a96e] transition-colors duration-300"
              >
                Check Chair Availability <ArrowRight size={15} />
              </Link>
            </div>

            <div className="bg-[#fdfcf8] border border-cream-200 rounded-sm p-8 space-y-6">
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  What We Offer
                </h3>
                <ul className="space-y-2 font-raleway text-sm text-[#6b5744]">
                  <li>Folding chairs, event-ready and clean</li>
                  <li>Serving Owensboro, KY &amp; surrounding areas</li>
                </ul>
              </div>
              <div className="w-full h-px bg-cream-200" />
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  Pricing
                </h3>
                <p className="font-raleway text-sm text-[#6b5744]">
                  Pricing depends on quantity, delivery distance &amp; event date — call for a quote.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-cream-200" />

          {/* ── Section 3: Table Rentals ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                Built for Your Reception
              </p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] mb-5 leading-tight">
                Table Rentals
              </h2>
              <p className="font-raleway text-[#6b5744] text-base leading-relaxed mb-6">
                We rent round and rectangular tables for receptions, head tables, gift tables, and
                more — delivered, set up in your floor plan, and picked up when the night is done.
              </p>
              <ul className="space-y-3 mb-8">
                {['Delivery, setup, and pickup included', 'Arranged to match your floor plan', 'Pre-event coordination call'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={17} className="text-[#c9a96e] shrink-0 mt-0.5" />
                    <span className="font-raleway text-sm text-[#6b5744]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/table-rentals"
                className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#2c1f0e] text-white px-7 py-3 hover:bg-[#c9a96e] transition-colors duration-300"
              >
                Check Table Availability <ArrowRight size={15} />
              </Link>
            </div>

            <div className="bg-[#fdfcf8] border border-cream-200 rounded-sm p-8 space-y-6">
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  What We Offer
                </h3>
                <ul className="space-y-2 font-raleway text-sm text-[#6b5744]">
                  <li>Round &amp; rectangular tables</li>
                  <li>Serving Owensboro, KY &amp; surrounding areas</li>
                </ul>
              </div>
              <div className="w-full h-px bg-cream-200" />
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  Pricing
                </h3>
                <p className="font-raleway text-sm text-[#6b5744]">
                  Pricing depends on quantity, delivery distance &amp; event date — call for a quote.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-cream-200" />

          {/* ── Section 4: Wedding Stationery ── */}
          <div>
            <div className="text-center mb-12">
              <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                Printed &amp; Personalized
              </p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] mb-4 leading-tight">
                Wedding Day Stationery
              </h2>
              <p className="font-raleway text-[#6b5744] text-base max-w-2xl mx-auto leading-relaxed">
                Beautiful printed pieces that carry your personal touch from ceremony to reception.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white border border-cream-200 rounded-sm p-8">
                <h3 className="font-playfair text-2xl text-[#2c1f0e] mb-3">Name Place Cards</h3>
                <p className="font-raleway text-sm text-[#6b5744] leading-relaxed mb-6">
                  Elegant printed name cards for each guest. Simply upload your guest list and we'll
                  handle the printing — delivered directly to your venue.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 font-raleway text-sm font-semibold text-[#c9a96e] hover:text-[#a8813e] transition-colors"
                >
                  Order Place Cards <ArrowRight size={14} />
                </Link>
              </div>

              <div className="bg-white border border-cream-200 rounded-sm p-8">
                <h3 className="font-playfair text-2xl text-[#2c1f0e] mb-3">Seating Chart Foam Board</h3>
                <p className="font-raleway text-sm text-[#6b5744] leading-relaxed mb-6">
                  A large-format printed foam board displaying your completed seating chart. Designed
                  from your floor plan in our seating chart tool — a stunning display piece for your
                  reception entrance.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 font-raleway text-sm font-semibold text-[#c9a96e] hover:text-[#a8813e] transition-colors"
                >
                  Order Foam Board <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-cream-200" />

          {/* ── Section 5: Free Tools ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-[#fdfcf8] border border-cream-200 rounded-sm overflow-hidden aspect-video flex items-center justify-center">
              <div
                className="w-full h-full bg-cover bg-center opacity-60"
                style={{ backgroundImage: "url('/images/pew1.jpg')" }}
              />
            </div>

            <div>
              <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                Completely Free
              </p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] mb-5 leading-tight">
                Seating Chart Tool
              </h2>
              <p className="font-raleway text-[#6b5744] text-base leading-relaxed mb-6">
                Our drag-and-drop seating chart builder lets you design your entire reception floor
                plan online. Add tables, assign guests, visualize your layout, and export a polished
                floor plan — all at no cost.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Drag-and-drop table and guest arrangement',
                  'Multiple table shapes and sizes',
                  'Export your layout to PDF',
                  'Use it to order your seating chart foam board',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={17} className="text-[#c9a96e] shrink-0 mt-0.5" />
                    <span className="font-raleway text-sm text-[#6b5744]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/seating-chart-tool"
                className="inline-flex items-center gap-2 font-raleway text-sm font-semibold bg-[#2c1f0e] text-white px-7 py-3 hover:bg-[#c9a96e] transition-colors duration-300"
              >
                Open the Tool <ArrowRight size={15} />
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
