// ─────────────────────────────────────────────────────────────
// Klaviyo — email marketing performance (open rate, click rate,
// attributed revenue) for the current month.
//
// Uses the Klaviyo Reporting API (Campaign Values Report), which
// returns aggregate rates and conversion value directly:
//   https://developers.klaviyo.com/en/reference/query_campaign_values
//
// Auth: private API key via the `Authorization: Klaviyo-API-Key`
// header. Set KLAVIYO_API_KEY in the environment.
// ─────────────────────────────────────────────────────────────

const KLAVIYO_BASE = 'https://a.klaviyo.com/api'
const KLAVIYO_REVISION = '2024-10-15'

interface MetricValuesResult {
  groupings?: Record<string, string>
  statistics: Record<string, number>
}

interface CampaignValuesResponse {
  data?: { attributes?: { results?: MetricValuesResult[] } }
}

interface MetricsResponse {
  data?: Array<{ id: string; attributes?: { name?: string } }>
}

function klaviyoHeaders(key: string) {
  return {
    Authorization: `Klaviyo-API-Key ${key}`,
    accept: 'application/vnd.api+json',
    'content-type': 'application/vnd.api+json',
    revision: KLAVIYO_REVISION,
  }
}

// The Campaign Values Report requires a conversion metric. For an
// ecommerce store that's "Placed Order"; fall back to the first
// available metric so the report still returns rate statistics.
async function getConversionMetricId(key: string): Promise<string | null> {
  const res = await fetch(`${KLAVIYO_BASE}/metrics/`, { headers: klaviyoHeaders(key) })
  if (!res.ok) return null

  const { data } = (await res.json()) as MetricsResponse
  if (!data?.length) return null

  const placedOrder = data.find(m => m.attributes?.name === 'Placed Order')
  return (placedOrder ?? data[0]).id
}

export async function getKlaviyoEmail() {
  const key = process.env.KLAVIYO_API_KEY?.trim()
  if (!key) return null

  try {
    const conversionMetricId = await getConversionMetricId(key)
    if (!conversionMetricId) return null

    const res = await fetch(`${KLAVIYO_BASE}/campaign-values-reports/`, {
      method: 'POST',
      headers: klaviyoHeaders(key),
      body: JSON.stringify({
        data: {
          type: 'campaign-values-report',
          attributes: {
            timeframe: { key: 'this_month' },
            statistics: ['open_rate', 'click_rate', 'conversion_value', 'recipients'],
            conversion_metric_id: conversionMetricId,
          },
        },
      }),
    })

    if (!res.ok) return null

    const { data } = (await res.json()) as CampaignValuesResponse
    const results = data?.attributes?.results ?? []
    if (!results.length) return null

    // Aggregate across campaigns: sum revenue, and weight the rates by
    // recipient count so a big send counts more than a tiny one.
    let revenue = 0
    let recipients = 0
    let openWeighted = 0
    let clickWeighted = 0

    for (const r of results) {
      const s = r.statistics
      const n = s.recipients ?? 0
      revenue += s.conversion_value ?? 0
      recipients += n
      openWeighted += (s.open_rate ?? 0) * n
      clickWeighted += (s.click_rate ?? 0) * n
    }

    const openRate = recipients > 0 ? (openWeighted / recipients) * 100 : 0
    const clickRate = recipients > 0 ? (clickWeighted / recipients) * 100 : 0

    return {
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
      revenue: Math.round(revenue),
    }
  } catch {
    // Network/API/parse failure — fall back to mock data rather than
    // crashing the build during static prerender.
    return null
  }
}
