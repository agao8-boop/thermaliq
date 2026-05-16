'use client'
import { Zone } from '@/lib/types'
import { statusColor, statusBg, formatTemp } from '@/lib/utils'

interface Props {
  zones: Zone[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function FloorPlanGrid({ zones, selectedId, onSelect }: Props) {
  const floors = Array.from(new Set(zones.map(z => z.floor))).sort((a, b) => b - a)

  return (
    <div className="glass" style={{ borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
        Building Floor Plan
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {floors.map(floor => {
          const floorZones = zones.filter(z => z.floor === floor)
          return (
            <div key={floor}>
              <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>
                Floor {floor}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {floorZones.map(zone => {
                  const color = statusColor(zone.thermal_status)
                  const selected = zone.id === selectedId
                  return (
                    <div
                      key={zone.id}
                      onClick={() => onSelect(zone.id)}
                      style={{
                        flex: '1 1 110px', minWidth: 100,
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: `${selected ? '1.5px' : '1px'} solid ${selected ? color : 'rgba(255,255,255,0.80)'}`,
                        background: selected ? `${statusBg(zone.thermal_status)}` : 'rgba(255,255,255,0.55)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: selected ? `0 2px 12px ${color}22` : '0 1px 6px rgba(50,90,70,0.05)',
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginBottom: 6 }} />
                      <div style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4 }}>{zone.name}</div>
                      <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 13, color, lineHeight: 1 }}>{formatTemp(zone.current_temp_f)}</div>
                      <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{zone.comfort_index_pct}% comfort</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(26,43,34,0.08)' }}>
        {[
          { label: 'OK', color: 'var(--ok)' },
          { label: 'WARN', color: 'var(--warn)' },
          { label: 'HOT', color: 'var(--hot)' },
          { label: 'COLD', color: 'var(--cold)' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
