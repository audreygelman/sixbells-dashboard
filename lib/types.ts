export type KpiStatus = 'on-track' | 'close' | 'behind'
export type KpiFormat = 'currency' | 'number' | 'percent'

export interface KpiMetric {
  id: string
  label: string
  value: number
  goal: number
  format: KpiFormat
  percentToGoal: number
  status: KpiStatus
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
    followers: number
    conversionRate: number
    engagementRate: number
  }
}
