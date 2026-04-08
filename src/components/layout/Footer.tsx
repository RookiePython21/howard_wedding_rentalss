import { Facebook, Instagram, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#2c1f0e] text-cream-100 pt-14 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div>
            <img
              src="/images/logo.png"
              alt="Howard Wedding Rentals"
              className="h-14 w-auto object-contain mb-4 brightness-200 contrast-50"
            />
            <p className="font-raleway text-sm text-white/60 leading-relaxed">
              Bringing timeless elegance to weddings across the region. Beautiful wooden pew rentals with full delivery and setup.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="#"
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
                <a href="tel:+15555555555" className="hover:text-[#c9a96e] transition-colors">
                  (555) 555-5555
                </a>
              </li>
              <li className="flex items-center gap-3 font-raleway text-sm text-white/60">
                <Mail size={16} className="text-[#c9a96e] shrink-0" />
                <a
                  href="mailto:hello@howardweddingrentals.com"
                  className="hover:text-[#c9a96e] transition-colors"
                >
                  hello@howardweddingrentals.com
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
            <a href="#" className="font-raleway text-xs text-white/40 hover:text-[#c9a96e] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-raleway text-xs text-white/40 hover:text-[#c9a96e] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
