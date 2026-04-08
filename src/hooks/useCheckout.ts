import { useState } from 'react'
import { createCheckoutSession } from '../services/api'

export function useCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function initiateCheckout(priceId: string, quantity = 1) {
    setLoading(true)
    setError(null)

    try {
      const { url } = await createCheckoutSession({ priceId, quantity })
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { initiateCheckout, loading, error }
}
