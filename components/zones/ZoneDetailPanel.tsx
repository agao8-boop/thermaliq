'use client'
import { useState } from 'react'
import { Zone } from '@/lib/types'
import { statusColor, formatTemp } from '@/lib/utils'

interface Props {
  zone: Zone
}

export default function ZoneDetailPanel({ zone }: Props) {
  const [setpoint, setSetpoint] = useState(zone.setpoint_f)
  const [writing, setWriting] = useState(false)
  const [written, setWritten] = useState(false)

  async function writeBMS() {
    setWriting(true)
    try {
      await fetch('/api/bms/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bms_command: 'SET_SETPOINT',
          target_id: zone.id,
          value: setpoint,
          expected_outcome: `Adjust ${zone.name} to ${setpoint}°F setpoint`,
          carbon_avoided_kgco2e: Math.abs(setpoint - zone.setpoint_f) * 0.12,
        }),
      })
      setWritten(true)
      setTimeout(() => setWritten(false), 3000)
    } finally {
      setWriting(false)
    }
  }

  const color = statusColor(zone.thermal_status)
  const delta = zone.current_temp_f - setpoint

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--rule)',
        borderRadius: 6,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
          Zone Detail
        </div>
        <div style={{ fontSize: 18, color: 'var(--text)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {zone.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
          Floor {zone.floor} · {zone.area_sqm} m² · {zone.current_occupancy_count} occupants
        </div>
      </div>

      {/* Live readings */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Temperature', value: formatTemp(zone.current_temp_f), color },
          { label: 'Humidity', value: `${zone.current_humidity_pct}%`, color: 'var(--text)' },
          { label: 'CO₂ (ppm)', value: String(zone.current_co2_ppm), color: zone.current_co2_ppm > 900 ? 'var(--amber)' : 'var(--text)' },
          { label: 'Comfort Index', value: `${zone.comfort_index_pct}%`, color: zone.comfort_index_pct >= 80 ? 'var(--accent)' : 'var(--amber)' },
        ].map(item => (
          <div key={item.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '10px 12px', border: '1px solid var(--rule)' }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 18, lineHeight: 1, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Setpoint control */}
      <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 14 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 10 }}>
          Setpoint Override
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={65}
            max={80}
            step={0.5}
            value={setpoint}
            onChange={e => setSetpoint(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 16, color: 'var(--accent)', minWidth: 54, textAlign: 'right' }}>
            {setpoint.toFixed(1)}°F
          </div>
        </div>
        {delta !== 0 && (
          <div style={{ fontSize: 10, color: delta > 0 ? 'var(--amber)' : 'var(--teal)', marginTop: 4 }}>
            {delta > 0 ? `+${delta.toFixed(1)}°F above setpoint` : `${delta.toFixed(1)}°F below setpoint`}
          </div>
        )}
        <button
          onClick={writeBMS}
          disabled={writing || setpoint === zone.setpoint_f}
          style={{
            marginTop: 10,
            width: '100%',
            fontFamily: 'Azeret Mono, monospace',
            fontSize: 11,
            padding: '7px',
            borderRadius: 4,
            border: `1px solid ${written ? 'var(--teal)' : 'var(--accent)'}`,
            color: written ? 'var(--teal)' : 'var(--accent)',
            background: written ? 'rgba(62,207,207,0.08)' : 'rgba(46,255,150,0.08)',
            cursor: writing || setpoint === zone.setpoint_f ? 'not-allowed' : 'pointer',
            opacity: setpoint === zone.setpoint_f ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        >
          {written ? '✓ Command Sent' : writing ? 'Sending…' : '▶ Write to BMS'}
        </button>
      </div>

      {/* AI status */}
      <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 14 }}>
        <div className="flex items-center justify-between">
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)' }}>
            AI Optimization
          </div>
          <div
            style={{
              fontFamily: 'Azeret Mono, monospace',
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 3,
              border: `1px solid ${zone.ai_optimization_active ? 'var(--accent)' : 'var(--rule)'}`,
              color: zone.ai_optimization_active ? 'var(--accent)' : 'var(--muted)',
              background: zone.ai_optimization_active ? 'rgba(46,255,150,0.08)' : 'transparent',
            }}
          >
            {zone.ai_optimization_active ? 'ACTIVE' : 'MANUAL'}
          </div>
        </div>
      </div>
    </div>
  )
}
