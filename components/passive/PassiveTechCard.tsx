'use client'
import { useState } from 'react'
import { PassiveTechnology } from '@/lib/types'

interface Props {
  tech: PassiveTechnology
}

const CATEGORY_LABELS: Record<string, string> = {
  VENTILATION: 'Ventilation',
  SHADING: 'Solar Shading',
  THERMAL_MASS: 'Thermal Mass',
  STACK: 'Stack Effect',
  EVAPORATIVE: 'Evaporative',
  GLAZING: 'Glazing',
  OTHER: 'Other',
}

export default function PassiveTechCard({ tech }: Props) {
  const [activating, setActivating] = useState(false)
  const [active, setActive] = useState(tech.active)

  async function toggle() {
    setActivating(true)
    await fetch('/api/bms/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bms_command: tech.category,
        target_id: tech.id,
        value: active ? 0 : 1,
        expected_outcome: `${active ? 'Deactivate' : 'Activate'} ${tech.name}`,
        carbon_avoided_kgco2e: 0,
      }),
    })
    setActive(a => !a)
    setActivating(false)
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${active ? 'rgba(46,255,150,0.20)' : 'var(--rule)'}`,
        borderRadius: 6,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>
            {tech.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
            {CATEGORY_LABELS[tech.category] ?? tech.category}
            {tech.auto_dispatch && ' · Auto-dispatch enabled'}
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ flexShrink: 0, marginLeft: 12 }}>
          <div
            style={{
              fontFamily: 'Azeret Mono, monospace',
              fontSize: 9,
              padding: '2px 8px',
              borderRadius: 3,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--rule)'}`,
              color: active ? 'var(--accent)' : 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {active ? '● Active' : '○ Idle'}
          </div>
          <button
            onClick={toggle}
            disabled={activating}
            style={{
              fontFamily: 'Azeret Mono, monospace',
              fontSize: 9,
              padding: '2px 8px',
              borderRadius: 3,
              border: '1px solid var(--rule)',
              color: 'var(--muted)',
              background: 'transparent',
              cursor: activating ? 'wait' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {activating ? '…' : active ? 'Pause' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Zones */}
      <div style={{ fontSize: 10, color: 'var(--muted)' }}>
        Zones: <span style={{ color: 'var(--text)' }}>{tech.zone_ids.length} zone{tech.zone_ids.length !== 1 ? 's' : ''} covered</span>
      </div>

      {/* Constraints */}
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 4,
          padding: '8px 10px',
          border: '1px solid var(--rule)',
          fontSize: 10,
          color: 'var(--muted)',
          lineHeight: 1.5,
        }}
      >
        {tech.operational_constraints}
      </div>
    </div>
  )
}
