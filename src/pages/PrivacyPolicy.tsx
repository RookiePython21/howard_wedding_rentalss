import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'

const linkClass = 'text-[#c9a96e] hover:text-[#a8813e] transition-colors'

function Divider() {
  return <div className="w-full h-px bg-cream-200" />
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Privacy Policy"
        url="https://www.howardweddingrentals.com/privacy"
        description="How Howard Wedding Rentals handles your information: what we collect, why, and how to ask us to delete it."
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
            <p className="font-raleway text-sm text-white/50">Effective date: November 5, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="prose-styles space-y-10 font-raleway text-[#6b5744] text-sm leading-relaxed">

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">1. Who we are</h2>
              <p>
                Howard Wedding Rentals ("we," "us," or "our") rents church pews and other wedding furniture for weddings in and around Owensboro, Kentucky. This page explains, in plain words, what information we collect through howardweddingrentals.com, our online estimate tool, and our Facebook and Instagram ads and lead forms, and what we do with it.
              </p>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">2. What we collect</h2>
              <p className="mb-3">Depending on how you use the site, we may collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Contact details</strong> — your name, phone number, and email address, if you send us a message, ask us to send you your estimate, or fill out a form</li>
                <li><strong>Wedding details</strong> — your wedding date, venue or venue city, and guest count or number of pews</li>
                <li><strong>Estimate details</strong> — when you use the estimate tool, we save the estimate you see (pews, wedding date, the venue or address you typed, and the estimated total), along with a random visit ID, the page and ad that brought you to us, and the website that referred you</li>
                <li><strong>Call taps</strong> — when you tap a phone number on the site, we record that tap and which button it was</li>
                <li><strong>Usage data</strong> — pages visited, device and browser type, and similar information collected by Google Analytics (through Firebase) and the Meta pixel</li>
                <li><strong>Seating chart tool</strong> — if you save a seating chart or enter your email to export one, we keep that email and your chart so you can come back to it</li>
              </ul>
              <p className="mt-3">
                We do not collect payment card information on this site.
              </p>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">3. Meta (Facebook and Instagram) lead forms</h2>
              <p>
                If you fill out a lead form on one of our Facebook or Instagram ads, Meta passes us the answers you give. That may include your name, phone number, email address, wedding date, venue city, and guest count. We receive only what the form asks for, and we use it to follow up on your request. Meta handles the form itself under its own privacy policy.
              </p>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">4. Why we collect it</h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Prepare an estimate for your wedding</li>
                <li>Contact you back about your estimate or booking</li>
                <li>Confirm and coordinate your rental</li>
                <li>Understand how people use the site, and make it easier to use</li>
                <li>Measure whether our ads are reaching couples who are planning weddings</li>
              </ul>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">5. Cookies, the Meta pixel, and analytics</h2>
              <p>
                The site uses Google Analytics (through Firebase) and the Meta pixel. These use cookies or similar tools to count visits and to record actions such as getting an estimate, tapping to call, or sending a message. Meta may use that information to show our ads and measure results, under Meta's own policies. You can block cookies in your browser settings, and you can control ad settings in your Facebook and Instagram accounts. The site will still work.
              </p>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">6. We do not sell your information</h2>
              <p>
                We do not sell or rent your personal information. We share it only with the service providers that run the site and our ads (such as Google, Meta, and our hosting provider), and only as needed to do that, or when the law requires it.
              </p>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">7. How long we keep it</h2>
              <p>
                We keep your information for as long as we need it to answer you, serve your booking, and keep our business records, or as the law requires. After that we delete it.
              </p>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">8. Asking us to delete or correct your information</h2>
              <p>
                You can ask to see, correct, or delete what we have about you at any time. Email{' '}
                <a href="mailto:logan08516@gmail.com" className={linkClass}>
                  logan08516@gmail.com
                </a>{' '}
                or call{' '}
                <a href="tel:+12709035890" className={linkClass}>
                  270.903.5890
                </a>
                . Tell us the name and phone number or email you used, and we will take care of it.
              </p>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">9. Changes to this policy</h2>
              <p>
                If we change this policy, we will post the new version here with a new effective date.
              </p>
            </div>

            <Divider />

            <div>
              <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3">10. Contact</h2>
              <p>
                Questions about this policy? Email{' '}
                <a href="mailto:contact@howardweddingrentals.com" className={linkClass}>
                  contact@howardweddingrentals.com
                </a>{' '}
                or call{' '}
                <a href="tel:+12709035890" className={linkClass}>
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
