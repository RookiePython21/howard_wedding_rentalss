import { useState, useRef, useEffect } from 'react'
import { Phone, MapPin, Truck, CheckSquare, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import {
  PEW_PRICE,
  MAX_PEWS,
  MINIMUM_CHARGE,
  GUESTS_PER_PEW_MIN,
  GUESTS_PER_PEW_MAX,
  GUESTS_PER_PEW_LABEL,
  ROUND_TRIP_MULTIPLIER,
  computeQuote,
} from '../../config/pricing'
import { trackQuoteEstimate } from '../../services/analytics'
import { recordQuote, type QuoteSnapshot } from '../../services/quoteCapture'
import QuoteContactForm from './QuoteContactForm'

type ResolvedPlace = { name: string; city: string; state: string; postcode: string; lat: number; lng: number }

// Seconds of no changes before a quote is saved, so clicking the pew count up from 6 to 14
// saves one quote, not eight.
const QUOTE_SETTLE_MS = 2500

// Single fixed departure point: 9643 KY-2157, Whitesville, KY 42378 (KY-2157 / McCamish Rd).
const ORIGIN_LAT = 37.734848
const ORIGIN_LNG = -86.852473

function formatUSD(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}

// Today's date as YYYY-MM-DD in the visitor's LOCAL time zone (not UTC).
function localToday(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function daysUntil(isoDate: string): number | null {
  if (!isoDate) return null
  const ms = new Date(`${isoDate}T00:00:00`).getTime() - new Date(`${localToday()}T00:00:00`).getTime()
  return Number.isFinite(ms) ? Math.round(ms / 86_400_000) : null
}

export default function Pricing() {
  const [pewCount, setPewCount] = useState(6)
  const [weddingDate, setWeddingDate] = useState('')
  const [minDate, setMinDate] = useState('') // set on the client so prerendered HTML never bakes in a build-time date
  useEffect(() => {
    const today = localToday()
    setMinDate(today)
    setWeddingDate((cur) => (cur && cur >= today ? cur : today))
  }, [])
  const [location, setLocation] = useState('')
  const [placement, setPlacement] = useState<'place' | 'deliver'>('place')
  const [driveHours, setDriveHours] = useState<number | null>(null) // one-way driving time, in hours
  const [estimateFailed, setEstimateFailed] = useState(false)
  const [locationChecking, setLocationChecking] = useState(false)
  const [place, setPlace] = useState<ResolvedPlace | null>(null)
  const lastGeoCall = useRef<number>(0)
  const lastSavedQuote = useRef('')

  async function computeTravel() {
    const trimmed = location.trim()
    if (!trimmed) { setDriveHours(null); setEstimateFailed(false); setPlace(null); return }

    const now = Date.now()
    if (now - lastGeoCall.current < 3000) return
    lastGeoCall.current = now

    setLocationChecking(true)
    setEstimateFailed(false)
    setPlace(null)

    try {
      // 1. Geocode the venue (free Nominatim).
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const geoData = await geoRes.json()
      if (!geoData.length) {
        setEstimateFailed(true)
        setDriveHours(null)
        return
      }
      const destLat = parseFloat(geoData[0].lat)
      const destLng = parseFloat(geoData[0].lon)
      const addr = geoData[0].address ?? {}
      setPlace({
        name: String(geoData[0].display_name ?? ''),
        city: String(addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? addr.county ?? ''),
        state: String(addr.state ?? ''),
        postcode: String(addr.postcode ?? ''),
        lat: destLat,
        lng: destLng,
      })

      // 2. Driving time from our origin to the venue (free OSRM public server; lng,lat order).
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${ORIGIN_LNG},${ORIGIN_LAT};${destLng},${destLat}?overview=false`
      )
      const routeData = await routeRes.json()
      if (routeData.code !== 'Ok' || !routeData.routes?.length) {
        setEstimateFailed(true)
        setDriveHours(null)
        return
      }
      setDriveHours(routeData.routes[0].duration / 3600)
    } catch {
      // Network/routing failure — fall back to pew total + "confirm by phone".
      setEstimateFailed(true)
      setDriveHours(null)
    } finally {
      setLocationChecking(false)
    }
  }

  // Derived pricing (recomputes on render, so changing the pew count updates the total
  // instantly without re-fetching the drive time).
  const { pewTotal, travelFee, minimumAdjustment, total, travelWins, isLocal } = computeQuote(pewCount, driveHours)
  const billableHours = driveHours != null ? driveHours * ROUND_TRIP_MULTIPLIER : null

  // generate_lead: fire once per computed travel estimate (a venue was entered and resolved).
  useEffect(() => {
    if (driveHours != null) {
      trackQuoteEstimate({ pews: pewCount, total: Math.round(total), has_location: 1 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveHours])

  function snapshot(): QuoteSnapshot {
    return {
      status: driveHours != null ? 'ok' : estimateFailed ? 'failed' : 'no_location',
      location: location.trim().slice(0, 200),
      resolved_place: (place?.name ?? '').slice(0, 300),
      city: place?.city ?? '',
      state: place?.state ?? '',
      postcode: place?.postcode ?? '',
      lat: place?.lat ?? null,
      lng: place?.lng ?? null,
      drive_hours_one_way: driveHours != null ? Math.round(driveHours * 100) / 100 : null,
      billable_hours: billableHours != null ? Math.round(billableHours * 100) / 100 : null,
      pews: pewCount,
      pew_total: Math.round(pewTotal),
      travel_fee: Math.round(travelFee),
      minimum_adjustment: Math.round(minimumAdjustment),
      total: Math.round(total),
      travel_wins: travelWins,
      is_local: isLocal,
      placement,
      wedding_date: weddingDate,
      days_out: daysUntil(weddingDate),
    }
  }

  // Save every quote the visitor settles on (venue resolved, or venue typed but not found).
  useEffect(() => {
    if (driveHours == null && !estimateFailed) return
    const t = window.setTimeout(() => {
      const q = snapshot()
      const key = [q.status, q.location, q.pews, q.placement, q.wedding_date, q.total].join('|')
      if (key === lastSavedQuote.current) return
      lastSavedQuote.current = key
      recordQuote(q)
    }, QUOTE_SETTLE_MS)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveHours, estimateFailed, pewCount, placement, weddingDate])

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#f5edd8]/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            Your Estimate
          </p>
          <h2 className="section-title mb-4">Get Your Custom Quote</h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-6 max-w-xl mx-auto">
            Tell us your guest count and venue below for an instant estimate, then give us a call and we'll finalize the details and hold your date.
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
              Each pew seats {GUESTS_PER_PEW_LABEL} adults &mdash; maximum of {MAX_PEWS} pews
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
                ≈ {pewCount * GUESTS_PER_PEW_MIN}–{pewCount * GUESTS_PER_PEW_MAX} guests
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
                min={minDate || undefined}
                onChange={(e) => {
                  const v = e.target.value
                  const today = localToday()
                  setWeddingDate(v && v < today ? today : v)
                }}
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
              Enter your venue for an instant travel estimate
            </p>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9a96e]" />
              {locationChecking && (
                <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c9a96e] animate-spin" />
              )}
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setEstimateFailed(false); setDriveHours(null) }}
                onBlur={computeTravel}
                placeholder="City, venue name, or address"
                className="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-sm font-raleway text-sm text-[#2c1f0e] placeholder-[#9b836e] focus:outline-none focus:border-[#c9a96e] transition-colors bg-[#fdfcf8]"
              />
            </div>
            {estimateFailed && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-[#f5edd8]/50 border border-cream-200 rounded-sm">
                <AlertCircle size={15} className="text-[#c9a96e] mt-0.5 shrink-0" />
                <p className="font-raleway text-xs text-[#6b5744] leading-relaxed">
                  We couldn't estimate the travel time automatically — no problem. Give us a call and we'll confirm your travel fee in a moment.
                </p>
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
            <div className="flex items-center justify-between mb-3">
              <span className="font-raleway text-sm text-[#6b5744]">
                {pewCount} pew{pewCount !== 1 ? 's' : ''} × ${PEW_PRICE}
              </span>
              <span className="font-raleway text-sm text-[#2c1f0e] font-semibold">{formatUSD(pewTotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-raleway text-sm text-[#6b5744]">Travel &amp; setup</span>
              <span className="font-raleway text-sm">
                {locationChecking ? (
                  <span className="text-[#9b836e] italic">Calculating…</span>
                ) : estimateFailed ? (
                  <span className="text-[#9b836e] italic">Confirmed by phone</span>
                ) : billableHours == null ? (
                  <span className="text-[#9b836e] italic">Enter location to estimate</span>
                ) : isLocal ? (
                  <span className="text-[#6b5744]">Included (local)</span>
                ) : (
                  <span className="text-[#2c1f0e] font-semibold">{formatUSD(travelFee)}</span>
                )}
              </span>
            </div>
            {billableHours != null && !isLocal && (
              <p className="font-raleway text-xs text-[#9b836e] mt-1">
                ≈ {billableHours.toFixed(1)} hrs driving · two round trips (drop-off + pick-up)
              </p>
            )}

            {minimumAdjustment > 0 && (
              <div className="flex items-center justify-between mt-3">
                <span className="font-raleway text-sm text-[#6b5744]">Minimum charge adjustment</span>
                <span className="font-raleway text-sm text-[#2c1f0e] font-semibold">{formatUSD(minimumAdjustment)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-cream-200 pt-4 mt-4 mb-2">
              <span className="font-raleway text-sm text-[#6b5744] font-semibold">Estimated total</span>
              <span className="font-playfair text-2xl text-[#2c1f0e] font-bold">{formatUSD(total)}</span>
            </div>
            {travelWins && (
              <p className="font-raleway text-xs text-[#9b836e] mb-4">
                Your travel rate is greater than the pew subtotal, so the travel rate applies.
              </p>
            )}

            {minimumAdjustment > 0 && (
              <p className="font-raleway text-xs text-[#9b836e] mb-4">
                Every booking has a {formatUSD(MINIMUM_CHARGE)} minimum charge, so the total is raised to that amount.
              </p>
            )}

            <a
              data-call-placement="quote-result"
              href="tel:+12709035890"
              className="btn-gold w-full flex items-center justify-center gap-2 py-4 text-sm mt-4"
            >
              <Phone size={16} />
              Call to Confirm — 270.903.5890
            </a>
            <p className="text-center font-raleway text-xs text-[#9b836e] mt-4">
              This is an estimate only, not a final price. Travel fees may apply and are confirmed when you call, along with final details and holding your date.
            </p>

            <QuoteContactForm getQuote={snapshot} />
          </div>
        </div>
      </div>
    </section>
  )
}
