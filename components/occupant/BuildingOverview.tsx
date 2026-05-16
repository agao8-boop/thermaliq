import { ZONES, CARBON_LOG, KPI } from '@/lib/mock-data'

export default function BuildingOverview() {
  const okZones = ZONES.filter(z => z.thermal_status === 'OK').length
  const avgComfort = Math.round(ZONES.reduce((s, z) => s + z.comfort_index_pct, 0) / ZONES.length)

  return (
    <div
      className="glass"
      style={{ borderRadius: 20, padding: '24px 26px' }}
    >
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>
        Building Overview
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Zones Comfortable', value: `${okZones} / ${ZONES.length}`, color: okZones === ZONES.length ? 'var(--accent)' : 'var(--amber)', icon: '🏢' },
          { label: 'Avg Comfort', value: `${avgComfort}%`, color: avgComfort >= 80 ? 'var(--accent)' : 'var(--amber)', icon: '😊' },
          { label: 'Carbon Avoided', value: `${CARBON_LOG.carbon_avoided_kgco2e.toFixed(1)} kg`, color: 'var(--teal)', icon: '🌿' },
          { label: 'AI Intercepts', value: `${KPI.proactive_interceptions} today`, color: 'var(--accent)', icon: '🤖' },
        ].map(item => (
          <div
            key={item.label}
            style={{
              background: 'rgba(255,255,255,0.55)',
              borderRadius: 14,
              padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.85)',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 16, color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Zone status list */}
      <div style={{ borderTop: '1px solid rgba(26,43,34,0.08)', paddingTop: 14 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 10 }}>
          All Zones
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ZONES.map(z => {
            const statusColors: Record<string, string> = {
              OK: 'var(--ok)', WARN: 'var(--warn)', HOT: 'var(--hot)', COLD: 'var(--cold)'
            }
            const c = statusColors[z.thermal_status] ?? 'var(--muted)'
            return (
              <div
                key={z.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(26,43,34,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text)' }}>{z.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>Fl.{z.floor}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 12, color: c }}>
                    {z.current_temp_f.toFixed(1)}°F
                  </span>
                  <span style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 9, color: c, padding: '1px 6px', borderRadius: 4, border: `1px solid ${c}`, opacity: 0.85 }}>
                    {z.thermal_status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
