import { NBS_ACTIONS } from '@/lib/mock-data'

function statusColor(s: string) {
  return s === 'EXECUTED' ? 'var(--ok)' : s === 'SCHEDULED' ? 'var(--warn)' : 'var(--teal)'
}

export default function NBSActionsLog() {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: '18px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
        AI Recommended Actions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {NBS_ACTIONS.map(action => (
          <div key={action.id} style={{
            padding: '13px 14px', borderRadius: 12,
            border: `1px solid ${action.status === 'PENDING' ? 'rgba(74,154,160,0.22)' : 'rgba(255,255,255,0.85)'}`,
            background: 'rgba(255,255,255,0.58)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{action.asset_name}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{
                  fontFamily: 'Azeret Mono, monospace', fontSize: 8,
                  padding: '2px 7px', borderRadius: 8,
                  border: `1px solid ${statusColor(action.status)}`,
                  color: statusColor(action.status),
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{action.status}</span>
                <span style={{
                  fontFamily: 'Azeret Mono, monospace', fontSize: 8,
                  padding: '2px 7px', borderRadius: 8,
                  border: '1px solid rgba(26,43,34,0.15)',
                  color: action.confidence === 'HIGH' ? 'var(--ok)' : 'var(--warn)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{action.confidence}</span>
              </div>
            </div>

            <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.45, marginBottom: 5 }}>
              {action.action_description}
            </div>
            <div style={{ fontSize: 10, color: 'var(--teal)', lineHeight: 1.45, marginBottom: 10 }}>
              → {action.expected_outcome}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>
                Carbon impact: <span style={{ fontFamily: 'Azeret Mono, monospace', color: 'var(--teal)' }}>{action.carbon_impact_kgco2e} kgCO₂e</span>
                {action.irrigation_volume_kl > 0 && (
                  <span style={{ marginLeft: 10 }}>
                    Water: <span style={{ fontFamily: 'Azeret Mono, monospace', color: 'var(--teal)' }}>{action.irrigation_volume_kl} kL</span>
                  </span>
                )}
              </div>
              {!action.approved && (
                <button style={{
                  fontSize: 9, padding: '3px 12px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #2E7D5A, #1A5C3A)',
                  color: 'white', cursor: 'pointer',
                  boxShadow: '0 1px 6px rgba(46,125,90,0.22)',
                }}>
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
