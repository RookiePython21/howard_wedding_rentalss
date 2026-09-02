import { useState, useEffect } from 'react'
import { Menu, X, Phone, ChevronDown, ChevronUp } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'About', href: '#benefits' },
  { label: 'Gallery', href: '#gallery' },
]

const PAGE_LINKS = [
  { label: 'Pricing', to: '/pricing' },
  { label: 'Contact', to: '/contact' },
  {
    label: 'Services',
    to: '/services',
    children: [
      { label: 'Pew Rentals', to: '/' },
      { label: 'Chair Rentals', to: '/chair-rentals' },
      { label: 'Table Rentals', to: '/table-rentals' },
      { label: 'Stationery', to: '/shop' },
    ],
  },
  { label: 'Blog', to: '/blog' },
  { label: 'Shop', to: '/shop' },
  { label: 'Seating Chart Tool', to: '/seating-chart-tool' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
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
          {PAGE_LINKS.map((link) =>
            link.children ? (
              <li key={link.to} className="relative group">
                <Link
                  to={link.to}
                  className="flex items-center gap-1 font-raleway text-sm font-medium text-[#2c1f0e] hover:text-[#c9a96e] transition-colors tracking-wide"
                >
                  {link.label}
                  <ChevronDown size={14} />
                </Link>
                <div className="absolute left-0 top-full pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200">
                  <ul className="bg-white shadow-lg border border-cream-200 rounded-sm py-2 min-w-[180px]">
                    {link.children.map((child) => (
                      <li key={child.to}>
                        <Link
                          to={child.to}
                          className="block px-5 py-2.5 font-raleway text-sm text-[#2c1f0e] hover:bg-[#fdfcf8] hover:text-[#c9a96e] transition-colors"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="font-raleway text-sm font-medium text-[#2c1f0e] hover:text-[#c9a96e] transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
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
            {PAGE_LINKS.map((link) =>
              link.children ? (
                <li key={link.to} className="border-b border-cream-100">
                  <div className="flex items-center justify-between">
                    <Link
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="flex-1 py-3 font-raleway text-sm font-medium text-[#2c1f0e] hover:text-[#c9a96e] transition-colors"
                    >
                      {link.label}
                    </Link>
                    <button
                      onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                      aria-label="Toggle services submenu"
                      className="p-3 text-[#2c1f0e]"
                    >
                      {mobileServicesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  {mobileServicesOpen && (
                    <ul className="pl-4 ml-2 border-l border-cream-200 pb-2">
                      {link.children.map((child) => (
                        <li key={child.to}>
                          <Link
                            to={child.to}
                            onClick={() => setOpen(false)}
                            className="block py-2 font-raleway text-sm text-[#6b5744] hover:text-[#c9a96e] transition-colors"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="w-full block py-3 font-raleway text-sm font-medium text-[#2c1f0e] hover:text-[#c9a96e] transition-colors border-b border-cream-100"
                  >
                    {link.label}
                  </Link>
                </li>
              )
            )}
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
