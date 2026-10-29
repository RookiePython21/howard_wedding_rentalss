import { useState } from 'react'
import { CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import { submitQuoteLead, type QuoteSnapshot } from '../../services/quoteCapture'
import { trackQuoteContact } from '../../services/analytics'

// "Not ready to call?" capture under the quote result. Saves the lead with the quote the
// visitor is looking at and texts the owner immediately (api/quote-lead.ts).

const inputClass =
  'w-full px-4 py-3 border border-cream-200 rounded-sm font-raleway text-sm text-[#2c1f0e] placeholder-[#9b836e] focus:outline-none focus:border-[#c9a96e] transition-colors bg-[#fdfcf8]'

function digits(s: string): string {
  return s.replace(/\D/g, '')
}

export default function QuoteContactForm({ getQuote }: { getQuote: () => QuoteSnapshot }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('') // honeypot: hidden from people, bots fill it
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (company) { setState('sent'); return }
    const d = digits(phone)
    if (!name.trim()) { setError('Please add your name.'); return }
    if (d.length < 10 || d.length > 11) { setError('Please add a 10-digit phone number.'); return }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('That email doesn\'t look right.'); return }
    setError('')
    setState('sending')
    const quote = getQuote()
    const ok = await submitQuoteLead({ name, phone, email }, quote)
    if (ok) {
      trackQuoteContact({ pews: quote.pews, total: quote.total })
      setState('sent')
    } else {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="mt-8 p-5 bg-[#f5edd8]/50 border border-cream-200 rounded-sm flex items-start gap-3">
        <CheckCircle2 size={18} className="text-[#c9a96e] mt-0.5 shrink-0" />
        <p className="font-raleway text-sm text-[#2c1f0e] leading-relaxed">
          Thank you{name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}! We have your quote and will reach out shortly to check your date.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 pt-7 border-t border-cream-200">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare size={16} className="text-[#c9a96e]" />
        <p className="font-raleway text-xs tracking-widest uppercase text-[#6b5744]">Not ready to call?</p>
      </div>
      <p className="font-raleway text-sm text-[#6b5744] mb-5">
        Leave your name and number. We'll text you this quote and check your date.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          aria-label="Your name"
        />
        <input
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="Mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          aria-label="Mobile number"
        />
        <input
          type="email"
          autoComplete="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} sm:col-span-2`}
          aria-label="Email (optional)"
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {error && <p className="font-raleway text-xs text-red-700 mt-3">{error}</p>}
      {state === 'error' && (
        <p className="font-raleway text-xs text-red-700 mt-3">
          Something went wrong sending that. Please call us at 270.903.5890.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full mt-4 py-3.5 border border-[#c9a96e] text-[#2c1f0e] font-raleway font-semibold text-sm rounded-sm hover:bg-[#c9a96e]/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {state === 'sending' && <Loader2 size={16} className="animate-spin" />}
        Send Me This Quote
      </button>
      <p className="text-center font-raleway text-xs text-[#9b836e] mt-3">
        By sending, you agree Howard Wedding Rentals may call or text you about this quote. No spam, ever.
      </p>
    </form>
  )
}
