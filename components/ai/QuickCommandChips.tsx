'use client'

const QUICK_COMMANDS = [
  { label: 'Zone Summary', prompt: 'Give me a thermal comfort summary for all zones right now.' },
  { label: 'Carbon Status', prompt: 'What is our carbon performance today and what can we improve?' },
  { label: 'Comfort Alert', prompt: 'Which zones have comfort issues and what immediate actions do you recommend?' },
  { label: 'Night Flush', prompt: 'Should we activate night flush ventilation tonight? Analyse the forecast and building state.' },
  { label: 'NBS Irrigation', prompt: 'Assess whether we should trigger irrigation for any nature-based assets.' },
  { label: 'Set Goals', prompt: 'Help me set carbon reduction goals for the next 30 days.' },
]

interface Props {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export default function QuickCommandChips({ onSelect, disabled }: Props) {
  return (
    <div style={{ padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {QUICK_COMMANDS.map(c => (
        <button
          key={c.label}
          onClick={() => onSelect(c.prompt)}
          disabled={disabled}
          style={{
            fontSize: 10,
            padding: '3px 10px',
            borderRadius: 12,
            border: '1px solid rgba(26,43,34,0.14)',
            color: disabled ? 'var(--muted)' : 'var(--text)',
            background: 'rgba(255,255,255,0.60)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            if (!disabled) {
              ;(e.target as HTMLElement).style.borderColor = 'var(--accent)'
              ;(e.target as HTMLElement).style.color = 'var(--accent)'
              ;(e.target as HTMLElement).style.background = 'rgba(46,125,90,0.08)'
            }
          }}
          onMouseLeave={e => {
            ;(e.target as HTMLElement).style.borderColor = 'rgba(26,43,34,0.14)'
            ;(e.target as HTMLElement).style.color = disabled ? 'var(--muted)' : 'var(--text)'
            ;(e.target as HTMLElement).style.background = 'rgba(255,255,255,0.60)'
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
