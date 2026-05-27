import { GOALS } from '@/config/goals'
import { DashboardData, KpiFormat, KpiMetric, KpiStatus } from './types'

function getStatus(pct: number): KpiStatus {
  if (pct >= 90) return 'on-track'
  if (pct >= 70) return 'close'
  return 'behind'
}

function toPercent(value: number, goal: number): number {
  return Math.min(Math.round((value / goal) * 100), 100)
}

function metric(id: string, label: string, value: number, goal: number, format: KpiFormat): KpiMetric {
  const percentToGoal = toPercent(value, goal)
  return { id, label, value, goal, format, percentToGoal, status: getStatus(percentToGoal) }
}

export function computeKpis(data: DashboardData) {
  const { ecommerce: e, hotel: h, restaurant: r, social: s } = data
  return {
    ecommerce: [
      metric('revenue',  'Revenue',         e.revenue, GOALS.shopifyRevenue,    'currency'),
      metric('orders',   'Orders',           e.orders,  GOALS.shopifyOrders,     'number'),
      metric('aov',      'Avg Order Value',  e.aov,     GOALS.shopifyAOV,        'currency'),
    ],
    hotel: [
      metric('occupancy', 'Occupancy Rate',  h.occupancyRate, GOALS.occupancyRate,      'percent'),
      metric('adr',       'Avg Daily Rate',  h.adr,           GOALS.averageDailyRate,   'currency'),
      metric('revpar',    'RevPAR',          h.revpar,        GOALS.revPAR,             'currency'),
    ],
    restaurant: [
      metric('rest-revenue', 'Revenue',        r.revenue,      GOALS.restaurantRevenue, 'currency'),
      metric('avg-check',    'Avg Check Size', r.avgCheckSize, GOALS.averageCheckSize,  'currency'),
    ],
    social: [
      metric('followers',   'Followers',       s.followers,      GOALS.instagramFollowers, 'number'),
      metric('conversion',  'Conversion Rate', s.conversionRate, GOALS.conversionRate,     'percent'),
      metric('engagement',  'Engagement Rate', s.engagementRate, GOALS.engagementRate,     'percent'),
    ],
  }
}
