'use client'
import { useState } from 'react'
import { Zone } from '@/lib/types'
import { statusColor, formatTemp } from '@/lib/utils'

interface Props { zone: Zone }

export default function ZoneDetailPanel({ zone }: Props) {
  const [setpoint, setSetpoint] = useState(zone.setpoint_f)
  const [writing, setWriting] = useState(false)
  const [written, setWritten] = useState(false)

  async function writeBMS() {
    setWriting(true)
    await fetch('/api/bms/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bms_command: 'SET_SETPOINT', target_id: zone.id, value: setpoint,
        expected_outcome: `Adjust ${zone.name} to ${setpoint}°F`,
        carbon_avoided_kgco2e: Math.abs(setpoint - zone.setpoint_f) * 0.12,
      }),
    })
    setWritten(true)
    setTimeout(() => setWritten(false), 3000)
    setWriting(false)
  }

  const color = statusColor(zone.thermal_status)
  const delta = zone.current_temp_f - setpoint

  return (
    <div className="glass" style={{ borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 4 }}>
          Zone Detail
        </div>
        <div style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--text)' }}>
          {zone.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
          Floor {zone.floor} · {zone.area_sqm} m² · {zone.current_occupancy_count} occupants
        </div>
      </div>

      {/* Live readings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Temperature', value: formatTemp(zone.current_temp_f), color },
          { label: 'Humidity', value: `${zone.current_humidity_pct}%`, color: 'var(--text)' },
          { label: 'CO₂ (ppm)', value: String(zone.current_co2_ppm), color: zone.current_co2_ppm > 900 ? 'var(--warn)' : 'var(--text)' },
          { label: 'Comfort Index', value: `${zone.comfort_index_pct}%`, color: zone.comfort_index_pct >= 80 ? 'var(--ok)' : 'var(--warn)' },
        ].map(item => (
          <div
            key={item.label}
            style={{ background: 'rgba(255,255,255,0.60)', borderRadius: 12, padding: '10px 13px', border: '1px solid rgba(255,255,255,0.85)' }}
          >
            <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 18, lineHeight: 1, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Setpoint */}
      <div style={{ borderTop: '1px solid rgba(26,43,34,0.08)', paddingTop: 14 }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 10 }}>
          Setpoint Override
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range" min={65} max={80} step={0.5} value={setpoint}
            onChange={e => setSetpoint(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 16, color: 'var(--accent)', minWidth: 54, textAlign: 'right' }}>
            {setpoint.toFixed(1)}°F
          </div>
        </div>
        {delta !== 0 && (
          <div style={{ fontSize: 10, color: delta > 0 ? 'var(--warn)' : 'var(--teal)', marginTop: 4 }}>
            {delta > 0 ? `+${delta.toFixed(1)}°F above` : `${delta.toFixed(1)}°F below`} setpoint
          </div>
        )}
        <button
          onClick={writeBMS}
          disabled={writing || setpoint === zone.setpoint_f}
          style={{
            marginTop: 10, width: '100%',
            fontFamily: 'Azeret Mono, monospace', fontSize: 11,
            padding: '8px',
            borderRadius: 10, border: 'none',
            background: written
              ? 'linear-gradient(135deg, #4A9AA0, #2E7D5A)'
              : setpoint === zone.setpoint_f ? 'rgba(26,43,34,0.08)' : 'linear-gradient(135deg, #2E7D5A, #1A5C3A)',
            color: setpoint === zone.setpoint_f ? 'var(--muted)' : 'white',
            cursor: writing || setpoint === zone.setpoint_f ? 'not-allowed' : 'pointer',
            boxShadow: setpoint === zone.setpoint_f ? 'none' : '0 2px 10px rgba(46,125,90,0.25)',
            transition: 'all 0.2s',
          }}
        >
          {written ? '✓ Command Sent' : writing ? 'Sending…' : '▶ Write to BMS'}
        </button>
      </div>

      {/* AI */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(26,43,34,0.08)', paddingTop: 14 }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)' }}>
          AI Optimisation
        </div>
        <div style={{
          fontFamily: 'Azeret Mono, monospace', fontSize: 9,
          padding: '2px 10px', borderRadius: 10,
          border: `1px solid ${zone.ai_optimization_active ? 'var(--ok)' : 'rgba(26,43,34,0.15)'}`,
          color: zone.ai_optimization_active ? 'var(--ok)' : 'var(--muted)',
          background: zone.ai_optimization_active ? 'rgba(46,125,90,0.08)' : 'transparent',
        }}>
          {zone.ai_optimization_active ? 'ACTIVE' : 'MANUAL'}
        </div>
      </div>
    </div>
  )
}
