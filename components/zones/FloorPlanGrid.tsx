'use client'
import { Zone } from '@/lib/types'
import { statusColor, statusBg, formatTemp } from '@/lib/utils'

interface Props {
  zones: Zone[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function FloorPlanGrid({ zones, selectedId, onSelect }: Props) {
  // Group by floor
  const floors = Array.from(new Set(zones.map(z => z.floor))).sort((a, b) => b - a)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--rule)',
        borderRadius: 6,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        Building Floor Plan
      </div>

      <div className="flex flex-col gap-4">
        {floors.map(floor => {
          const floorZones = zones.filter(z => z.floor === floor)
          return (
            <div key={floor}>
              <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Floor {floor}
              </div>
              <div className="flex gap-2 flex-wrap">
                {floorZones.map(zone => {
                  const color = statusColor(zone.thermal_status)
                  const bg = statusBg(zone.thermal_status)
                  const selected = zone.id === selectedId
                  return (
                    <div
                      key={zone.id}
                      onClick={() => onSelect(zone.id)}
                      style={{
                        flex: '1 1 120px',
                        minWidth: 110,
                        padding: '10px 12px',
                        borderRadius: 4,
                        border: `1px solid ${selected ? color : 'rgba(220,238,226,0.12)'}`,
                        background: selected ? bg : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                    >
                      {/* Status dot */}
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: color,
                          marginBottom: 6,
                        }}
                      />
                      <div style={{ fontSize: 10, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4 }}>
                        {zone.name}
                      </div>
                      <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 14, color, lineHeight: 1 }}>
                        {formatTemp(zone.current_temp_f)}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>
                        {zone.comfort_index_pct}% comfort
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
        {[
          { label: 'OK', color: '#2eff96' },
          { label: 'WARN', color: '#f0b840' },
          { label: 'HOT', color: '#ff5c5c' },
          { label: 'COLD', color: '#3ecfcf' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
