import type { CheckoutRequest, CheckoutResponse } from '../types'

const API_BASE = '/api'

export async function createCheckoutSession(data: CheckoutRequest): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Something went wrong' }))
    throw new Error(error.message || 'Failed to create checkout session')
  }

  return response.json()
}
