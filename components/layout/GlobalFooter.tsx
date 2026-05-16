'use client'
import { useState } from 'react'
import { CARBON_LOG } from '@/lib/mock-data'

const STATUS_ITEMS = [
  { label: 'BACnet', ok: true },
  { label: 'NBS Irrigation', ok: true },
  { label: 'Biometric Stream', ok: false },
  { label: 'Grid Carbon', ok: true },
]

export default function GlobalFooter() {
  const [simRunning, setSimRunning] = useState(false)
  const log = CARBON_LOG

  return (
    <footer
      style={{ height: 36, borderTop: '1px solid var(--rule)', background: 'var(--bg)', fontSize: 11 }}
      className="flex items-center justify-between px-6 flex-shrink-0"
    >
      {/* Status indicators */}
      <div className="flex items-center gap-5">
        {STATUS_ITEMS.map(s => (
          <span key={s.label} className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: s.ok ? 'var(--accent)' : 'var(--amber)' }}
            />
            {s.label}
          </span>
        ))}
      </div>

      {/* Carbon target */}
      <span style={{ fontFamily: 'Azeret Mono, Courier New, monospace', color: 'var(--teal)' }}>
        Carbon avoided today: {log.carbon_avoided_kgco2e.toFixed(1)} kg CO₂e
        &nbsp;·&nbsp;
        Passive credit: {log.passive_credit_kwh.toFixed(1)} kWh
        &nbsp;·&nbsp;
        Grid: {log.grid_carbon_intensity_gco2_kwh} gCO₂/kWh
      </span>

      {/* Simulator */}
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--muted)' }}>Simulator</span>
        <button
          onClick={() => setSimRunning(r => !r)}
          style={{
            fontFamily: 'Azeret Mono, Courier New, monospace',
            fontSize: 10,
            padding: '2px 10px',
            borderRadius: 2,
            border: `1px solid ${simRunning ? 'var(--accent)' : 'var(--rule)'}`,
            color: simRunning ? 'var(--accent)' : 'var(--muted)',
            background: simRunning ? 'rgba(46,255,150,0.08)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {simRunning ? '◼ Running' : '▶ Start'}
        </button>
      </div>
    </footer>
  )
}
