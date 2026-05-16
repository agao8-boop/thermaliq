'use client'
import { Zone } from '@/lib/types'
import { statusColor, statusBg, formatTemp } from '@/lib/utils'

interface Props {
  zone: Zone
  selected: boolean
  onClick: () => void
}

export default function ZoneCard({ zone, selected, onClick }: Props) {
  const color = statusColor(zone.thermal_status)
  const bg = statusBg(zone.thermal_status)

  return (
    <div
      onClick={onClick}
      className="glass"
      style={{
        borderRadius: 16,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        border: selected ? `1.5px solid ${color}` : '1px solid rgba(255,255,255,0.85)',
        background: selected ? `${bg}` : 'rgba(255,255,255,0.58)',
        boxShadow: selected ? `0 4px 20px ${color}28` : '0 2px 14px rgba(50,90,70,0.07)',
      }}
    >
      {/* Zone name + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>
            {zone.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
            Floor {zone.floor} · {zone.area_sqm} m²
          </div>
        </div>
        <div style={{
          fontSize: 9, padding: '2px 8px', borderRadius: 10,
          border: `1px solid ${color}`,
          color, letterSpacing: '0.06em',
          fontFamily: 'Azeret Mono, monospace',
          background: `${color}14`,
        }}>
          {zone.thermal_status}
        </div>
      </div>

      {/* Temp + comfort */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 24, lineHeight: 1, color, marginBottom: 2 }}>
            {formatTemp(zone.current_temp_f)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>SP {formatTemp(zone.setpoint_f)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>Comfort</div>
          <div style={{
            fontFamily: 'Azeret Mono, monospace', fontSize: 18,
            color: zone.comfort_index_pct >= 80 ? 'var(--ok)' : zone.comfort_index_pct >= 60 ? 'var(--warn)' : 'var(--hot)',
          }}>
            {zone.comfort_index_pct}%
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(26,43,34,0.08)' }}>
        {[
          { label: 'RH', value: `${zone.current_humidity_pct}%`, warn: false },
          { label: 'CO₂', value: String(zone.current_co2_ppm), warn: zone.current_co2_ppm > 900 },
          { label: 'Occ', value: String(zone.current_occupancy_count), warn: false },
        ].map(m => (
          <div key={m.label}>
            <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 11, color: m.warn ? 'var(--warn)' : 'var(--text)' }}>{m.value}</div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI</div>
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 11, color: zone.ai_optimization_active ? 'var(--ok)' : 'var(--muted)' }}>
            {zone.ai_optimization_active ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>
    </div>
  )
}
