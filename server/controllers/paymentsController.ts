import type { Request, Response } from 'express'
import { stripe } from '../config/stripe'

export async function createCheckoutSession(req: Request, res: Response) {
  const { priceId, quantity = 1 } = req.body as { priceId: string; quantity: number }

  if (!priceId) {
    return res.status(400).json({ message: 'priceId is required' })
  }

  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/#pricing`,
      metadata: {
        source: 'howard-wedding-rentals-website',
      },
    })

    return res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return res.status(500).json({ message: 'Failed to create checkout session' })
  }
}
