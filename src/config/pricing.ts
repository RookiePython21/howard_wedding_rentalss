// Single source of truth for pew pricing, capacity and travel fees.
// Anything on the site that states a price, a per-pew capacity, or a travel rule
// should import from here instead of hardcoding the number.

export const PEW_PRICE = 50
export const MAX_PEWS = 14

// Seating per pew (owner, 2026-10-16: 6-7 adults, not 9-10).
export const GUESTS_PER_PEW_MIN = 6
export const GUESTS_PER_PEW_MAX = 7
export const GUESTS_PER_PEW_LABEL = `${GUESTS_PER_PEW_MIN}-${GUESTS_PER_PEW_MAX}`

// Minimum charge for any booking, regardless of travel distance. Applies to the TOTAL.
export const MINIMUM_CHARGE = 1500

// Travel fee: for trips whose billable driving exceeds FREE_TRAVEL_HOURS, the charge is a
// base fee plus an hourly rate on the *billable* hours. Billable hours = one-way drive time
// multiplied by 4, because the crew makes two round trips (drop-off + pick-up).
// Doubled 2026-10-16 (owner): base 300 -> 600, hourly 150 -> 300.
export const BASE_TRAVEL_FEE = 600
export const PER_HOUR_RATE = 300
export const ROUND_TRIP_MULTIPLIER = 4
export const FREE_TRAVEL_HOURS = 1

/** Conservative pew count for a guest count (uses the low end, 6 per pew). */
export function pewsForGuests(guests: number): number {
  return Math.ceil(guests / GUESTS_PER_PEW_MIN)
}

export interface Quote {
  pewTotal: number
  /** Travel charge shown to the customer (0 when local). */
  travelFee: number
  /** Top-up added so the total reaches MINIMUM_CHARGE (0 when already above). */
  minimumAdjustment: number
  total: number
  /** True when the travel rate exceeded the pew subtotal. */
  travelWins: boolean
  isLocal: boolean
}

/**
 * driveHours = one-way driving time, or null when unknown.
 * Existing rule kept: for trips over the free-travel threshold the customer pays the
 * GREATER of (pew subtotal) and (travel formula); the travel fee is the difference.
 * New rule: the total is then raised to MINIMUM_CHARGE if it is lower.
 */
export function computeQuote(pewCount: number, driveHours: number | null): Quote {
  const pewTotal = pewCount * PEW_PRICE
  const billableHours = driveHours != null ? driveHours * ROUND_TRIP_MULTIPLIER : null
  let base = pewTotal
  if (billableHours != null && billableHours > FREE_TRAVEL_HOURS) {
    base = Math.max(pewTotal, BASE_TRAVEL_FEE + PER_HOUR_RATE * billableHours)
  }
  const total = Math.max(base, MINIMUM_CHARGE)
  return {
    pewTotal,
    travelFee: base - pewTotal,
    minimumAdjustment: total - base,
    total,
    travelWins: base > pewTotal,
    isLocal: billableHours != null && billableHours <= FREE_TRAVEL_HOURS,
  }
}
