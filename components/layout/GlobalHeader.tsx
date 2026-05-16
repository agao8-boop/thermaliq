'use client'
import { useEffect, useState } from 'react'
import { BUILDING, GRID_CARBON_INTENSITY } from '@/lib/mock-data'
import ModeToggle from './ModeToggle'

export default function GlobalHeader() {
  const [time, setTime] = useState('')
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)')
    setNarrow(mq.matches)
    const handler = (e: MediaQueryListEvent) => setNarrow(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 50,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(28px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
        borderBottom: '1px solid rgba(255,255,255,0.85)',
      }}
    >
      {/* Brand — always visible */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--lg-ink-deep)',
          letterSpacing: '-0.02em',
        }}>
          thermal<span style={{ color: 'var(--lg-mint-deep)' }}>·</span>iq
        </span>
        {/* Building name — hidden on narrow */}
        {!narrow && (
          <>
            <span style={{ width: 1, height: 14, background: 'var(--lg-ink-15)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--lg-ink-55)', fontWeight: 400 }}>
              {BUILDING.name}
            </span>
          </>
        )}
      </div>

      {/* Mode toggle — always visible */}
      <ModeToggle />

      {/* Live status pill — hidden on narrow */}
      {!narrow && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            background: 'rgba(255,255,255,0.65)',
            border: '1px solid var(--lg-ink-08)',
            borderRadius: 'var(--r-pill)',
            padding: '5px 14px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--lg-mint-deep)',
              boxShadow: '0 0 0 3px rgba(63,127,102,0.20)',
              display: 'inline-block',
              marginRight: 6,
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--lg-mint-deep)', letterSpacing: '0.06em', marginRight: 10 }}>
            BMS LIVE
          </span>
          <span style={{ width: 1, height: 10, background: 'var(--lg-ink-15)', marginRight: 10 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--lg-teal)', marginRight: 10 }}>
            {GRID_CARBON_INTENSITY} gCO₂/kWh
          </span>
          <span style={{ width: 1, height: 10, background: 'var(--lg-ink-15)', marginRight: 10 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--lg-ink-55)' }}>
            {time}
          </span>
        </div>
      )}
    </header>
  )
}
