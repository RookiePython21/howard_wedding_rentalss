// Conversion tracking. Phone calls are the KPI.
//
// GA4: the site already loads GA4 through Firebase Analytics (measurement ID comes from
// VITE_FIREBASE_MEASUREMENT_ID), so events are sent with Firebase's logEvent.
// Optional extras, each a safe no-op when its env var is unset:
//   VITE_GOOGLE_ADS_ID                 e.g. AW-1234567890
//   VITE_GOOGLE_ADS_CALL_LABEL         conversion label for call clicks
//   VITE_GOOGLE_ADS_LEAD_LABEL         conversion label for quote estimates (optional)
//   VITE_META_PIXEL_ID                 Meta pixel id
// Quote estimates, call taps and quote contact forms are also saved to Firestore (quoteCapture.ts).
import { logEvent } from 'firebase/analytics'
import { analyticsReady } from './firebase'
import { captureAttribution, recordCallClick } from './quoteCapture'

type Params = Record<string, string | number>
type Gtag = (...args: unknown[]) => void

const env = import.meta.env
const ADS_ID = env.VITE_GOOGLE_ADS_ID as string | undefined
const ADS_CALL_LABEL = env.VITE_GOOGLE_ADS_CALL_LABEL as string | undefined
const ADS_LEAD_LABEL = env.VITE_GOOGLE_ADS_LEAD_LABEL as string | undefined
const PIXEL_ID = env.VITE_META_PIXEL_ID as string | undefined

let started = false

function gtag(): Gtag | undefined {
  return (window as unknown as { gtag?: Gtag }).gtag
}

function fbq(...args: unknown[]) {
  const f = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
  if (f) f(...args)
}

function loadMetaPixel(id: string) {
  const w = window as unknown as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  if (w.fbq) return
  // Standard Meta pixel bootstrap: queue calls until fbevents.js loads.
  const n: any = (w.fbq = function (...args: unknown[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (n.callMethod) n.callMethod(...args)
    else n.queue.push(args)
  })
  if (!w._fbq) w._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(s)
  n('init', id)
  n('track', 'PageView')
}

function track(name: string, params: Params, adsLabel?: string, metaEvent?: string) {
  analyticsReady.then((analytics) => {
    if (analytics) logEvent(analytics, name, params)
    if (ADS_ID && adsLabel) gtag()?.('event', 'conversion', { send_to: `${ADS_ID}/${adsLabel}` })
  })
  if (PIXEL_ID && metaEvent) fbq('track', metaEvent, params)
}

// Custom Meta event (trackCustom), so Ads Manager never reports it as a standard Lead/Contact.
// Ad sets optimize for QuoteEstimate and are judged on Contact + QuoteContactSubmit, via custom
// conversions on the pixel.
function trackCustom(name: string, params: Params, metaEvent: string, adsLabel?: string) {
  analyticsReady.then((analytics) => {
    if (analytics) logEvent(analytics, name, params)
    if (ADS_ID && adsLabel) gtag()?.('event', 'conversion', { send_to: `${ADS_ID}/${adsLabel}` })
  })
  if (PIXEL_ID) fbq('trackCustom', metaEvent, params)
}

const ESTIMATE_SENT_KEY = 'hwr_quote_estimate_sent'

// True the first time it is called in a browser session.
function firstInSession(key: string): boolean {
  try {
    if (window.sessionStorage.getItem(key)) return false
    window.sessionStorage.setItem(key, '1')
  } catch {
    /* storage blocked: count it */
  }
  return true
}

export function trackPhoneClick(placement: string, page: string) {
  track('phone_call_click', { placement, page_path: page, phone: '+12709035890' }, ADS_CALL_LABEL, 'Contact')
  recordCallClick(placement)
}

/** A venue resolved and the quote tool showed a travel estimate. Once per session: the ads optimize
 *  on this, so it counts visitors who got a quote, not every venue they tried. Not a lead. */
export function trackQuoteEstimate(params: { pews: number; total: number; has_location: number }) {
  if (!firstInSession(ESTIMATE_SENT_KEY)) return
  trackCustom('generate_lead', { ...params, lead_type: 'quote_estimate', currency: 'USD', value: params.total }, 'QuoteEstimate', ADS_LEAD_LABEL)
}

/** Visitor left name + phone on the quote tool: the first lead we can actually follow up. */
export function trackQuoteContact(params: { pews: number; total: number }) {
  trackCustom('quote_contact_submit', { ...params, currency: 'USD', value: params.total }, 'QuoteContactSubmit')
}

function placementFor(a: HTMLElement): string {
  const explicit = a.closest<HTMLElement>('[data-call-placement]')
  if (explicit) return explicit.dataset.callPlacement as string
  if (a.closest('nav, header')) return 'navbar'
  if (a.closest('footer')) return 'footer'
  const section = a.closest<HTMLElement>('section[id]')
  return section ? `section:${section.id}` : 'body'
}

/** Call once at startup. Attaches ONE delegated listener covering every tel: link. */
export function initAnalytics() {
  if (started || typeof document === 'undefined') return
  started = true
  captureAttribution()

  document.addEventListener('click', (e) => {
    const target = e.target as Element | null
    const a = target?.closest?.('a[href^="tel:"]') as HTMLElement | null
    if (a) trackPhoneClick(placementFor(a), window.location.pathname)
  })

  if (ADS_ID) {
    analyticsReady.then(() => {
      const g = gtag()
      if (g) g('config', ADS_ID)
    })
  }
  if (PIXEL_ID) loadMetaPixel(PIXEL_ID)
}
