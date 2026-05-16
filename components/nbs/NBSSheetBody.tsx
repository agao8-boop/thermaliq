import { NBSAsset } from '@/lib/types'

const TYPE_LABEL: Record<string, string> = {
  GREEN_ROOF:       'Green Roof',
  ATRIUM_CANOPY:    'Atrium Canopy',
  GROUND_VEGETATION:'Ground Veg.',
  LIVING_WALL:      'Living Wall',
  RAIN_GARDEN:      'Rain Garden',
  OTHER:            'Other',
}

function MoistureBar({ pct }: { pct: number }) {
  const color = pct < 35 ? 'var(--lg-amber)' : pct > 75 ? 'var(--lg-sky)' : 'var(--lg-mint-deep)'
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(36,51,51,0.10)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 9, color: 'var(--lg-ink-35)' }}>0%</span>
        <span style={{ fontSize: 9, fontWeight: 600, color }}>{pct}%</span>
        <span style={{ fontSize: 9, color: 'var(--lg-ink-35)' }}>100%</span>
      </div>
    </div>
  )
}

export default function NBSSheetBody({ asset }: { asset: NBSAsset }) {
  const lowMoisture = asset.current_soil_moisture_pct < 35
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero */}
      <div
        style={{
          borderRadius: 'var(--r-card)',
          background: lowMoisture
            ? 'linear-gradient(155deg, rgba(201,144,94,0.10), transparent)'
            : 'linear-gradient(155deg, rgba(63,127,102,0.08), transparent)',
          border: `1px solid ${lowMoisture ? 'rgba(201,144,94,0.25)' : 'rgba(63,127,102,0.20)'}`,
          padding: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {lowMoisture && (
            <span style={{
              padding: '2px 8px',
              borderRadius: 'var(--r-pill)',
              background: 'rgba(201,144,94,0.15)',
              border: '1px solid rgba(201,144,94,0.30)',
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--lg-amber)',
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
            }}>
              ⚠ Low Moisture
            </span>
          )}
          <span style={{
            padding: '2px 8px',
            borderRadius: 'var(--r-pill)',
            background: 'rgba(255,255,255,0.60)',
            border: '1px solid var(--lg-ink-08)',
            fontSize: 9,
            color: 'var(--lg-ink-55)',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
          }}>
            {TYPE_LABEL[asset.asset_type] || asset.asset_type}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 12 }}>
          {asset.name}
        </div>
        <div className="label-eyebrow" style={{ marginBottom: 4 }}>Soil moisture</div>
        <MoistureBar pct={asset.current_soil_moisture_pct} />
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Surface Temp', value: `${asset.current_surface_temp_c}°C` },
          { label: 'Cooling Credit', value: `${asset.evap_cooling_credit_kw} kW` },
          { label: 'Area', value: `${asset.area_sqm} m²` },
          { label: 'Irrigation', value: asset.irrigation_connected ? (asset.irrigation_auto ? 'Auto' : 'Manual') : 'None' },
        ].map(m => (
          <div
            key={m.label}
            className="glass-soft"
            style={{ padding: '10px 12px', borderRadius: 'var(--r-control)' }}
          >
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Active months */}
      <div>
        <div className="label-eyebrow" style={{ marginBottom: 8 }}>Active months</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
          {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => {
            const active = asset.seasonal_active_months.includes(i + 1)
            return (
              <div
                key={i}
                style={{
                  width: 22, height: 22,
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 600,
                  background: active ? 'rgba(63,127,102,0.18)' : 'rgba(36,51,51,0.05)',
                  color: active ? 'var(--lg-mint-deep)' : 'var(--lg-ink-35)',
                  border: active ? '1px solid rgba(63,127,102,0.30)' : '1px solid transparent',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {m}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
