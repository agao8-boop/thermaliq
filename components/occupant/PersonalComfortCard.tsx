'use client'
import { Zone } from '@/lib/types'
import { statusColor } from '@/lib/utils'

interface Props { zone: Zone }

function comfortLabel(pct: number) {
  if (pct >= 85) return { text: 'Very Comfortable', emoji: '😊' }
  if (pct >= 70) return { text: 'Comfortable', emoji: '🙂' }
  if (pct >= 55) return { text: 'Slightly Uncomfortable', emoji: '😐' }
  return { text: 'Uncomfortable', emoji: '😓' }
}

export default function PersonalComfortCard({ zone }: Props) {
  const color = statusColor(zone.thermal_status)
  const { text: comfortText, emoji } = comfortLabel(zone.comfort_index_pct)
  const delta = zone.current_temp_f - zone.setpoint_f

  return (
    <div
      className="glass"
      style={{ borderRadius: 20, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {/* Zone label */}
      <div>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>
          Your Zone
        </div>
        <div style={{ fontSize: 22, fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--text)', marginTop: 2 }}>
          {zone.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Floor {zone.floor} · {zone.area_sqm} m²</div>
      </div>

      {/* Big temp display */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
        <div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 4 }}>
            Current Temperature
          </div>
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 52, lineHeight: 1, color, fontWeight: 300 }}>
            {zone.current_temp_f.toFixed(1)}
            <span style={{ fontSize: 22 }}>°F</span>
          </div>
          {delta !== 0 && (
            <div style={{ fontSize: 11, color: delta > 0 ? 'var(--amber)' : 'var(--teal)', marginTop: 4 }}>
              {delta > 0 ? `${delta.toFixed(1)}° above` : `${Math.abs(delta).toFixed(1)}° below`} target
            </div>
          )}
        </div>

        {/* Comfort gauge */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: 40 }}>{emoji}</div>
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginTop: 4 }}>{comfortText}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Comfort index: {zone.comfort_index_pct}%</div>
        </div>
      </div>

      {/* Comfort progress bar */}
      <div>
        <div style={{ height: 6, background: 'rgba(26,43,34,0.10)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${zone.comfort_index_pct}%`,
              background: zone.comfort_index_pct >= 80
                ? 'linear-gradient(90deg, #7BAE7F, #2E7D5A)'
                : zone.comfort_index_pct >= 60
                  ? 'linear-gradient(90deg, #C9B49A, #B87C4A)'
                  : 'linear-gradient(90deg, #e8a090, #C45A4A)',
              borderRadius: 3,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Humidity', value: `${zone.current_humidity_pct}%`, ok: zone.current_humidity_pct >= 40 && zone.current_humidity_pct <= 60 },
          { label: 'CO₂', value: `${zone.current_co2_ppm} ppm`, ok: zone.current_co2_ppm < 900 },
          { label: 'Occupancy', value: `${zone.current_occupancy_count} people`, ok: true },
        ].map(m => (
          <div
            key={m.label}
            style={{
              background: 'rgba(255,255,255,0.55)',
              borderRadius: 12,
              padding: '10px 14px',
              border: '1px solid rgba(255,255,255,0.85)',
            }}
          >
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 3 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 15, color: m.ok ? 'var(--text)' : 'var(--amber)' }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback buttons */}
      <div>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 8 }}>
          How do you feel?
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: '🥶 Too Cold', action: 'cold' },
            { label: '😊 Comfortable', action: 'ok' },
            { label: '🥵 Too Warm', action: 'hot' },
          ].map(btn => (
            <button
              key={btn.action}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 12,
                border: '1.5px solid rgba(26,43,34,0.12)',
                background: 'rgba(255,255,255,0.55)',
                fontSize: 12,
                color: 'var(--text)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(46,125,90,0.08)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,43,34,0.12)'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.55)'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
