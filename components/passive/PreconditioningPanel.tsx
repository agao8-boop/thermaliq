'use client'
import { PreconditioningPlan } from '@/lib/types'

interface Props { plans: PreconditioningPlan[] }

function confidenceColor(c: string) {
  return c === 'HIGH' ? 'var(--ok)' : c === 'MEDIUM' ? 'var(--warn)' : 'var(--hot)'
}

export default function PreconditioningPanel({ plans }: Props) {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: 18 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
        Preconditioning Plans
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plans.map(plan => {
          const start = new Date(plan.scheduled_start)
          const end = new Date(plan.scheduled_end)
          return (
            <div key={plan.id} style={{
              padding: '13px 14px', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.85)',
              background: 'rgba(255,255,255,0.55)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{plan.zone_name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontFamily: 'Azeret Mono, monospace', fontSize: 8,
                    padding: '2px 7px', borderRadius: 8,
                    border: `1px solid ${confidenceColor(plan.confidence)}`,
                    color: confidenceColor(plan.confidence),
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{plan.confidence}</span>
                  {plan.approved && <span style={{ fontSize: 9, color: 'var(--ok)' }}>✓ Approved</span>}
                </div>
              </div>

              <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4, marginBottom: 7 }}>
                {plan.action_description}
              </div>
              <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 10 }}>
                {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {' – '}
                {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: plan.approved ? 0 : 10 }}>
                {[
                  { label: 'Energy', value: `${plan.energy_saved_kwh} kWh`, color: 'var(--teal)' },
                  { label: 'Carbon', value: `${plan.carbon_saved_kgco2e} kg`, color: 'var(--teal)' },
                  { label: 'Load ↓', value: `${plan.load_reduction_pct}%`, color: 'var(--ok)' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 8, color: 'var(--muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                    <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 11, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {!plan.approved && !plan.executed && (
                <button style={{
                  width: '100%', padding: '6px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #2E7D5A, #1A5C3A)',
                  color: 'white', fontSize: 10, cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(46,125,90,0.20)',
                }}>
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
