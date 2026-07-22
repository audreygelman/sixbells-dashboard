// ─────────────────────────────────────────────
// Monthly goals — update these each month
// All monetary values in USD
// ─────────────────────────────────────────────

export const GOALS = {
  // ── Ecommerce — Shopify ──────────────────────
  shopifyGrossRevenue: 65000,
  shopifyNetRevenue: 48000,
  shopifyRevenue: 50000,
  shopifyOrders: 200,
  shopifyAOV: 250,

  // ── Hotel — MEWS ────────────────────────────
  hotelGrossRevenue: 90000,
  hotelNetRevenue: 68000,
  occupancyRate: 80,      // percentage
  averageDailyRate: 275,  // per night
  revPAR: 220,            // revenue per available room

  // ── Restaurant — Toast ───────────────────────
  restaurantGrossRevenue: 40000,
  restaurantNetRevenue: 28000,
  restaurantRevenue: 30000,
  averageCheckSize: 65,

  // ── Marketing & Social — Meta (Facebook/Instagram/Ads) ──
  instagramFollowers: 90000,  // target total (by end of year)
  facebookFollowers: 3000,    // running goal
  adReach: 100000,            // monthly ad reach
  ctr: 6,                     // percentage
  // Ad Spend, Attributable Revenue and ROAS are tracked without a goal.

  // ── Email — Klaviyo ─────────────────────────
  emailOpenRate: 45,             // percentage
  emailClickRate: 3.0,           // percentage
  emailRevenue: 12000,           // attributed revenue (USD)
  emailCampaignsSent: 6,         // campaigns per month
  emailConversionRate: 0.1,      // percentage (orders per recipient)
  emailRevenuePerRecipient: 0.15, // USD per recipient
  emailNewSubscribers: 100,      // new email subscribers per month
  emailUnsubscribesCeiling: 150, // max acceptable unsubscribes (0 is ideal)
} as const
