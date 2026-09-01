import { Phone } from 'lucide-react'

interface StickyCallBarProps {
  label?: string
}

export default function StickyCallBar({ label = 'Call Now for a Free Quote' }: StickyCallBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2c1f0e] border-t border-[#c9a96e]/30 pb-[env(safe-area-inset-bottom)]">
      <a
        href="tel:2709035890"
        className="flex items-center justify-center gap-2 py-4 font-raleway text-sm font-semibold text-white"
      >
        <Phone size={17} className="text-[#c9a96e]" />
        {label} — 270.903.5890
      </a>
    </div>
  )
}
