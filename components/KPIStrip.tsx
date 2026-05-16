import { KPI } from '@/lib/mock-data'

export default function KPIStrip() {
  const k = KPI
  const cells = [
    {
      label: 'Comfort Events Today',
      value: String(k.comfort_events_today),
      sub: `vs. ${k.comfort_events_7d_avg.toFixed(1)} / 7-day avg`,
      good: k.comfort_events_today < k.comfort_events_7d_avg,
    },
    {
      label: 'AI Proactive Intercepts',
      value: String(k.proactive_interceptions),
      sub: 'auto-adjustments made today',
      good: true,
    },
    {
      label: 'Passive Credit Today',
      value: `${k.passive_credit_kwh.toFixed(1)} kWh`,
      sub: 'avoided active HVAC load',
      good: true,
    },
    {
      label: 'Carbon Avoided (kg/m²)',
      value: k.carbon_avoided_kg_m2.toFixed(4),
      sub: `target ${k.carbon_target_kg_m2.toFixed(4)} kg/m²`,
      good: k.carbon_avoided_kg_m2 >= k.carbon_target_kg_m2,
    },
  ]

  return (
    <div
      className="grid grid-cols-4 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--rule)' }}
    >
      {cells.map((c, i) => (
        <div
          key={i}
          className="px-6 py-3"
          style={{ borderRight: i < 3 ? '1px solid var(--rule)' : undefined }}
        >
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: 4 }}>
            {c.label}
          </div>
          <div
            style={{
              fontFamily: 'Azeret Mono, Courier New, monospace',
              fontSize: 20,
              lineHeight: 1,
              marginBottom: 3,
              color: c.good ? 'var(--accent)' : 'var(--amber)',
            }}
          >
            {c.value}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
