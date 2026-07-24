import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Terms of Service"
        description="Review the Howard Wedding Rentals terms of service, including rental agreements, payment terms, and cancellation policies."
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* Hero banner */}
        <div className="bg-[#2c1f0e] py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
              Legal
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-4">
              Terms of Service
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-4" />
            <p className="font-raleway text-sm text-white/50">Last updated: July 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="space-y-10 font-raleway text-[#6b5744] text-sm leading-relaxed">

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">1. Agreement</h2>
              <p>
                By booking a rental or using the howardweddingrentals.com website, you agree to be bound by these Terms of Service. These terms apply to all rentals coordinated through Howard Wedding Rentals.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">2. Rental Services</h2>
              <p>
                Howard Wedding Rentals provides church pew rentals for wedding ceremonies and events. Our services include delivery, placement (if requested), and post-event retrieval. Pews are rented at <strong>$50 per pew</strong>, with a maximum of 14 pews per booking. Travel fees are assessed separately based on venue location.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">3. Booking & Deposit</h2>
              <p>
                A deposit is required at the time of booking to hold your date. The remaining balance is due prior to delivery. Specific deposit amounts and due dates will be confirmed during your booking consultation. Dates are not held without a confirmed deposit.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">4. Cancellations & Refunds</h2>
              <p>
                Cancellations made more than 30 days before your event date will receive a full refund of the deposit. Cancellations within 30 days of the event are non-refundable. We understand that unexpected circumstances arise — please contact us as early as possible if plans change and we will do our best to accommodate you.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">5. Delivery & Access</h2>
              <p>
                The client is responsible for ensuring that the delivery location is accessible and prepared for pew placement at the agreed-upon time. Howard Wedding Rentals is not liable for delays caused by inaccessible venues, weather conditions, or circumstances beyond our control. We will communicate proactively if any issues arise.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">6. Damage & Loss</h2>
              <p>
                Clients are responsible for any damage to rented pews beyond normal wear and tear occurring during the rental period. Minor scuffs and surface wear from normal use are expected and will not be charged. Significant damage — including structural damage, deep gouges, or staining — will be assessed and billed to the client at a fair replacement or repair cost. We will discuss any damage concerns directly with you before applying charges.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">7. Use of Pews</h2>
              <p>
                Pews are intended for seating use only. Clients may decorate pews with ribbons, sashes, or florals. The use of permanent adhesives, paint, nails, screws, or any modification that alters the structure or finish of the pew is strictly prohibited. Any such modifications will be treated as damage.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">8. Limitation of Liability</h2>
              <p>
                Howard Wedding Rentals is not liable for personal injury, property damage, or any indirect, incidental, or consequential damages arising from the use of our rental equipment. Clients assume full responsibility for the safe and appropriate use of rented pews during their event.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">9. Changes to Terms</h2>
              <p>
                We reserve the right to update these Terms of Service at any time. Changes will be posted on this page. Continued use of our services after changes constitutes acceptance of the updated terms.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">10. Contact</h2>
              <p>
                Questions about these terms? Reach us at{' '}
                <a href="mailto:contact@howardweddingrentals.com" className="text-[#c9a96e] hover:text-[#a8813e] transition-colors">
                  contact@howardweddingrentals.com
                </a>{' '}
                or call{' '}
                <a href="tel:2709035890" className="text-[#c9a96e] hover:text-[#a8813e] transition-colors">
                  270.903.5890
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
