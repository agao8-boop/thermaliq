'use client'
import { useEffect, useState } from 'react'
import { BUILDING, GRID_CARBON_INTENSITY } from '@/lib/mock-data'

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
      style={{ height: 52, borderBottom: '1px solid var(--rule)', background: 'var(--bg)' }}
      className="flex items-center justify-between px-6 z-50 flex-shrink-0"
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 20, color: 'var(--accent)', letterSpacing: '0.04em' }}>
          ThermalIQ
        </span>
        <span style={{ color: 'var(--rule)' }}>|</span>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{BUILDING.name}</span>
        <span style={{ color: 'var(--muted)', fontSize: 11 }}>&mdash; {BUILDING.address}</span>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-5">
        {/* BMS Live */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'Azeret Mono, Courier New, monospace', fontSize: 11, color: 'var(--accent)' }}>
            BMS Live
          </span>
        </div>

        {/* Grid carbon badge */}
        <div
          className="px-3 py-1 rounded"
          style={{ border: '1px solid var(--rule)', background: 'var(--surface)' }}
        >
          <span style={{ fontFamily: 'Azeret Mono, Courier New, monospace', fontSize: 11, color: 'var(--teal)' }}>
            {GRID_CARBON_INTENSITY} gCO₂/kWh
          </span>
        </div>

        {/* Clock */}
        <span style={{ fontFamily: 'Azeret Mono, Courier New, monospace', fontSize: 11, color: 'var(--muted)' }}>
          {time}
        </span>
      </div>
    </header>
  )
}
