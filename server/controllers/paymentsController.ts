import type { Request, Response } from 'express'
import { stripe } from '../config/stripe'

export async function createCheckoutSession(req: Request, res: Response) {
  const {
    priceId,
    quantity = 1,
    guestNames,
  } = req.body as { priceId: string; quantity: number; guestNames?: string[] }

  if (!priceId) {
    return res.status(400).json({ message: 'priceId is required' })
  }

  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'

  const cleanedGuests = Array.isArray(guestNames)
    ? guestNames.map((n) => String(n).replace(/\s+/g, ' ').trim()).filter(Boolean)
    : []

  const metadata: Record<string, string> = { source: 'howard-wedding-rentals-website' }
  if (cleanedGuests.length > 0) {
    metadata.guests_total = String(cleanedGuests.length)
    chunkGuestNames(cleanedGuests).forEach((chunk, idx) => {
      metadata[`guests_${String(idx).padStart(2, '0')}`] = chunk
    })
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

    return res.json({ url: session.url })
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
