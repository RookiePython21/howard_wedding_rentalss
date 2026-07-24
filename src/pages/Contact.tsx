import { Phone, Mail, Facebook, Clock } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Contact Us"
        description="Book your church pew rental or ask us anything. Call (270) 903-5890 or email contact@howardweddingrentals.com. Serving Owensboro, KY and surrounding areas."
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
              Reach Out
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-4">
              Contact Us
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <p className="font-raleway text-[#6b5744] text-base max-w-xl mx-auto leading-relaxed">
              Ready to check availability or have a question about your wedding? We're happy to help — reach out any way that works best for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Phone */}
            <a
              href="tel:2709035890"
              className="group bg-white border border-cream-200 rounded-sm p-8 hover:border-[#c9a96e] hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-sm bg-[#c9a96e]/10 flex items-center justify-center mb-5 group-hover:bg-[#c9a96e] transition-colors duration-300">
                <Phone size={24} className="text-[#c9a96e] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-playfair text-xl text-[#2c1f0e] mb-2">Call Us</h3>
              <p className="font-raleway text-sm text-[#9b836e] mb-3">The fastest way to reach us</p>
              <p className="font-raleway font-semibold text-[#c9a96e] text-lg tracking-wide">270.903.5890</p>
            </a>

            {/* Email */}
            <a
              href="mailto:contact@howardweddingrentals.com"
              className="group bg-white border border-cream-200 rounded-sm p-8 hover:border-[#c9a96e] hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-sm bg-[#c9a96e]/10 flex items-center justify-center mb-5 group-hover:bg-[#c9a96e] transition-colors duration-300">
                <Mail size={24} className="text-[#c9a96e] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-playfair text-xl text-[#2c1f0e] mb-2">Email Us</h3>
              <p className="font-raleway text-sm text-[#9b836e] mb-3">We respond within 24 hours</p>
              <p className="font-raleway font-semibold text-[#c9a96e] text-sm break-all">contact@howardweddingrentals.com</p>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61573674576448"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-cream-200 rounded-sm p-8 hover:border-[#c9a96e] hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-sm bg-[#c9a96e]/10 flex items-center justify-center mb-5 group-hover:bg-[#c9a96e] transition-colors duration-300">
                <Facebook size={24} className="text-[#c9a96e] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-playfair text-xl text-[#2c1f0e] mb-2">Facebook</h3>
              <p className="font-raleway text-sm text-[#9b836e] mb-3">Follow us & send a message</p>
              <p className="font-raleway font-semibold text-[#c9a96e] text-sm">Howard Wedding Rentals</p>
            </a>

            {/* Hours */}
            <div className="bg-[#fdfcf8] border border-cream-200 rounded-sm p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-sm bg-[#c9a96e]/10 flex items-center justify-center mb-5">
                <Clock size={24} className="text-[#c9a96e]" />
              </div>
              <h3 className="font-playfair text-xl text-[#2c1f0e] mb-2">Availability</h3>
              <p className="font-raleway text-sm text-[#9b836e] mb-3">When we're reachable</p>
              <ul className="font-raleway text-sm text-[#6b5744] space-y-1">
                <li>Mon – Fri: 9:00 AM – 7:00 PM</li>
                <li>Saturday: 9:00 AM – 5:00 PM</li>
                <li>Sunday: By appointment</li>
              </ul>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
