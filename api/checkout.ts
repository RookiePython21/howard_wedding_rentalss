import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-06-20',
})

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY environment variable')
    return res.status(500).json({ message: 'Server is not configured for payments' })
  }

  const {
    priceId,
    quantity = 1,
    guestNames,
    checkoutMetadata,
  } = (req.body ?? {}) as {
    priceId?: string
    quantity?: number
    guestNames?: string[]
    checkoutMetadata?: Record<string, unknown>
  }

  if (!priceId) {
    return res.status(400).json({ message: 'priceId is required' })
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string)
  const clientUrl = process.env.CLIENT_URL || (host ? `${proto}://${host}` : 'http://localhost:5173')

  const cleanedGuests = Array.isArray(guestNames)
    ? guestNames.map((n) => String(n).replace(/\s+/g, ' ').trim()).filter(Boolean)
    : []

  const metadata: Record<string, string> = { source: 'howard-wedding-rentals-website' }
  if (cleanedGuests.length > 0) {
    metadata.guests_total = String(cleanedGuests.length)
    const chunks = chunkGuestNames(cleanedGuests)
    chunks.forEach((chunk, idx) => {
      metadata[`guests_${String(idx).padStart(2, '0')}`] = chunk
    })
  }

  if (checkoutMetadata && typeof checkoutMetadata === 'object' && checkoutMetadata !== null) {
    for (const [rawKey, rawVal] of Object.entries(checkoutMetadata)) {
      const key = String(rawKey).replace(/[^\w-]/g, '').slice(0, 40)
      if (!key) continue
      const val = String(rawVal ?? '').slice(0, 450)
      if (!val) continue
      metadata[key] = val
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity }],
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/shop`,
      metadata,
      payment_intent_data: { metadata },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return res.status(500).json({ message: 'Failed to create checkout session' })
  }
}

const STRIPE_METADATA_VALUE_LIMIT = 480
const MAX_GUEST_CHUNKS = 45

function chunkGuestNames(names: string[]): string[] {
  const chunks: string[] = []
  let current = ''

  for (const name of names) {
    const safe = name.slice(0, 200)
    const candidate = current ? `${current}\n${safe}` : safe
    if (candidate.length > STRIPE_METADATA_VALUE_LIMIT) {
      if (current) chunks.push(current)
      current = safe
      if (chunks.length >= MAX_GUEST_CHUNKS) return chunks
    } else {
      current = candidate
    }
  }
  if (current && chunks.length < MAX_GUEST_CHUNKS) chunks.push(current)
  return chunks
}
