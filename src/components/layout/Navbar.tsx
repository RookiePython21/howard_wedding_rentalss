import { useState, useEffect } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'About', href: '#benefits' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href: string) => {
    setOpen(false)
    if (location.pathname !== '/') {
      navigate('/' + href)
    } else {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-3'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/images/logo.png"
            alt="Howard Wedding Rentals"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => handleNav(link.href)}
                className="font-raleway text-sm font-medium text-[#2c1f0e] hover:text-[#c9a96e] transition-colors tracking-wide"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Phone CTA */}
        <a
          href="tel:2709035890"
          className="hidden md:inline-flex items-center gap-2 font-raleway text-sm font-semibold text-[#2c1f0e] hover:text-[#c9a96e] transition-colors tracking-wide"
        >
          <Phone size={16} />
          270.903.5890
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[#2c1f0e]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-cream-200 px-4 pb-4 pt-2">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => handleNav(link.href)}
                  className="w-full text-left py-3 font-raleway text-sm font-medium text-[#2c1f0e] hover:text-[#c9a96e] transition-colors border-b border-cream-100"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <a
            href="tel:2709035890"
            className="mt-4 w-full flex items-center justify-center gap-2 font-raleway text-sm font-semibold text-[#2c1f0e] hover:text-[#c9a96e] transition-colors py-3"
          >
            <Phone size={16} />
            270.903.5890
          </a>
        </div>
      )}
    </header>
  )
}
