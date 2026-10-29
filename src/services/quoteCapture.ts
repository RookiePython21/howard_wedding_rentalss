// Quote capture: every estimate the quote tool shows, every call tap, and every
// "send me this quote" contact form lands in Firestore so we can find the price sweet spot.
//
//   quotes        one doc per estimate shown (anonymous). Several per visit is normal; the last
//                 one per sessionId is what the visitor settled on.
//   call_clicks   one doc per tel: tap, joined to quotes by sessionId.
//   quote_leads   contact form submissions (name/phone/email + the quote they were looking at).
//
// Firestore rules allow create only, never read, on all three (firestore.rules). Every write is
// best-effort: a failed write must never break the quote tool or the call button.
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const SESSION_KEY = 'hwr_session_id'
const ATTRIBUTION_KEY = 'hwr_attribution'
const LAST_QUOTE_KEY = 'hwr_last_quote_total'
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

export type Attribution = {
  landing_path: string
  referrer: string
  fbclid: number
  gclid: number
} & Partial<Record<(typeof UTM_KEYS)[number], string>>

export type QuoteSnapshot = {
  // 'failed' = venue typed but we couldn't geocode/route it; 'no_location' = only sent with a
  // contact form, when the visitor never entered a venue.
  status: 'ok' | 'failed' | 'no_location'
  location: string // what the visitor typed
  resolved_place: string // geocoder's display name ('' when failed)
  city: string
  state: string
  postcode: string
  lat: number | null
  lng: number | null
  drive_hours_one_way: number | null
  billable_hours: number | null
  pews: number
  pew_total: number
  travel_fee: number
  minimum_adjustment: number
  total: number
  travel_wins: boolean
  is_local: boolean
  placement: 'place' | 'deliver'
  wedding_date: string
  days_out: number | null
}

function storage(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function clip(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s
}

export function getSessionId(): string {
  const s = storage()
  let id = s?.getItem(SESSION_KEY) ?? ''
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    s?.setItem(SESSION_KEY, id)
  }
  return id
}

/** Call once at startup, before the SPA navigates away from the landing URL and drops the UTMs. */
export function captureAttribution() {
  const s = storage()
  if (typeof window === 'undefined' || s?.getItem(ATTRIBUTION_KEY)) return
  const params = new URLSearchParams(window.location.search)
  const a: Attribution = {
    landing_path: clip(window.location.pathname, 200),
    referrer: clip(document.referrer || '', 300),
    fbclid: params.has('fbclid') ? 1 : 0,
    gclid: params.has('gclid') ? 1 : 0,
  }
  for (const k of UTM_KEYS) {
    const v = params.get(k)
    if (v) a[k] = clip(v, 100)
  }
  s?.setItem(ATTRIBUTION_KEY, JSON.stringify(a))
  getSessionId()
}

export function getAttribution(): Attribution {
  try {
    const raw = storage()?.getItem(ATTRIBUTION_KEY)
    if (raw) return JSON.parse(raw) as Attribution
  } catch {
    /* fall through */
  }
  return { landing_path: '', referrer: '', fbclid: 0, gclid: 0 }
}

function base() {
  return {
    session_id: getSessionId(),
    page_path: clip(window.location.pathname, 200),
    ...getAttribution(),
    created_at: serverTimestamp(),
  }
}

export function recordQuote(q: QuoteSnapshot) {
  storage()?.setItem(LAST_QUOTE_KEY, String(q.total))
  addDoc(collection(db, 'quotes'), { ...base(), ...q }).catch(() => {
    /* best-effort */
  })
}

export function recordCallClick(placement: string) {
  const last = Number(storage()?.getItem(LAST_QUOTE_KEY) ?? '')
  addDoc(collection(db, 'call_clicks'), {
    ...base(),
    placement: clip(placement, 100),
    last_quote_total: Number.isFinite(last) && last > 0 ? last : null,
  }).catch(() => {
    /* best-effort */
  })
}

export type QuoteContact = { name: string; phone: string; email: string }

/**
 * Saves the lead and texts the owner. Resolves true when at least one of the two landed,
 * so the visitor sees a confirmation whenever we actually have their details.
 */
export async function submitQuoteLead(contact: QuoteContact, quote: QuoteSnapshot | null): Promise<boolean> {
  const lead = {
    name: clip(contact.name.trim(), 100),
    phone: clip(contact.phone.trim(), 30),
    email: clip(contact.email.trim().toLowerCase(), 200),
  }
  const saved = addDoc(collection(db, 'quote_leads'), { ...base(), ...lead, quote })
    .then(() => true)
    .catch(() => false)
  const texted = fetch('/api/quote-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...lead, quote, attribution: getAttribution() }),
  })
    .then((r) => r.ok)
    .catch(() => false)
  const [a, b] = await Promise.all([saved, texted])
  return a || b
}
