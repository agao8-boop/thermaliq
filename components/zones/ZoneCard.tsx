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
      style={{
        border: `1px solid ${selected ? color : 'var(--rule)'}`,
        borderRadius: 6,
        padding: '14px 16px',
        background: selected ? bg : 'var(--surface)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {/* Zone name + floor */}
      <div className="flex items-start justify-between" style={{ marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>
            {zone.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
            Floor {zone.floor} · {zone.area_sqm} m²
          </div>
        </div>
        <div
          style={{
            fontSize: 9,
            padding: '2px 7px',
            borderRadius: 3,
            border: `1px solid ${color}`,
            color,
            letterSpacing: '0.08em',
            fontFamily: 'Azeret Mono, monospace',
          }}
        >
          {zone.thermal_status}
        </div>
      </div>

      {/* Temp + Comfort */}
      <div className="flex items-end justify-between">
        <div>
          <div
            style={{
              fontFamily: 'Azeret Mono, Courier New, monospace',
              fontSize: 22,
              lineHeight: 1,
              color,
              marginBottom: 2,
            }}
          >
            {formatTemp(zone.current_temp_f)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
            SP {formatTemp(zone.setpoint_f)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Comfort</div>
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 16, color: zone.comfort_index_pct >= 80 ? 'var(--accent)' : zone.comfort_index_pct >= 60 ? 'var(--amber)' : '#ff5c5c' }}>
            {zone.comfort_index_pct}%
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex gap-3" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--rule)' }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>RH</div>
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 11, color: 'var(--text)' }}>
            {zone.current_humidity_pct}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CO₂</div>
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 11, color: zone.current_co2_ppm > 900 ? 'var(--amber)' : 'var(--text)' }}>
            {zone.current_co2_ppm}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Occ</div>
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 11, color: 'var(--text)' }}>
            {zone.current_occupancy_count}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI</div>
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 11, color: zone.ai_optimization_active ? 'var(--accent)' : 'var(--muted)' }}>
            {zone.ai_optimization_active ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>
    </div>
  )
}
