import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Privacy Policy"
        description="Read the Howard Wedding Rentals privacy policy to understand how we collect, use, and protect your personal information."
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
              Privacy Policy
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-4" />
            <p className="font-raleway text-sm text-white/50">Last updated: April 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="prose-styles space-y-10 font-raleway text-[#6b5744] text-sm leading-relaxed">

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">1. Overview</h2>
              <p>
                Howard Wedding Rentals ("we," "us," or "our") operates the website howardweddingrentals.com. This Privacy Policy explains what information we collect, how we use it, and your rights regarding that information. By using our website, you agree to the practices described here.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">2. Information We Collect</h2>
              <p className="mb-3">We may collect the following when you use our website or contact us:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Contact information</strong> — name, phone number, and email address when you reach out to us directly</li>
                <li><strong>Event details</strong> — wedding date, venue location, and service preferences you share with us</li>
                <li><strong>Usage data</strong> — basic analytics such as pages visited, browser type, and referring URL, collected automatically</li>
              </ul>
              <p className="mt-3">
                We do not collect payment information directly. Any payment processing is handled through secure third-party providers.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect solely to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Respond to your inquiries and provide quotes</li>
                <li>Confirm and coordinate your rental booking</li>
                <li>Communicate updates relevant to your order</li>
                <li>Improve the functionality of our website</li>
              </ul>
              <p className="mt-3">
                We do not sell, trade, or rent your personal information to third parties.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">4. Cookies & Analytics</h2>
              <p>
                Our website may use cookies and similar technologies to understand how visitors interact with our site. This data is aggregated and anonymous. You can disable cookies through your browser settings, though some site features may not function as intended.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">5. Third-Party Links</h2>
              <p>
                Our website may contain links to external sites (such as Facebook). We are not responsible for the privacy practices of those sites and encourage you to review their policies separately.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">6. Data Retention</h2>
              <p>
                We retain your contact and booking information only as long as necessary to fulfill the purpose for which it was collected or as required by law.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">7. Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of any personal information we hold about you. To do so, contact us at{' '}
                <a href="mailto:contact@howardweddingrentals.com" className="text-[#c9a96e] hover:text-[#a8813e] transition-colors">
                  contact@howardweddingrentals.com
                </a>
                .
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of the website after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            <div className="w-full h-px bg-cream-200" />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">9. Contact</h2>
              <p>
                Questions about this policy? Reach us at{' '}
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
