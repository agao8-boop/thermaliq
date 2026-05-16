'use client'
import { PreconditioningPlan } from '@/lib/types'

interface Props {
  plans: PreconditioningPlan[]
}

function confidenceColor(c: string) {
  if (c === 'HIGH') return 'var(--accent)'
  if (c === 'MEDIUM') return 'var(--amber)'
  return '#ff5c5c'
}

export default function PreconditioningPanel({ plans }: Props) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--rule)',
        borderRadius: 6,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        Preconditioning Plans
      </div>

      <div className="flex flex-col gap-3">
        {plans.map(plan => {
          const start = new Date(plan.scheduled_start)
          const end = new Date(plan.scheduled_end)
          return (
            <div
              key={plan.id}
              style={{
                padding: '12px 14px',
                borderRadius: 4,
                border: '1px solid var(--rule)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--text)' }}>{plan.zone_name}</div>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      fontFamily: 'Azeret Mono, monospace',
                      fontSize: 9,
                      padding: '2px 6px',
                      borderRadius: 3,
                      border: `1px solid ${confidenceColor(plan.confidence)}`,
                      color: confidenceColor(plan.confidence),
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {plan.confidence}
                  </div>
                  {plan.approved && (
                    <span style={{ fontSize: 9, color: 'var(--accent)', fontFamily: 'Azeret Mono, monospace' }}>✓ Approved</span>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4, marginBottom: 8 }}>
                {plan.action_description}
              </div>

              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 8 }}>
                {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {' – '}
                {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Energy Saved', value: `${plan.energy_saved_kwh} kWh`, color: 'var(--teal)' },
                  { label: 'Carbon', value: `${plan.carbon_saved_kgco2e} kg`, color: 'var(--teal)' },
                  { label: 'Load ↓', value: `${plan.load_reduction_pct}%`, color: 'var(--accent)' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 11, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {!plan.approved && !plan.executed && (
                <button
                  style={{
                    marginTop: 10,
                    width: '100%',
                    fontFamily: 'Azeret Mono, monospace',
                    fontSize: 10,
                    padding: '5px',
                    borderRadius: 3,
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    background: 'rgba(46,255,150,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  Approve Plan
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
