import { KpiMetric } from '@/lib/types'
import { KpiCard } from './KpiCard'

interface RevenueGoals {
  gross: number
  net: number
}

interface KpiSectionProps {
  title: string
  logo?: string
  source?: string
  revenueGoals?: RevenueGoals
  metrics: KpiMetric[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function currentMonth(): string {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export function KpiSection({ title, logo, source, revenueGoals, metrics }: KpiSectionProps) {
  return (
    <section>
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#1D371E' }}>
          {title}
        </h2>

        {(logo || source) && (
          <div className="flex items-center gap-3">
            {logo && (
              <div className="rounded-2xl p-3 flex items-center justify-center" style={{ backgroundColor: '#FFFAF1', border: '1px solid #1D371E22' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={title} className="h-16 w-auto object-contain" />
              </div>
            )}

            {source && (
              <span
                className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ color: '#1D371E', backgroundColor: '#FFFAF1', border: '1px solid #1D371E22', opacity: 0.85 }}
              >
                Data from {source}
              </span>
            )}
          </div>
        )}

        {revenueGoals && (
          <p className="text-sm" style={{ color: '#1D371E', opacity: 0.65 }}>
            <span className="font-semibold" style={{ opacity: 1, color: '#1D371E' }}>{currentMonth()}</span>
            {' '}—{' '}
            Gross Revenue Goal: <span className="font-semibold" style={{ color: '#1D371E' }}>{formatCurrency(revenueGoals.gross)}</span>
            {'  ·  '}
            Net Revenue Goal: <span className="font-semibold" style={{ color: '#1D371E' }}>{formatCurrency(revenueGoals.net)}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  )
}
