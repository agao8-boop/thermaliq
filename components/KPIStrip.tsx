import { KPI } from '@/lib/mock-data'

const STATUS_COLOR = {
  good: 'var(--lg-mint-deep)',
  warn: 'var(--lg-amber)',
  neutral: 'var(--lg-ink)',
}

export default function KPIStrip() {
  const k = KPI
  const cells = [
    {
      label: 'Comfort Events',
      value: String(k.comfort_events_today),
      sub: `${k.comfort_events_7d_avg.toFixed(1)} avg / 7d`,
      color: k.comfort_events_today <= k.comfort_events_7d_avg ? STATUS_COLOR.good : STATUS_COLOR.warn,
    },
    {
      label: 'AI Intercepts',
      value: String(k.proactive_interceptions),
      sub: 'proactive today',
      color: STATUS_COLOR.good,
    },
    {
      label: 'Passive Credit',
      value: `${k.passive_credit_kwh.toFixed(1)}`,
      unit: 'kWh',
      sub: 'avoided active load',
      color: STATUS_COLOR.good,
    },
    {
      label: 'Carbon / m²',
      value: k.carbon_avoided_kg_m2.toFixed(4),
      unit: 'kg',
      sub: `target ${k.carbon_target_kg_m2.toFixed(3)}`,
      color: k.carbon_avoided_kg_m2 >= k.carbon_target_kg_m2 ? STATUS_COLOR.good : STATUS_COLOR.warn,
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '10px 24px',
        flexShrink: 0,
        borderBottom: '1px solid var(--lg-ink-08)',
        background: 'rgba(255,255,255,0.25)',
      }}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.70)',
            border: '1px solid var(--lg-stroke)',
            borderRadius: 'var(--r-control)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset',
            minWidth: 110,
          }}
        >
          <div className="label-eyebrow" style={{ marginBottom: 2 }}>
            {c.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span
              className="num-display"
              style={{ fontSize: 22, lineHeight: 1, color: c.color }}
            >
              {c.value}
            </span>
            {'unit' in c && (
              <span style={{ fontSize: 10, color: 'var(--lg-ink-55)', fontFamily: 'var(--font-sans)' }}>
                {c.unit}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: 'var(--lg-ink-35)', fontFamily: 'var(--font-sans)' }}>
            {c.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
