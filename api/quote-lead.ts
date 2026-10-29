// Texts the owner the moment a visitor leaves their name + number on the quote tool.
// The lead itself is also saved to Firestore by the browser (quote_leads); this is only the alert.
// Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, TWILIO_TO_NUMBER (owner's cell).

const rateMap = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT = 3
const WINDOW_MS = 10 * 60_000

function getClientIp(req: any): string {
  const fwd = req.headers['x-forwarded-for']
  return (typeof fwd === 'string' ? fwd.split(',')[0].trim() : (req.socket?.remoteAddress as string | undefined)) ?? 'unknown'
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateMap.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : raw
}

function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${Number(m[2])}/${Number(m[3])}/${m[1].slice(2)}` : 'no date'
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!checkRateLimit(getClientIp(req))) {
    return res.status(429).json({ message: 'Too many requests.' })
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, TWILIO_TO_NUMBER } = process.env
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !TWILIO_TO_NUMBER) {
    console.error('quote-lead: missing Twilio environment variables')
    return res.status(500).json({ message: 'Not configured' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
  const name = str(body.name, 60)
  const phone = str(body.phone, 30)
  const digits = phone.replace(/\D/g, '')
  if (!name || digits.length < 10 || digits.length > 11) {
    return res.status(400).json({ message: 'Name and a 10-digit phone number are required.' })
  }
  const email = str(body.email, 100)
  const q = body.quote ?? {}
  const a = body.attribution ?? {}

  const pews = num(q.pews)
  const total = num(q.total)
  const hours = num(q.drive_hours_one_way)
  const days = num(q.days_out)
  const where = [str(q.city, 40), str(q.state, 20), str(q.postcode, 10)].filter(Boolean).join(', ')
    || str(q.location, 60) || 'no venue entered'
  const source = [str(a.utm_source, 20), str(a.utm_content, 40)].filter(Boolean).join('/')
    || (a.gclid ? 'google ads' : a.fbclid ? 'facebook' : str(a.referrer, 40) || 'direct')

  const lines = [
    `HWR QUOTE LEAD: ${name} ${formatPhone(phone)}${email ? ` ${email}` : ''}`,
    `${pews ?? '?'} pews, ${q.placement === 'deliver' ? 'delivery only' : 'deliver & place'}`,
    `Wedding ${formatDate(str(q.wedding_date, 10))}${days != null ? ` (${days} days out)` : ''}`,
    `${where}${hours != null ? ` (${hours.toFixed(1)} hr drive)` : ''}`,
    `Est ${total != null ? `$${Math.round(total).toLocaleString('en-US')}` : '?'}${q.status === 'failed' ? ' (travel not calculated)' : ''}`,
    `Via ${source}`,
  ]

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: TWILIO_TO_NUMBER, From: TWILIO_FROM_NUMBER, Body: lines.join('\n') }).toString(),
    })
    if (!r.ok) {
      console.error('quote-lead: Twilio error', r.status, (await r.text()).slice(0, 300))
      return res.status(502).json({ message: 'Alert failed' })
    }
  } catch (err) {
    console.error('quote-lead: Twilio request failed', err)
    return res.status(502).json({ message: 'Alert failed' })
  }

  return res.status(200).json({ ok: true })
}
