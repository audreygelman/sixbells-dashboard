import { DashboardData } from './types'

// ─────────────────────────────────────────────────────────────
// MOCK DATA — replace each section with real API calls once
// credentials are set up (Shopify, MEWS, Toast, Instagram)
// ─────────────────────────────────────────────────────────────
export function getMockData(): DashboardData {
  return {
    lastUpdated: new Date().toISOString(),
    ecommerce: {
      revenue: 43200,
      orders: 168,
      aov: 257,
    },
    hotel: {
      occupancyRate: 72,
      adr: 260,
      revpar: 187,
    },
    restaurant: {
      revenue: 18500,
      avgCheckSize: 58,
    },
    social: {
      instagramFollowers: 84000,
      facebookFollowers: 2400,
      adSpend: 3500,
      attributableRevenue: 13000,
      roas: 3.7,
      adReach: 90000,
      ctr: 6.2,
    },
    email: {
      openRate: 41.5,
      clickRate: 2.4,
      revenue: 9200,
      conversionRate: 1.8,
      revenuePerRecipient: 0.12,
      campaignsSent: 4,
      newSubscribers: 80,
      unsubscribes: 15,
    },
  }
}
