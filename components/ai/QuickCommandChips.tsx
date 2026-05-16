'use client'

const QUICK_COMMANDS = [
  { label: 'Zone Summary', prompt: 'Give me a thermal comfort summary for all zones right now.' },
  { label: 'Carbon Status', prompt: 'What is our carbon performance today and what can we improve?' },
  { label: 'Comfort Alert', prompt: 'Which zones have comfort issues and what immediate actions do you recommend?' },
  { label: 'Night Flush', prompt: 'Should we activate night flush ventilation tonight? Analyze the forecast and building state.' },
  { label: 'NBS Irrigation', prompt: 'Assess whether we should trigger irrigation for any nature-based assets.' },
  { label: 'Set Goals', prompt: 'Help me set carbon reduction goals for the next 30 days.' },
]

interface Props {
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export default function QuickCommandChips({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2" style={{ borderTop: '1px solid var(--rule)' }}>
      {QUICK_COMMANDS.map(c => (
        <button
          key={c.label}
          onClick={() => onSelect(c.prompt)}
          disabled={disabled}
          style={{
            fontSize: 10,
            padding: '3px 9px',
            borderRadius: 12,
            border: '1px solid var(--rule)',
            color: disabled ? 'var(--muted)' : 'var(--text)',
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'border-color 0.15s, color 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            if (!disabled) {
              ;(e.target as HTMLElement).style.borderColor = 'var(--accent)'
              ;(e.target as HTMLElement).style.color = 'var(--accent)'
            }
          }}
          onMouseLeave={e => {
            ;(e.target as HTMLElement).style.borderColor = 'var(--rule)'
            ;(e.target as HTMLElement).style.color = disabled ? 'var(--muted)' : 'var(--text)'
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
