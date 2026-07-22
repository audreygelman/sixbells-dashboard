// ─────────────────────────────────────────────────────────────
// Meta (Facebook / Instagram / Ads) — organic follower counts and
// paid ad performance for the current month, via the Graph API.
//
// Followers come from the brand Page (the one with a linked Instagram
// Business account). Ad metrics come from the ad account insights.
//
// Auth: META_ACCESS_TOKEN (a token with pages_read_engagement,
// pages_show_list, ads_read). META_AD_ACCOUNT_ID selects the ad account.
// ─────────────────────────────────────────────────────────────

const GRAPH = 'https://graph.facebook.com/v21.0'

interface Page {
  name?: string
  followers_count?: number
  instagram_business_account?: { followers_count?: number }
}

interface AdInsightsRow {
  spend?: string
  reach?: string
  ctr?: string
  action_values?: Array<{ action_type: string; value: string }>
  purchase_roas?: Array<{ action_type: string; value: string }>
}

export async function getMetaSocial() {
  const token = process.env.META_ACCESS_TOKEN?.trim()
  const adAccountId = process.env.META_AD_ACCOUNT_ID?.trim()
  if (!token) return null

  try {
    // Followers — pick the Page that has a linked Instagram account (the
    // main brand page); it carries both the FB and IG follower counts.
    const pagesRes = await fetch(
      `${GRAPH}/me/accounts?fields=name,followers_count,instagram_business_account{followers_count}&access_token=${token}`,
    )
    if (!pagesRes.ok) return null

    const pages = ((await pagesRes.json()) as { data?: Page[] }).data ?? []
    const brandPage = pages.find(p => p.instagram_business_account) ?? pages[0]
    if (!brandPage) return null

    const facebookFollowers = brandPage.followers_count ?? 0
    const instagramFollowers = brandPage.instagram_business_account?.followers_count ?? 0

    // Ad performance for the current month.
    let adSpend = 0
    let attributableRevenue = 0
    let roas = 0
    let adReach = 0
    let ctr = 0

    if (adAccountId) {
      const insightsRes = await fetch(
        `${GRAPH}/${adAccountId}/insights?fields=spend,reach,ctr,action_values,purchase_roas&date_preset=this_month&access_token=${token}`,
      )
      if (insightsRes.ok) {
        const row = ((await insightsRes.json()) as { data?: AdInsightsRow[] }).data?.[0]
        if (row) {
          adSpend = Math.round(parseFloat(row.spend ?? '0'))
          adReach = Math.round(parseFloat(row.reach ?? '0'))
          ctr = Math.round(parseFloat(row.ctr ?? '0') * 100) / 100
          const purchase = row.action_values?.find(a => a.action_type === 'purchase')
          attributableRevenue = purchase ? Math.round(parseFloat(purchase.value)) : 0
          const purchaseRoas = row.purchase_roas?.find(a => a.action_type === 'omni_purchase')
          roas = purchaseRoas ? Math.round(parseFloat(purchaseRoas.value) * 100) / 100 : 0
        }
      }
    }

    return {
      instagramFollowers,
      facebookFollowers,
      adSpend,
      attributableRevenue,
      roas,
      adReach,
      ctr,
    }
  } catch {
    // Network/API/parse failure — fall back to mock data rather than
    // crashing the build during static prerender.
    return null
  }
}
