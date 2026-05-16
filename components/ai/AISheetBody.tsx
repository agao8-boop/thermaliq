'use client'
import { useState } from 'react'
import { AIQueueItem } from '@/lib/types'

const PRIORITY_COLOR: Record<string, string> = {
  now:      'var(--lg-rust)',
  tonight:  'var(--lg-amber)',
  tomorrow: 'var(--lg-sky)',
}
const PRIORITY_BG: Record<string, string> = {
  now:      'rgba(181,96,75,0.10)',
  tonight:  'rgba(201,144,94,0.10)',
  tomorrow: 'rgba(132,182,204,0.10)',
}

interface Props {
  item: AIQueueItem
  onApprove?: (id: string) => void
  onDismiss?: (id: string) => void
}

export default function AISheetBody({ item, onApprove, onDismiss }: Props) {
  const [approved, setApproved] = useState(false)
  const color = PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.now
  const bg    = PRIORITY_BG[item.priority]    || PRIORITY_BG.now

  function handleApprove() {
    setApproved(true)
    // Close after short delay so user sees the "Approved ✓" state
    setTimeout(() => onApprove?.(item.id), 900)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero */}
      <div style={{ borderRadius: 'var(--r-card)', background: `linear-gradient(155deg, ${bg}, transparent)`, border: `1px solid ${color}30`, padding: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ padding: '3px 10px', borderRadius: 'var(--r-pill)', background: bg, border: `1px solid ${color}50`, fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' as const, color, fontFamily: 'var(--font-sans)' }}>
            {item.priority}
          </span>
          <span style={{ fontSize: 9, color: 'var(--lg-ink-35)', fontFamily: 'var(--font-mono)' }}>ETA {item.eta}</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', lineHeight: 1.3, marginBottom: 10 }}>
          {item.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--lg-ink-70)', lineHeight: 1.6 }}>{item.rationale}</div>
      </div>

      {/* Impact metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Energy Saved', value: `${item.impact_kwh}`, unit: 'kWh' },
          { label: 'Carbon Offset', value: `${item.impact_kg}`, unit: 'kg CO₂e' },
          { label: 'Confidence', value: item.confidence, unit: '' },
        ].map(m => (
          <div key={m.label} className="glass-soft" style={{ padding: '10px 12px', borderRadius: 'var(--r-control)', textAlign: 'center' }}>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', color: 'var(--lg-mint-deep)' }}>{m.value}</div>
            {m.unit && <div style={{ fontSize: 9, color: 'var(--lg-ink-35)', marginTop: 2 }}>{m.unit}</div>}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn-primary"
          style={{
            flex: 1, textAlign: 'center',
            background: approved
              ? 'linear-gradient(180deg, #4caf82, #2e7a58)'
              : undefined,
            transition: 'background 0.3s',
          }}
          onClick={handleApprove}
          disabled={approved}
        >
          {approved ? '✓ Approved' : '✓ Approve'}
        </button>
        <button className="btn-ghost" style={{ flex: 1, textAlign: 'center' }} onClick={() => onDismiss?.(item.id)}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
