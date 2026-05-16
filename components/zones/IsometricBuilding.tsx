'use client'
import { Zone } from '@/lib/types'

// ── Projection constants (from Living Glass handoff) ──────────────────────────
const W = 460, H = 320
const cx = W / 2          // 230
const baseY = H * 0.78    // 249.6
const fW = 260             // floor width in screen px
const fD = 110             // floor depth in screen px
const floorHeight = 36     // px per floor level

// Project a normalised floor-plan point (xf,yf ∈ [0,1]) at floor index zf to screen
function proj(xf: number, yf: number, zf: number): [number, number] {
  const sx = cx + (xf - 0.5) * fW + (yf - 0.5) * fD * 0.45
  const sy = baseY - zf * floorHeight - (yf - 0.5) * fD * 0.42
  return [sx, sy]
}

// Status colour map (Living Glass tokens)
const STATUS_FILL: Record<string, string> = {
  OK:   'rgba(63,127,102,',
  WARN: 'rgba(201,144,94,',
  HOT:  'rgba(181,96,75,',
  COLD: 'rgba(132,182,204,',
}
const STATUS_STROKE: Record<string, string> = {
  OK:   '#3F7F66',
  WARN: '#C9905E',
  HOT:  '#B5604B',
  COLD: '#84B6CC',
}

interface Props {
  zones: Zone[]
  selectedId: string
  onSelect: (id: string) => void
}

export default function IsometricBuilding({ zones, selectedId, onSelect }: Props) {
  // Unique floor levels, sorted ascending
  const floorLevels = [...new Set(zones.map(z => z.floor))].sort((a, b) => a - b)

  // Highest delta zone for annotation
  const annotationZone = [...zones].sort(
    (a, b) => Math.abs(b.current_temp_f - b.setpoint_f) - Math.abs(a.current_temp_f - a.setpoint_f)
  )[0]

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        aria-label="Isometric building floor plan"
      >
        {/* ── Floor slabs ────────────────────────────────────────────────────── */}
        {floorLevels.map((floor, fi) => {
          const z = fi
          // 4 corners of the floor slab (normalised 0→1)
          const tl = proj(0, 0, z)
          const tr = proj(1, 0, z)
          const br = proj(1, 1, z)
          const bl = proj(0, 1, z)
          const pts = [tl, tr, br, bl].map(p => p.join(',')).join(' ')
          return (
            <polygon
              key={floor}
              points={pts}
              fill="rgba(255,255,255,0.28)"
              stroke="rgba(255,255,255,0.70)"
              strokeWidth={1}
            />
          )
        })}

        {/* ── Floor labels ────────────────────────────────────────────────────── */}
        {floorLevels.map((floor, fi) => {
          const [lx, ly] = proj(0.02, 0.5, fi)
          return (
            <text
              key={`lbl-${floor}`}
              x={lx - 18} y={ly}
              fill="rgba(36,51,51,0.40)"
              fontSize={8}
              fontFamily="var(--font-mono)"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              F{floor}
            </text>
          )
        })}

        {/* ── Zone polygons ─────────────────────────────────────────────────── */}
        {zones.map(zone => {
          if (zone.fp_x === undefined) return null
          const fi = floorLevels.indexOf(zone.floor)
          if (fi < 0) return null

          const { fp_x: x, fp_y: y, fp_w: w, fp_h: h } = zone
          const corners: [number, number][] = [
            proj(x!,      y!,      fi),
            proj(x! + w!, y!,      fi),
            proj(x! + w!, y! + h!, fi),
            proj(x!,      y! + h!, fi),
          ]
          const pts = corners.map(p => p.join(',')).join(' ')

          const isSelected = zone.id === selectedId
          const fill = STATUS_FILL[zone.thermal_status] || STATUS_FILL.OK
          const fillOpacity = isSelected ? 0.70 : 0.40
          const strokeColor = STATUS_STROKE[zone.thermal_status] || STATUS_STROKE.OK

          // Center point for HOT heat-plume and click handling
          const centerX = corners.reduce((s, c) => s + c[0], 0) / 4
          const centerY = corners.reduce((s, c) => s + c[1], 0) / 4

          return (
            <g key={zone.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(zone.id)}>
              <polygon
                points={pts}
                fill={`${fill}${fillOpacity})`}
                stroke={strokeColor}
                strokeWidth={isSelected ? 1.5 : 0.8}
              />

              {/* HOT heat-plume */}
              {zone.thermal_status === 'HOT' && (
                <g opacity={0.6}>
                  <line
                    x1={centerX} y1={centerY}
                    x2={centerX} y2={centerY - 22}
                    stroke={STATUS_STROKE.HOT}
                    strokeWidth={1.5}
                    strokeDasharray="2,2"
                  />
                  <circle cx={centerX} cy={centerY - 23} r={2.5} fill={STATUS_STROKE.HOT} />
                </g>
              )}

              {/* Zone name pill on hover / selected */}
              {isSelected && (
                <>
                  <rect
                    x={centerX - 32} y={centerY - 10}
                    width={64} height={18}
                    rx={9} ry={9}
                    fill="rgba(255,255,255,0.90)"
                    stroke={strokeColor}
                    strokeWidth={0.8}
                  />
                  <text
                    x={centerX} y={centerY + 0.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={7}
                    fontFamily="var(--font-sans)"
                    fontWeight={600}
                    fill={strokeColor}
                  >
                    {zone.name.split(' ').slice(0, 2).join(' ')}
                  </text>
                </>
              )}
            </g>
          )
        })}

        {/* ── Annotation pill — highest delta zone ─────────────────────────── */}
        {annotationZone && (
          <g>
            <rect x={W - 130} y={8} width={122} height={22} rx={11} ry={11}
              fill="rgba(255,255,255,0.85)"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={1}
            />
            <text
              x={W - 69} y={19}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fontFamily="var(--font-sans)"
              fill="var(--lg-ink)"
            >
              {annotationZone.name.split(' ').slice(0, 2).join(' ')} · {annotationZone.current_temp_f}°F
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
