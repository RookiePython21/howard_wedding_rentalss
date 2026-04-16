import { useState } from 'react'
import { Phone, MapPin, Truck, CheckSquare, Calendar, AlertCircle, Loader2 } from 'lucide-react'

const PEW_PRICE = 25
const MAX_PEWS = 14

const OWENSBORO_LAT = 37.7719
const OWENSBORO_LNG = -87.1112
const MAX_RADIUS_MILES = 30

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function Pricing() {
  const [pewCount, setPewCount] = useState(6)
  const [weddingDate, setWeddingDate] = useState('2026-09-01')
  const [location, setLocation] = useState('')
  const [placement, setPlacement] = useState<'place' | 'deliver'>('place')
  const [locationError, setLocationError] = useState('')
  const [locationChecking, setLocationChecking] = useState(false)

  async function checkLocationRadius() {
    const trimmed = location.trim()
    if (!trimmed) { setLocationError(''); return }

    setLocationChecking(true)
    setLocationError('')

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (!data.length) {
        setLocationError("We couldn't find that location. Please try a city name, venue, or full address.")
        return
      }
      const miles = haversineDistance(
        OWENSBORO_LAT, OWENSBORO_LNG,
        parseFloat(data[0].lat), parseFloat(data[0].lon)
      )
      if (miles > MAX_RADIUS_MILES) {
        setLocationError(
          `We're sorry — that location appears to be about ${Math.round(miles)} miles from Owensboro, KY, which is outside our 30-mile service area. Please give us a call at 270.903.5890 to discuss your options.`
        )
      } else {
        setLocationError('')
      }
    } catch {
      setLocationError('')
    } finally {
      setLocationChecking(false)
    }
  }

  const pewTotal = pewCount * PEW_PRICE

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#f5edd8]/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            Pricing
          </p>
          <h2 className="section-title mb-4">Get Your Custom Quote</h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-6 max-w-xl mx-auto">
            Pews are <span className="text-[#2c1f0e] font-semibold">$25 each</span>, plus travel/installation fees based on your location. Fill out the fields below and give us a call — we'll confirm availability and finalize your quote.
          </p>
        </div>

        {/* Quote form card */}
        <div className="bg-white border border-cream-200 rounded-sm shadow-lg p-8 sm:p-10">

          {/* Pew count */}
          <div className="mb-8">
            <label className="block font-raleway text-xs tracking-widest uppercase text-[#6b5744] mb-3">
              How many pews do you need?
            </label>
            <p className="font-raleway text-xs text-[#9b836e] mb-4">
              Each pew seats 9–10 adults &mdash; maximum of {MAX_PEWS} pews
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPewCount((n) => Math.max(1, n - 1))}
                className="w-10 h-10 rounded-sm border border-cream-200 text-[#2c1f0e] font-playfair text-xl hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors flex items-center justify-center"
                aria-label="Decrease pew count"
              >
                −
              </button>
              <span className="font-playfair text-3xl text-[#2c1f0e] w-10 text-center">{pewCount}</span>
              <button
                onClick={() => setPewCount((n) => Math.min(MAX_PEWS, n + 1))}
                className="w-10 h-10 rounded-sm border border-cream-200 text-[#2c1f0e] font-playfair text-xl hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors flex items-center justify-center"
                aria-label="Increase pew count"
              >
                +
              </button>
              <span className="font-raleway text-sm text-[#9b836e] ml-2">
                ≈ {pewCount * 9}–{pewCount * 10} guests
              </span>
            </div>
            {/* Visual bar */}
            <div className="mt-4 h-1.5 bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c9a96e] transition-all duration-300"
                style={{ width: `${(pewCount / MAX_PEWS) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-raleway text-xs text-[#9b836e]">1</span>
              <span className="font-raleway text-xs text-[#9b836e]">{MAX_PEWS}</span>
            </div>
          </div>

          {/* Wedding date */}
          <div className="mb-8">
            <label className="block font-raleway text-xs tracking-widest uppercase text-[#6b5744] mb-3">
              What is your wedding date?
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9a96e]" />
              <input
                type="date"
                value={weddingDate}
                min="2026-09-01"
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-sm font-raleway text-sm text-[#2c1f0e] focus:outline-none focus:border-[#c9a96e] transition-colors bg-[#fdfcf8]"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <label className="block font-raleway text-xs tracking-widest uppercase text-[#6b5744] mb-3">
              Where is the wedding located?
            </label>
            <p className="font-raleway text-xs text-[#9b836e] mb-4">
              We serve locations within 30 miles of Owensboro, KY
            </p>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9a96e]" />
              {locationChecking && (
                <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c9a96e] animate-spin" />
              )}
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setLocationError('') }}
                onBlur={checkLocationRadius}
                placeholder="City, venue name, or address"
                className={`w-full pl-10 pr-4 py-3 border rounded-sm font-raleway text-sm text-[#2c1f0e] placeholder-[#9b836e] focus:outline-none transition-colors bg-[#fdfcf8] ${
                  locationError ? 'border-red-300 focus:border-red-400' : 'border-cream-200 focus:border-[#c9a96e]'
                }`}
              />
            </div>
            {locationError && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-sm">
                <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <p className="font-raleway text-xs text-red-600 leading-relaxed">{locationError}</p>
              </div>
            )}
          </div>

          {/* Placement vs delivery */}
          <div className="mb-10">
            <label className="block font-raleway text-xs tracking-widest uppercase text-[#6b5744] mb-3">
              Do you need us to place the pews?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlacement('place')}
                className={`flex items-center gap-3 p-4 rounded-sm border text-left transition-all duration-200 ${
                  placement === 'place'
                    ? 'border-[#c9a96e] bg-[#c9a96e]/5'
                    : 'border-cream-200 hover:border-[#c9a96e]/50'
                }`}
              >
                <CheckSquare
                  size={18}
                  className={placement === 'place' ? 'text-[#c9a96e]' : 'text-[#9b836e]'}
                />
                <div>
                  <p className="font-raleway font-semibold text-sm text-[#2c1f0e]">Deliver & Place</p>
                  <p className="font-raleway text-xs text-[#9b836e]">We set them up for you</p>
                </div>
              </button>
              <button
                onClick={() => setPlacement('deliver')}
                className={`flex items-center gap-3 p-4 rounded-sm border text-left transition-all duration-200 ${
                  placement === 'deliver'
                    ? 'border-[#c9a96e] bg-[#c9a96e]/5'
                    : 'border-cream-200 hover:border-[#c9a96e]/50'
                }`}
              >
                <Truck
                  size={18}
                  className={placement === 'deliver' ? 'text-[#c9a96e]' : 'text-[#9b836e]'}
                />
                <div>
                  <p className="font-raleway font-semibold text-sm text-[#2c1f0e]">Delivery Only</p>
                  <p className="font-raleway text-xs text-[#9b836e]">Drop-off, we'll unload</p>
                </div>
              </button>
            </div>
          </div>

          {/* Price summary */}
          <div className="border-t border-cream-200 pt-7">
            <div className="flex items-center justify-between mb-2">
              <span className="font-raleway text-sm text-[#6b5744]">
                {pewCount} pew{pewCount !== 1 ? 's' : ''} × $25
              </span>
              <span className="font-playfair text-xl text-[#2c1f0e] font-bold">${pewTotal}</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="font-raleway text-sm text-[#6b5744]">Travel fee</span>
              <span className="font-raleway text-sm text-[#9b836e] italic">Based on location</span>
            </div>

            <a
              href="tel:2709035890"
              className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-sm"
            >
              <Phone size={16} />
              Call to Confirm — 270.903.5890
            </a>
            <p className="text-center font-raleway text-xs text-[#9b836e] mt-4">
              We'll confirm availability, finalize your travel fee, and hold your date.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
