import { Zone } from '@/lib/types'

const STATUS_COLOR: Record<string, string> = {
  OK:   'var(--lg-mint-deep)',
  WARN: 'var(--lg-amber)',
  HOT:  'var(--lg-rust)',
  COLD: 'var(--lg-sky)',
}

const STATUS_BG: Record<string, string> = {
  OK:   'rgba(63,127,102,0.08)',
  WARN: 'rgba(201,144,94,0.08)',
  HOT:  'rgba(181,96,75,0.08)',
  COLD: 'rgba(132,182,204,0.08)',
}

interface Metric { label: string; value: string; good?: boolean }

export default function ZoneSheetBody({ zone }: { zone: Zone }) {
  const color = STATUS_COLOR[zone.thermal_status] || STATUS_COLOR.WARN
  const bg = STATUS_BG[zone.thermal_status] || STATUS_BG.WARN
  const delta = (zone.current_temp_f - zone.setpoint_f).toFixed(1)
  const deltaSign = zone.current_temp_f >= zone.setpoint_f ? '+' : ''

  const metrics: Metric[] = [
    { label: 'Temperature', value: `${zone.current_temp_f}°F`, good: zone.thermal_status === 'OK' },
    { label: 'Setpoint',    value: `${zone.setpoint_f}°F` },
    { label: 'Delta',       value: `${deltaSign}${delta}°` },
    { label: 'Humidity',    value: `${zone.current_humidity_pct}%`,    good: zone.current_humidity_pct < 60 },
    { label: 'CO₂',         value: `${zone.current_co2_ppm} ppm`,      good: zone.current_co2_ppm < 1000 },
    { label: 'Occupancy',   value: `${zone.current_occupancy_count} people` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero temp */}
      <div
        style={{
          borderRadius: 'var(--r-card)',
          background: `linear-gradient(155deg, ${bg}, transparent)`,
          border: `1px solid ${color}30`,
          padding: '20px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="label-eyebrow">{zone.thermal_status}</div>
          <div style={{ fontSize: 52, fontWeight: 700, color, fontFamily: 'var(--font-sans)', letterSpacing: '-0.04em', lineHeight: 1 }}>
            {zone.current_temp_f}
            <span style={{ fontSize: 22, fontWeight: 400 }}>°F</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--lg-ink-55)', marginTop: 4 }}>
            Setpoint {zone.setpoint_f}°F · {deltaSign}{delta}° delta
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label-eyebrow" style={{ marginBottom: 4 }}>Comfort</div>
          <div style={{ fontSize: 32, fontWeight: 700, color, fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em' }}>
            {zone.comfort_index_pct}
          </div>
          <div style={{ fontSize: 9, color: 'var(--lg-ink-55)' }}>/ 100</div>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {metrics.map(m => (
          <div
            key={m.label}
            className="glass-soft"
            style={{ padding: '10px 12px', borderRadius: 'var(--r-control)' }}
          >
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>{m.label}</div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.02em',
              color: m.good === false ? 'var(--lg-amber)' : m.good === true ? 'var(--lg-mint-deep)' : 'var(--lg-ink-deep)',
            }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 'var(--r-card-sm)', overflow: 'hidden', border: '1px solid var(--lg-ink-08)' }}>
        {[
          { label: 'Floor',   value: `Floor ${zone.floor}` },
          { label: 'Area',    value: `${zone.area_sqm} m²` },
          { label: 'AI Opt.', value: zone.ai_optimization_active ? 'Active' : 'Off' },
        ].map((row, i) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '9px 14px',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)',
              borderBottom: i < 2 ? '1px solid var(--lg-ink-08)' : 'none',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--lg-ink-55)', fontFamily: 'var(--font-sans)' }}>{row.label}</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--lg-ink)', fontFamily: 'var(--font-sans)' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
