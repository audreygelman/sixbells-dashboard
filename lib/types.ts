export type KpiStatus = 'on-track' | 'close' | 'behind'
export type KpiFormat = 'currency' | 'currency-cents' | 'number' | 'percent' | 'multiplier'

export interface KpiMetric {
  id: string
  label: string
  value: number
  goal: number
  format: KpiFormat
  percentToGoal: number
  status: KpiStatus
  // For "lower is better" metrics (e.g. unsubscribes): goal is a ceiling,
  // 0 is ideal, and the card shows headroom below the ceiling.
  inverse?: boolean
  // Display-only: just show the value (no goal, progress bar, or status).
  display?: boolean
}

export interface DashboardData {
  lastUpdated: string
  ecommerce: {
    revenue: number
    orders: number
    aov: number
  }
  hotel: {
    occupancyRate: number
    adr: number
    revpar: number
  }
  restaurant: {
    revenue: number
    avgCheckSize: number
  }
  social: {
    instagramFollowers: number
    facebookFollowers: number
    adSpend: number
    attributableRevenue: number
    roas: number
    adReach: number
    ctr: number
  }
  email: {
    openRate: number
    clickRate: number
    revenue: number
    conversionRate: number
    revenuePerRecipient: number
    campaignsSent: number
    newSubscribers: number
    unsubscribes: number
  }
}
