'use client'
import { ChatMessage, BMSCommand } from '@/lib/types'

interface Props {
  message: ChatMessage
  onExecuteBMS?: (cmd: BMSCommand) => void
}

function parseBMSCommand(content: string): BMSCommand | null {
  const match = content.match(/```bms-command\s*([\s\S]*?)```/)
  if (!match) return null
  try { return JSON.parse(match[1]) } catch { return null }
}

function renderContent(content: string) {
  return content.replace(/```bms-command[\s\S]*?```/g, '').trim()
}

export default function ChatBubble({ message, onExecuteBMS }: Props) {
  const isAI = message.role === 'AI'
  const bmsCmd = isAI ? parseBMSCommand(message.content) : null

  return (
    <div className={`flex flex-col gap-1.5 ${isAI ? 'items-start' : 'items-end'}`}>
      <div style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)', padding: '0 4px' }}>
        {isAI ? 'AI Director' : 'You'}
      </div>

      <div
        style={{
          maxWidth: '90%',
          padding: '9px 13px',
          borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
          background: isAI ? 'rgba(255,255,255,0.72)' : 'rgba(46,125,90,0.12)',
          border: isAI ? '1px solid rgba(255,255,255,0.90)' : '1px solid rgba(46,125,90,0.25)',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
          boxShadow: '0 1px 8px rgba(50,90,70,0.06)',
        }}
      >
        {renderContent(message.content)}
      </div>

      {bmsCmd && onExecuteBMS && (
        <div
          style={{
            maxWidth: '90%',
            padding: '10px 13px',
            borderRadius: 12,
            background: 'rgba(184,124,74,0.08)',
            border: '1px solid rgba(184,124,74,0.25)',
            fontSize: 11,
          }}
        >
          <div style={{ color: 'var(--amber)', fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 5 }}>
            BMS Command Ready
          </div>
          <div style={{ color: 'var(--text)', marginBottom: 2 }}>
            <span style={{ fontFamily: 'Azeret Mono, monospace', color: 'var(--accent)', fontWeight: 500 }}>{bmsCmd.bms_command}</span>
            {' → '}{bmsCmd.target_id}{bmsCmd.value !== undefined && ` = ${bmsCmd.value}`}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 10, marginBottom: 4 }}>{bmsCmd.expected_outcome}</div>
          <div style={{ color: 'var(--teal)', fontSize: 10, marginBottom: 8 }}>
            Carbon avoided: {bmsCmd.carbon_avoided_kgco2e} kgCO₂e
          </div>
          <button
            onClick={() => onExecuteBMS(bmsCmd)}
            style={{
              fontSize: 10, padding: '3px 12px', borderRadius: 20,
              border: '1.5px solid var(--accent)',
              color: 'white',
              background: 'linear-gradient(135deg, #4A9AA0, #2E7D5A)',
              cursor: 'pointer',
              boxShadow: '0 1px 6px rgba(46,125,90,0.25)',
            }}
          >
            ▶ Execute
          </button>
        </div>
      )}
    </div>
  )
}
