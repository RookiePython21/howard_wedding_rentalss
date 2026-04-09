import { Facebook, Instagram, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#2c1f0e] text-cream-100 pt-14 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div>
            <p className="font-raleway text-sm text-white/60 leading-relaxed">
              Bringing timeless elegance to weddings across the region. Beautiful wooden pew rentals with full delivery and setup.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://www.facebook.com/profile.php?id=61573674576448"
                aria-label="Facebook"
                className="text-white/50 hover:text-[#c9a96e] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-white/50 hover:text-[#c9a96e] transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-raleway font-semibold text-[#c9a96e] tracking-widest text-xs uppercase mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {['About', 'Gallery', 'Pricing', 'FAQ'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      const el = document.querySelector(`#${item.toLowerCase()}`)
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="font-raleway text-sm text-white/60 hover:text-[#c9a96e] transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/about" className="font-raleway text-sm text-white/60 hover:text-[#c9a96e] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="font-raleway text-sm text-white/60 hover:text-[#c9a96e] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-raleway font-semibold text-[#c9a96e] tracking-widest text-xs uppercase mb-5">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 font-raleway text-sm text-white/60">
                <Phone size={16} className="text-[#c9a96e] shrink-0" />
                <a href="tel:+12709035890" className="hover:text-[#c9a96e] transition-colors">
                  (270) 903-5890
                </a>
              </li>
              <li className="flex items-center gap-3 font-raleway text-sm text-white/60">
                <Mail size={16} className="text-[#c9a96e] shrink-0" />
                <a
                  href="mailto:contact@howardweddingrentals.com"
                  className="hover:text-[#c9a96e] transition-colors"
                >
                  contact@howardweddingrentals.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-raleway text-xs text-white/40">
            © {new Date().getFullYear()} Howard Wedding Rentals. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="font-raleway text-xs text-white/40 hover:text-[#c9a96e] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="font-raleway text-xs text-white/40 hover:text-[#c9a96e] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
