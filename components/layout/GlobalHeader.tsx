'use client'
import { useEffect, useState } from 'react'
import { BUILDING, GRID_CARBON_INTENSITY } from '@/lib/mock-data'
import ModeToggle from './ModeToggle'

export default function GlobalHeader() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      className="glass-strong flex items-center justify-between px-6 z-50 flex-shrink-0"
      style={{
        height: 56,
        borderBottom: '1px solid rgba(255,255,255,0.80)',
        borderRadius: 0,
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 22,
          color: 'var(--accent)',
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}>
          ThermalIQ
        </span>
        <span style={{ color: 'var(--rule)', fontSize: 18 }}>|</span>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{BUILDING.name}</span>
        <span style={{ color: 'var(--rule)', fontSize: 11 }}>—</span>
        <span style={{ color: 'var(--muted)', fontSize: 11 }}>{BUILDING.address}</span>
      </div>

      {/* Centre: mode toggle */}
      <ModeToggle />

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        {/* BMS Live */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 0 0 3px rgba(46,125,90,0.20)',
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.06em' }}>
            BMS LIVE
          </span>
        </div>

        {/* Grid carbon badge */}
        <div
          className="glass"
          style={{ padding: '3px 10px', borderRadius: 20 }}
        >
          <span style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 10, color: 'var(--teal)' }}>
            {GRID_CARBON_INTENSITY} gCO₂/kWh
          </span>
        </div>

        {/* Clock */}
        <span style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 10, color: 'var(--muted)' }}>
          {time}
        </span>
      </div>
    </header>
  )
}
