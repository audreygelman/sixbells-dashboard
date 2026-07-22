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

// "Lower is better" metric: goal is a ceiling, 0 is ideal. percentToGoal
// measures headroom below the ceiling — full/green when value is near 0,
// empty/behind when it reaches the ceiling.
function inverseMetric(id: string, label: string, value: number, ceiling: number, format: KpiFormat): KpiMetric {
  const percentToGoal = ceiling > 0
    ? Math.max(0, Math.min(Math.round((1 - value / ceiling) * 100), 100))
    : 100
  return { id, label, value, goal: ceiling, format, percentToGoal, status: getStatus(percentToGoal), inverse: true }
}

// Display-only metric: shown as a tracked value with no goal or progress bar.
function displayMetric(id: string, label: string, value: number, format: KpiFormat): KpiMetric {
  return { id, label, value, goal: 0, format, percentToGoal: 0, status: 'on-track', display: true }
}

export function computeKpis(data: DashboardData) {
  const { ecommerce: e, hotel: h, restaurant: r, social: s, email: m } = data
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
      metric('ig-followers',  'Instagram Followers',  s.instagramFollowers,  GOALS.instagramFollowers, 'number'),
      metric('fb-followers',  'Facebook Followers',   s.facebookFollowers,    GOALS.facebookFollowers,  'number'),
      displayMetric('ad-spend',    'Ad Spend',              s.adSpend,             'currency'),
      displayMetric('ad-revenue',  'Attributable Revenue',  s.attributableRevenue, 'currency'),
      displayMetric('ad-roas',     'ROAS',                  s.roas,                'multiplier'),
      metric('ad-reach',      'Ad Reach',             s.adReach,             GOALS.adReach,            'number'),
      metric('ctr',           'CTR',                  s.ctr,                 GOALS.ctr,                'percent'),
    ],
    email: [
      metric('email-open',        'Open Rate',            m.openRate,            GOALS.emailOpenRate,           'percent'),
      metric('email-click',       'Click Rate',           m.clickRate,           GOALS.emailClickRate,          'percent'),
      metric('email-revenue',     'Email Revenue',        m.revenue,             GOALS.emailRevenue,            'currency'),
      metric('email-campaigns',   'Campaigns Sent',       m.campaignsSent,       GOALS.emailCampaignsSent,      'number'),
      metric('email-conversion',  'Conversion Rate',      m.conversionRate,      GOALS.emailConversionRate,     'percent'),
      metric('email-rpr',         'Revenue / Recipient',  m.revenuePerRecipient, GOALS.emailRevenuePerRecipient, 'currency-cents'),
      metric('email-subscribers', 'New Subscribers',      m.newSubscribers,      GOALS.emailNewSubscribers,     'number'),
      inverseMetric('email-unsubscribes', 'Unsubscribes', m.unsubscribes,        GOALS.emailUnsubscribesCeiling, 'number'),
    ],
  }
}
