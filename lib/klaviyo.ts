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

interface MetricAggregateResponse {
  data?: { attributes?: { data?: Array<{ measurements?: { count?: number[] } }> } }
}

interface MetricIds {
  conversionMetricId: string | null
  subscribedMetricId: string | null
}

function klaviyoHeaders(key: string) {
  return {
    Authorization: `Klaviyo-API-Key ${key}`,
    accept: 'application/vnd.api+json',
    'content-type': 'application/vnd.api+json',
    revision: KLAVIYO_REVISION,
  }
}

// Look up the metric IDs we need. The Campaign Values Report requires a
// conversion metric ("Placed Order" for an ecommerce store; fall back to
// the first metric). "Subscribed to Email Marketing" drives New Subscribers.
async function getMetricIds(key: string): Promise<MetricIds> {
  const res = await fetch(`${KLAVIYO_BASE}/metrics/`, { headers: klaviyoHeaders(key) })
  if (!res.ok) return { conversionMetricId: null, subscribedMetricId: null }

  const { data } = (await res.json()) as MetricsResponse
  if (!data?.length) return { conversionMetricId: null, subscribedMetricId: null }

  const placedOrder = data.find(m => m.attributes?.name === 'Placed Order')
  const subscribed = data.find(m => m.attributes?.name === 'Subscribed to Email Marketing')
  return {
    conversionMetricId: (placedOrder ?? data[0]).id,
    subscribedMetricId: subscribed?.id ?? null,
  }
}

// New email subscribers this month, via the Metric Aggregates API. Klaviyo
// buckets by the account's month boundaries; we take the most recent bucket
// (the current month) to avoid a sliver bleeding in from the prior month.
async function getNewSubscribers(key: string, subscribedMetricId: string | null): Promise<number> {
  if (!subscribedMetricId) return 0

  const now = new Date()
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01T00:00:00`
  const start = iso(new Date(now.getFullYear(), now.getMonth(), 1))
  const end = iso(new Date(now.getFullYear(), now.getMonth() + 1, 1))

  const res = await fetch(`${KLAVIYO_BASE}/metric-aggregates/`, {
    method: 'POST',
    headers: klaviyoHeaders(key),
    body: JSON.stringify({
      data: {
        type: 'metric-aggregate',
        attributes: {
          metric_id: subscribedMetricId,
          measurements: ['count'],
          interval: 'month',
          timezone: 'America/New_York',
          filter: [`greater-or-equal(datetime,${start})`, `less-than(datetime,${end})`],
        },
      },
    }),
  })

  if (!res.ok) return 0

  const { data } = (await res.json()) as MetricAggregateResponse
  const counts = data?.attributes?.data?.[0]?.measurements?.count ?? []
  return counts.length ? Math.round(counts[counts.length - 1]) : 0
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

const round1 = (n: number) => Math.round(n * 10) / 10

export async function getKlaviyoEmail() {
  const key = process.env.KLAVIYO_API_KEY?.trim()
  if (!key) return null

  try {
    const { conversionMetricId, subscribedMetricId } = await getMetricIds(key)
    if (!conversionMetricId) return null

    // Rates come from campaigns (broadcasts); revenue, recipients and
    // unsubscribes sum campaigns + flows. New subscribers is a separate call.
    const [campaigns, flows, newSubscribers] = await Promise.all([
      fetchValuesReport(key, 'campaign', ['open_rate', 'click_rate', 'conversion_rate', 'conversion_value', 'recipients', 'unsubscribes'], conversionMetricId),
      fetchValuesReport(key, 'flow', ['conversion_value', 'recipients', 'unsubscribes'], conversionMetricId),
      getNewSubscribers(key, subscribedMetricId),
    ])

    if (!campaigns.length) return null

    // Aggregate across campaigns: weight the rates by recipient count so a
    // big send counts more than a tiny one; count distinct campaigns sent.
    let recipients = 0
    let openWeighted = 0
    let clickWeighted = 0
    let conversionWeighted = 0
    let campaignUnsubscribes = 0
    const campaignIds = new Set<string>()

    for (const r of campaigns) {
      const s = r.statistics
      const n = s.recipients ?? 0
      recipients += n
      openWeighted += (s.open_rate ?? 0) * n
      clickWeighted += (s.click_rate ?? 0) * n
      conversionWeighted += (s.conversion_rate ?? 0) * n
      campaignUnsubscribes += s.unsubscribes ?? 0
      const id = r.groupings?.campaign_id
      if (id) campaignIds.add(id)
    }

    let flowRecipients = 0
    let flowUnsubscribes = 0
    for (const r of flows) {
      flowRecipients += r.statistics.recipients ?? 0
      flowUnsubscribes += r.statistics.unsubscribes ?? 0
    }

    const revenue = sumRevenue(campaigns) + sumRevenue(flows)
    const totalRecipients = recipients + flowRecipients

    const openRate = recipients > 0 ? (openWeighted / recipients) * 100 : 0
    const clickRate = recipients > 0 ? (clickWeighted / recipients) * 100 : 0
    const conversionRate = recipients > 0 ? (conversionWeighted / recipients) * 100 : 0
    const revenuePerRecipient = totalRecipients > 0 ? revenue / totalRecipients : 0

    return {
      openRate: round1(openRate),
      clickRate: round1(clickRate),
      revenue: Math.round(revenue),
      conversionRate: Math.round(conversionRate * 100) / 100,
      revenuePerRecipient: Math.round(revenuePerRecipient * 100) / 100,
      campaignsSent: campaignIds.size,
      newSubscribers,
      unsubscribes: campaignUnsubscribes + flowUnsubscribes,
    }
  } catch {
    // Network/API/parse failure — fall back to mock data rather than
    // crashing the build during static prerender.
    return null
  }
}
