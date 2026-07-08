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
      followers: 8400,
      conversionRate: 2.8,
      engagementRate: 4.2,
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
