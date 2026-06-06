import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="About Us"
        description="Learn about Howard Wedding Rentals, a family-owned church pew rental service in Western Kentucky. We deliver, place, and retrieve solid hardwood pews for weddings of all sizes."
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* Hero banner */}
        <div className="relative py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/pew1.jpg')" }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/80" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
              Our Story
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-4">
              About Howard Wedding Rentals
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto" />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">

          <div className="space-y-10 font-raleway text-[#6b5744] text-base leading-relaxed">

            <div>
              <h2 className="font-playfair text-2xl text-[#2c1f0e] mb-4">Who We Are</h2>
              <p>
                Howard Wedding Rentals is a family-owned business based in Western Kentucky, dedicated to one thing: providing beautiful, authentic wooden church pews for wedding ceremonies. We started renting pews because we believe your ceremony deserves more than plastic folding chairs — it deserves something that feels timeless, warm, and real.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-2xl text-[#2c1f0e] mb-4">What We Do</h2>
              <p>
                We rent solid hardwood church pews — in a classic Golden Oak finish — for weddings of all sizes. Whether you're hosting an intimate backyard ceremony or a larger outdoor celebration, we deliver, place, and retrieve every pew so you can focus entirely on your day.
              </p>
              <p className="mt-4">
                Each pew is carefully maintained between rentals: cleaned, inspected, and polished so they arrive looking their absolute best. We take pride in showing up on time, setting everything up exactly as you've envisioned, and making the whole process as stress-free as possible.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-2xl text-[#2c1f0e] mb-4">Our Promise</h2>
              <p>
                When you book with us, you're not just renting furniture — you're getting a team that genuinely cares about your wedding day. We keep communication clear, pricing transparent, and our service thorough. No hidden fees. No no-shows. Just beautiful pews and a team you can count on.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-2xl text-[#2c1f0e] mb-4">Get in Touch</h2>
              <p>
                Have questions or ready to check availability? We'd love to hear about your wedding. Give us a call at{' '}
                <a href="tel:2709035890" className="text-[#c9a96e] hover:text-[#a8813e] transition-colors">
                  270.903.5890
                </a>{' '}
                or reach out via email at{' '}
                <a href="mailto:contact@howardweddingrentals.com" className="text-[#c9a96e] hover:text-[#a8813e] transition-colors">
                  contact@howardweddingrentals.com
                </a>
                .
              </p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
