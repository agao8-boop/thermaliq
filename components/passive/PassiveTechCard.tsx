'use client'
import { useState } from 'react'
import { PassiveTechnology } from '@/lib/types'

interface Props { tech: PassiveTechnology }

const CATEGORY_LABELS: Record<string, string> = {
  VENTILATION: 'Ventilation', SHADING: 'Solar Shading',
  THERMAL_MASS: 'Thermal Mass', STACK: 'Stack Effect',
  EVAPORATIVE: 'Evaporative', GLAZING: 'Glazing', OTHER: 'Other',
}

export default function PassiveTechCard({ tech }: Props) {
  const [activating, setActivating] = useState(false)
  const [active, setActive] = useState(tech.active)

  async function toggle() {
    setActivating(true)
    await fetch('/api/bms/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bms_command: tech.category, target_id: tech.id, value: active ? 0 : 1, expected_outcome: `${active ? 'Deactivate' : 'Activate'} ${tech.name}`, carbon_avoided_kgco2e: 0 }),
    })
    setActive(a => !a)
    setActivating(false)
  }

  return (
    <div
      className="glass"
      style={{
        borderRadius: 14, padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 10,
        border: active ? '1.5px solid rgba(46,125,90,0.30)' : '1px solid rgba(255,255,255,0.85)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>{tech.name}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
            {CATEGORY_LABELS[tech.category] ?? tech.category}
            {tech.auto_dispatch && ' · Auto-dispatch'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 10,
            border: `1px solid ${active ? 'var(--ok)' : 'rgba(26,43,34,0.15)'}`,
            background: active ? 'rgba(46,125,90,0.10)' : 'transparent',
            fontSize: 9, fontFamily: 'Azeret Mono, monospace',
            color: active ? 'var(--ok)' : 'var(--muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: active ? 'var(--ok)' : 'var(--muted)', display: 'inline-block' }} />
            {active ? 'Active' : 'Idle'}
          </div>
          <button
            onClick={toggle}
            disabled={activating}
            style={{
              padding: '3px 10px', borderRadius: 10,
              border: '1px solid rgba(26,43,34,0.15)',
              background: 'rgba(255,255,255,0.65)',
              fontSize: 9, color: 'var(--text)',
              cursor: activating ? 'wait' : 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            {activating ? '…' : active ? 'Pause' : 'Activate'}
          </button>
        </div>
      </div>

      <div style={{ fontSize: 10, color: 'var(--muted)' }}>
        Zones covered: <span style={{ color: 'var(--text)' }}>{tech.zone_ids.length}</span>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.55)', borderRadius: 10, padding: '9px 12px',
        border: '1px solid rgba(255,255,255,0.85)',
        fontSize: 10, color: 'var(--muted)', lineHeight: 1.5,
      }}>
        {tech.operational_constraints}
      </div>
    </div>
  )
}
