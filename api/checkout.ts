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

  const { priceId, quantity = 1 } = (req.body ?? {}) as { priceId?: string; quantity?: number }

  if (!priceId) {
    return res.status(400).json({ message: 'priceId is required' })
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string)
  const clientUrl = process.env.CLIENT_URL || (host ? `${proto}://${host}` : 'http://localhost:5173')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity }],
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/shop`,
      metadata: { source: 'howard-wedding-rentals-website' },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return res.status(500).json({ message: 'Failed to create checkout session' })
  }
}
