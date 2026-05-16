import { NBS_ACTIONS } from '@/lib/mock-data'

function statusColor(s: string) {
  if (s === 'EXECUTED') return 'var(--accent)'
  if (s === 'SCHEDULED') return 'var(--amber)'
  if (s === 'PENDING') return 'var(--teal)'
  return 'var(--muted)'
}

export default function NBSActionsLog() {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--rule)',
        borderRadius: 6,
        padding: '16px',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        AI Recommended Actions
      </div>

      <div className="flex flex-col gap-3">
        {NBS_ACTIONS.map(action => (
          <div
            key={action.id}
            style={{
              padding: '12px 14px',
              borderRadius: 4,
              border: `1px solid ${action.status === 'PENDING' ? 'rgba(62,207,207,0.20)' : 'var(--rule)'}`,
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500 }}>{action.asset_name}</div>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    fontFamily: 'Azeret Mono, monospace',
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 3,
                    border: `1px solid ${statusColor(action.status)}`,
                    color: statusColor(action.status),
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {action.status}
                </div>
                <div
                  style={{
                    fontFamily: 'Azeret Mono, monospace',
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 3,
                    border: '1px solid var(--rule)',
                    color: action.confidence === 'HIGH' ? 'var(--accent)' : 'var(--amber)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {action.confidence}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4, marginBottom: 6 }}>
              {action.action_description}
            </div>

            <div style={{ fontSize: 10, color: 'var(--teal)', lineHeight: 1.4, marginBottom: 8 }}>
              → {action.expected_outcome}
            </div>

            <div className="flex items-center justify-between">
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                Carbon impact: <span style={{ color: 'var(--teal)', fontFamily: 'Azeret Mono, monospace' }}>
                  {action.carbon_impact_kgco2e} kgCO₂e
                </span>
                {action.irrigation_volume_kl > 0 && (
                  <span style={{ marginLeft: 12 }}>
                    Water: <span style={{ color: 'var(--teal)', fontFamily: 'Azeret Mono, monospace' }}>
                      {action.irrigation_volume_kl} kL
                    </span>
                  </span>
                )}
              </div>
              {!action.approved && (
                <button
                  style={{
                    fontFamily: 'Azeret Mono, monospace',
                    fontSize: 9,
                    padding: '3px 10px',
                    borderRadius: 3,
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    background: 'rgba(46,255,150,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
