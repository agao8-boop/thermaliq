// components/occupant/WearableFlow.tsx
'use client'
import { useState, useEffect } from 'react'

type Step = 'permission' | 'scanning' | 'connected'

interface Props {
  onDismiss?: () => void
}

const BIOMETRICS = [
  { label: 'Skin Temp', value: '34.2°C', note: 'Normal' },
  { label: 'Heart Rate', value: '68 bpm', note: 'Resting' },
  { label: 'Activity', value: 'Sedentary', note: '' },
  { label: 'Comfort Est.', value: 'Neutral+', note: '' },
]

export default function WearableFlow({ onDismiss }: Props) {
  const [step, setStep] = useState<Step>('permission')

  function handleAllow() {
    setStep('scanning')
  }

  useEffect(() => {
    if (step !== 'scanning') return
    const id = setTimeout(() => setStep('connected'), 2500)
    return () => clearTimeout(id)
  }, [step])

  // ── Permission gate ───────────────────────────────────────────────────────
  if (step === 'permission') {
    return (
      <div
        className="glass"
        style={{
          padding: '28px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 18,
          background: 'linear-gradient(155deg, rgba(142,197,168,0.12), rgba(255,255,255,0.82))',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--lg-mint), var(--lg-mint-deep))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, boxShadow: '0 8px 24px rgba(63,127,102,0.30)',
        }}>
          ⌚
        </div>
        <div>
          <div style={{
            fontSize: 16, fontWeight: 700, color: 'var(--lg-ink-deep)',
            fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', marginBottom: 8,
          }}>
            Allow Wearable Access
          </div>
          <div style={{
            fontSize: 12, color: 'var(--lg-ink-55)', lineHeight: 1.6,
            fontFamily: 'var(--font-sans)', maxWidth: 280,
          }}>
            ThermalIQ would like to read your skin temperature, heart rate, and activity level to personalise your comfort automatically.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            onClick={handleAllow}
            className="btn-primary"
            style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: 13 }}
          >
            Allow Access
          </button>
          <button
            onClick={onDismiss}
            className="btn-ghost"
            style={{ flex: 1, textAlign: 'center', padding: '12px 0', fontSize: 13 }}
          >
            Not Now
          </button>
        </div>
        <div style={{ fontSize: 10, color: 'var(--lg-ink-35)', fontFamily: 'var(--font-sans)' }}>
          Data stays on-device. Never shared externally.
        </div>
      </div>
    )
  }

  // ── Bluetooth scanning ────────────────────────────────────────────────────
  if (step === 'scanning') {
    return (
      <div
        className="glass"
        style={{
          padding: '36px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', gap: 16,
        }}
      >
        {/* Pulsing ring */}
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid var(--lg-mint)',
            animation: 'bt-scan-ring 1.4s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 8, borderRadius: '50%',
            border: '2px solid var(--lg-mint-deep)',
            animation: 'bt-scan-ring 1.4s ease-out 0.4s infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--lg-mint), var(--lg-mint-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            ⌚
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)' }}>
          Connecting via Bluetooth…
        </div>
        <div style={{ fontSize: 11, color: 'var(--lg-ink-55)' }}>
          Keep your device nearby
        </div>
      </div>
    )
  }

  // ── Connected panel ───────────────────────────────────────────────────────
  return (
    <div
      className="glass"
      style={{
        padding: '20px',
        background: 'linear-gradient(155deg, rgba(142,197,168,0.12), rgba(255,255,255,0.82))',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--lg-mint-deep)',
          boxShadow: '0 0 0 3px color-mix(in srgb, var(--lg-mint-deep) 22%, transparent)',
        }} />
        <span style={{
          fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase' as const,
          color: 'var(--lg-mint-deep)', fontFamily: 'var(--font-sans)', fontWeight: 600,
        }}>
          Wearable Connected
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {BIOMETRICS.map(m => (
          <div
            key={m.label}
            className="glass-soft"
            style={{ padding: '10px 12px', borderRadius: 'var(--r-control)' }}
          >
            <div className="label-eyebrow" style={{ marginBottom: 3 }}>{m.label}</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--lg-mint-deep)',
            }}>
              {m.value}
              {m.note && <span style={{ fontSize: 9, color: 'var(--lg-ink-35)', marginLeft: 4 }}>{m.note}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
