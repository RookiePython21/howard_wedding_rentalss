import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'
import ServiceFAQ from '../components/sections/ServiceFAQ'
import { graph, localBusinessSchema, pewServiceSchema, faqPageSchema } from '../content/seoSchema'

const pewIncludes = [
  'White-glove delivery to your venue',
  'Professional placement per your seating layout',
  'Aisle runner placement (if provided)',
  'Pre-wedding coordination call',
  'Post-ceremony teardown &amp; retrieval',
  'Clean, polished pews ready for photos',
]

const pewFaqs = [
  {
    id: 'cost',
    question: 'How much does it cost to rent church pews?',
    text: 'It depends on your guest count and where your venue is, so the easiest way is to get your instant estimate with our quote calculator. It is an estimate and does not include travel, so call us at (270) 903-5890 and we will confirm it for your date.',
  },
  {
    id: 'wedding',
    question: 'Can I rent church pews for a wedding ceremony?',
    text: 'Yes. Pew rental for weddings is what we do. We deliver the pews to your venue, set them up in your ceremony layout, and pick them up afterward.',
  },
  {
    id: 'wooden',
    question: 'Are your pews wooden, antique or vintage?',
    text: 'They are solid hardwood church pews in a classic Golden Oak finish, with the warm, timeless look people picture when they search for antique or vintage wooden pews. They take ribbons, sashes and florals beautifully.',
  },
  {
    id: 'count',
    question: 'How many pews do I need for my guests?',
    text: 'Each pew seats 6-7 adults, and we can place up to 14 pews, which is about 84-98 guests. For a larger guest list, give us a call and we will talk it through with you.',
  },
  {
    id: 'area',
    question: 'Where do you deliver church pews?',
    text: 'We are based in Owensboro, KY and deliver within about 120 miles, including Nashville, TN. Enter your venue in the quote calculator or call us and we will confirm delivery to your venue.',
  },
  {
    id: 'advance',
    question: 'How far in advance should I book church pews?',
    text: 'We recommend booking 3-6 months out, especially for peak wedding season (May-October). Shorter timelines are often still possible, so call and we will check your date.',
  },
]

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Church Pews for Rent: Wedding Pew Rental"
        description="Wooden church pew rentals for weddings, delivered, set up and picked up, plus chair and table rentals. Howard Wedding Rentals, Owensboro, KY. Get your instant estimate or call."
        schema={graph(
          localBusinessSchema,
          pewServiceSchema,
          faqPageSchema(pewFaqs.map((f) => ({ question: f.question, text: f.text })))
        )}
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
              Church Pews for Rent
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-4">
              Church Pew Rentals for Your Wedding
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-6" />
            <p className="font-raleway text-white/70 text-base max-w-xl mx-auto">
              Looking for church pews to rent for your wedding? We bring classic wooden pews to your
              ceremony, set them up, and pick them up after. We also offer chair and table rentals,
              printed stationery and planning tools.
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
                  <li>Seats 6–7 adults per pew</li>
                  <li>Accommodates ribbons, sashes, and florals</li>
                </ul>
              </div>
              <div className="w-full h-px bg-cream-200" />
              <div>
                <h3 className="font-raleway font-semibold text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
                  Your Estimate
                </h3>
                <p className="font-playfair text-3xl text-[#2c1f0e] mb-1">Get your instant estimate</p>
                <p className="font-raleway text-sm text-[#6b5744]">6–7 adults per pew · up to 14 pews</p>
                <p className="font-raleway text-sm text-[#6b5744] mt-1">Serving Owensboro, KY &amp; surrounding areas</p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 font-raleway text-sm font-semibold text-[#2c1f0e] hover:text-[#c9a96e] transition-colors mt-3"
                >
                  Get a quote <ArrowRight size={15} />
                </Link>
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
                  Your Quote
                </h3>
                <p className="font-raleway text-sm text-[#6b5744]">
                  Every event is different — call us for a quote based on your guest count, venue &amp; date.
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
                  Your Quote
                </h3>
                <p className="font-raleway text-sm text-[#6b5744]">
                  Every event is different — call us for a quote based on your guest count, venue &amp; date.
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

          <div className="w-full h-px bg-cream-200" />

          {/* ── FAQ ── */}
          <div className="-mx-4 sm:-mx-6">
            <ServiceFAQ faqs={pewFaqs.map((f) => ({ id: f.id, question: f.question, answer: f.text }))} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
