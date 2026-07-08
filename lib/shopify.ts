interface ShopifyOrder {
  total_price: string
  financial_status: string
}

export async function getShopifyEcommerce() {
  const shop = process.env.SHOPIFY_STORE?.trim()
  const token = process.env.SHOPIFY_ACCESS_TOKEN?.trim()

  if (!shop || !token) return null

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  try {
    const res = await fetch(
      `https://${shop}/admin/api/2025-01/orders.json?status=any&created_at_min=${startOfMonth}&limit=250&fields=total_price,financial_status`,
      { headers: { 'X-Shopify-Access-Token': token } }
    )

    if (!res.ok) return null

    const { orders } = await res.json() as { orders: ShopifyOrder[] }

    const paid = orders.filter(o =>
      o.financial_status === 'paid' || o.financial_status === 'partially_paid'
    )
    const revenue = paid.reduce((sum, o) => sum + parseFloat(o.total_price), 0)
    const orderCount = paid.length
    const aov = orderCount > 0 ? revenue / orderCount : 0

    return {
      revenue: Math.round(revenue),
      orders: orderCount,
      aov: Math.round(aov),
    }
  } catch {
    // Network/URL/parse failure — fall back to mock data rather than
    // crashing the build during static prerender.
    return null
  }
}
