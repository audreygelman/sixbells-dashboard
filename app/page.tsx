import { getMockData } from '@/lib/mock-data'
import { getShopifyEcommerce } from '@/lib/shopify'
import { getKlaviyoEmail } from '@/lib/klaviyo'
import { computeKpis } from '@/lib/kpis'
import { KpiSection } from '@/components/KpiSection'
import { GOALS } from '@/config/goals'

export const revalidate = 3600

export default async function Dashboard() {
  const data = getMockData()
  const [shopify, klaviyo] = await Promise.all([
    getShopifyEcommerce(),
    getKlaviyoEmail(),
  ])
  if (shopify) {
    data.ecommerce = shopify
  }
  if (klaviyo) {
    data.email = klaviyo
  }
  const kpis = computeKpis(data)
  const lastUpdated = new Date(data.lastUpdated).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3ECD9' }}>
      <header style={{ backgroundColor: '#1D371E' }} className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold tracking-wide" style={{ color: '#F3ECD9' }}>
              The Six Bells
            </h1>
            <p className="text-xs" style={{ color: '#F3ECD9', opacity: 0.6 }}>Performance Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#F3ECD9', opacity: 0.5 }}>Last updated</p>
            <p className="text-xs font-medium" style={{ color: '#F3ECD9', opacity: 0.8 }}>{lastUpdated}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-10">
        <KpiSection title="Ecommerce" logo="/logo-shop.png" revenueGoals={{ gross: GOALS.shopifyGrossRevenue, net: GOALS.shopifyNetRevenue }} metrics={kpis.ecommerce} />
        <KpiSection title="Email — Klaviyo" metrics={kpis.email} />

        {/*
          Hidden until real reporting is connected — currently mock data only.
          Re-enable each section as its integration goes live:
            - Hotel        → MEWS
            - Restaurant   → Toast
            - Marketing    → Meta / Instagram
        <KpiSection title="Hotel" logo="/logo-hotel.png" revenueGoals={{ gross: GOALS.hotelGrossRevenue, net: GOALS.hotelNetRevenue }} metrics={kpis.hotel} />
        <KpiSection title="Restaurant" logo="/logo-restaurant.png" revenueGoals={{ gross: GOALS.restaurantGrossRevenue, net: GOALS.restaurantNetRevenue }} metrics={kpis.restaurant} />
        <KpiSection title="Marketing & Social" logo="/logo-shop.png" metrics={kpis.social} />
        */}
      </main>

      <footer className="max-w-7xl mx-auto px-6 pb-8 text-center text-xs" style={{ color: '#1D371E', opacity: 0.4 }}>
        Refreshes automatically every hour
      </footer>
    </div>
  )
}
