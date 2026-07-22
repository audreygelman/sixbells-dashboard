import { KpiMetric } from '@/lib/types'

const STATUS = {
  'on-track': { label: 'On Track', color: '#166534', bg: '#f0fdf4', bar: '#22c55e', dot: '#22c55e' },
  'close':    { label: 'Close',    color: '#92400e', bg: '#fffbeb', bar: '#f59e0b', dot: '#f59e0b' },
  'behind':   { label: 'Behind',   color: '#991b1b', bg: '#fef2f2', bar: '#ef4444', dot: '#ef4444' },
}

function formatValue(value: number, format: KpiMetric['format']): string {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
  }
  if (format === 'currency-cents') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
  }
  if (format === 'percent') return `${value}%`
  if (format === 'multiplier') return `${value}×`
  return new Intl.NumberFormat('en-US').format(value)
}

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const s = STATUS[metric.status]

  return (
    <div style={{ backgroundColor: '#FFFAF1', borderColor: '#1D371E' }} className="rounded-lg border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1D371E', opacity: 0.6 }}>
          {metric.label}
        </span>
        {!metric.display && (
          <span
            className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5"
            style={{ color: s.color, backgroundColor: s.bg }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
            {s.label}
          </span>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold tracking-tight" style={{ color: '#1D371E' }}>
          {formatValue(metric.value, metric.format)}
        </p>
        <p className="text-sm mt-1" style={{ color: '#1D371E', opacity: 0.45 }}>
          {metric.display ? 'This month' : `${metric.inverse ? 'Ceiling' : 'Goal'}: ${formatValue(metric.goal, metric.format)}`}
        </p>
      </div>

      {!metric.display && (
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#1D371E', opacity: 0.5 }}>
            <span>{metric.inverse ? 'Headroom below ceiling' : 'Progress to goal'}</span>
            <span className="font-semibold" style={{ opacity: 1, color: '#1D371E' }}>{metric.percentToGoal}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: '#EFE6CD' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${metric.percentToGoal}%`, backgroundColor: s.bar }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
