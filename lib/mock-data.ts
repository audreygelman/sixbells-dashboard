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
  }
}
