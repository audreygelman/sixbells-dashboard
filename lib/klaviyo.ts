// ─────────────────────────────────────────────────────────────
// Klaviyo — email marketing performance (open rate, click rate,
// attributed revenue) for the current month.
//
// Uses the Klaviyo Reporting API. Open/click rate come from the
// Campaign (broadcast) Values Report; revenue sums campaigns AND
// flows (automated emails) for total email-attributed revenue:
//   https://developers.klaviyo.com/en/reference/query_campaign_values
//   https://developers.klaviyo.com/en/reference/query_flow_values
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

interface ValuesReportResponse {
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

// Fetch a Reporting API values report (campaign or flow) for this month
// and return the per-grouping result rows.
async function fetchValuesReport(
  key: string,
  reportType: 'campaign' | 'flow',
  statistics: string[],
  conversionMetricId: string,
): Promise<MetricValuesResult[]> {
  const res = await fetch(`${KLAVIYO_BASE}/${reportType}-values-reports/`, {
    method: 'POST',
    headers: klaviyoHeaders(key),
    body: JSON.stringify({
      data: {
        type: `${reportType}-values-report`,
        attributes: {
          timeframe: { key: 'this_month' },
          statistics,
          conversion_metric_id: conversionMetricId,
        },
      },
    }),
  })

  if (!res.ok) return []

  const { data } = (await res.json()) as ValuesReportResponse
  return data?.attributes?.results ?? []
}

function sumRevenue(results: MetricValuesResult[]): number {
  return results.reduce((sum, r) => sum + (r.statistics.conversion_value ?? 0), 0)
}

export async function getKlaviyoEmail() {
  const key = process.env.KLAVIYO_API_KEY?.trim()
  if (!key) return null

  try {
    const conversionMetricId = await getConversionMetricId(key)
    if (!conversionMetricId) return null

    // Open/click rate come from campaigns; revenue sums campaigns + flows.
    const [campaigns, flows] = await Promise.all([
      fetchValuesReport(key, 'campaign', ['open_rate', 'click_rate', 'conversion_value', 'recipients'], conversionMetricId),
      fetchValuesReport(key, 'flow', ['conversion_value'], conversionMetricId),
    ])

    if (!campaigns.length) return null

    // Aggregate across campaigns: weight the rates by recipient count so a
    // big send counts more than a tiny one.
    let recipients = 0
    let openWeighted = 0
    let clickWeighted = 0

    for (const r of campaigns) {
      const s = r.statistics
      const n = s.recipients ?? 0
      recipients += n
      openWeighted += (s.open_rate ?? 0) * n
      clickWeighted += (s.click_rate ?? 0) * n
    }

    const openRate = recipients > 0 ? (openWeighted / recipients) * 100 : 0
    const clickRate = recipients > 0 ? (clickWeighted / recipients) * 100 : 0
    const revenue = sumRevenue(campaigns) + sumRevenue(flows)

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
