'use client'
import { ChatMessage, BMSCommand } from '@/lib/types'

interface Props {
  message: ChatMessage
  onExecuteBMS?: (cmd: BMSCommand) => void
}

function parseBMSCommand(content: string): BMSCommand | null {
  const match = content.match(/```bms-command\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

function renderContent(content: string) {
  // Strip BMS command block from display text
  const display = content.replace(/```bms-command[\s\S]*?```/g, '').trim()
  return display
}

export default function ChatBubble({ message, onExecuteBMS }: Props) {
  const isAI = message.role === 'AI'
  const bmsCmd = isAI ? parseBMSCommand(message.content) : null

  return (
    <div className={`flex flex-col gap-1 ${isAI ? 'items-start' : 'items-end'}`}>
      {/* Label */}
      <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', paddingLeft: isAI ? 2 : 0, paddingRight: isAI ? 0 : 2 }}>
        {isAI ? 'AI Director' : 'You'}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '88%',
          padding: '8px 12px',
          borderRadius: isAI ? '2px 10px 10px 10px' : '10px 2px 10px 10px',
          background: isAI ? 'var(--surface)' : 'rgba(46,255,150,0.10)',
          border: isAI ? '1px solid var(--rule)' : '1px solid rgba(46,255,150,0.25)',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {renderContent(message.content)}
      </div>

      {/* BMS Command card */}
      {bmsCmd && onExecuteBMS && (
        <div
          style={{
            maxWidth: '88%',
            padding: '8px 12px',
            borderRadius: 4,
            background: 'rgba(240,184,64,0.08)',
            border: '1px solid rgba(240,184,64,0.30)',
            fontSize: 11,
          }}
        >
          <div style={{ color: 'var(--amber)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
            BMS Command Ready
          </div>
          <div style={{ color: 'var(--text)', marginBottom: 2 }}>
            <span style={{ fontFamily: 'Azeret Mono, monospace', color: 'var(--accent)' }}>{bmsCmd.bms_command}</span>
            {' → '}
            {bmsCmd.target_id}
            {bmsCmd.value !== undefined && ` = ${bmsCmd.value}`}
          </div>
          <div style={{ color: 'var(--muted)', marginBottom: 6 }}>{bmsCmd.expected_outcome}</div>
          <div style={{ color: 'var(--teal)', fontSize: 10, marginBottom: 8 }}>
            Carbon avoided: {bmsCmd.carbon_avoided_kgco2e} kgCO₂e
          </div>
          <button
            onClick={() => onExecuteBMS(bmsCmd)}
            style={{
              fontFamily: 'Azeret Mono, monospace',
              fontSize: 10,
              padding: '3px 12px',
              borderRadius: 2,
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              background: 'rgba(46,255,150,0.08)',
              cursor: 'pointer',
            }}
          >
            ▶ Execute
          </button>
        </div>
      )}
    </div>
  )
}
