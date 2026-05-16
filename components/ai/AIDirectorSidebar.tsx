'use client'
import { useState, useRef, useEffect } from 'react'
import { ChatMessage, BMSCommand } from '@/lib/types'
import ChatBubble from './ChatBubble'
import QuickCommandChips from './QuickCommandChips'

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'AI',
  mode: 'ADMIN',
  content: `Good morning. I'm monitoring Meridian Tower across 6 zones.\n\nCurrent alerts:\n• East Open Plan is running HOT at 78.2°F — 2.2° above setpoint\n• Green Roof soil moisture at 28% — irrigation recommended\n• Roof Terrace at 83.4°F with high occupancy\n\nI'm ready to assist with thermal optimisation, carbon management, or BMS commands.`,
  created_at: new Date().toISOString(),
}

export default function AIDirectorSidebar() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'USER',
      mode: 'ADMIN',
      content: text.trim(),
      created_at: new Date().toISOString(),
    }

    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setStreaming(true)

    const aiMsgId = `ai-${Date.now()}`
    setMessages(prev => [...prev, {
      id: aiMsgId, role: 'AI', mode: 'ADMIN', content: '',
      created_at: new Date().toISOString(),
    }])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          mode: 'MANAGER',
        }),
        signal: abortRef.current.signal,
      })

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No stream')
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, content: m.content + parsed.text } : m)
              )
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, content: '[Connection error]' } : m)
        )
      }
    } finally {
      setStreaming(false)
    }
  }

  async function executeBMS(cmd: BMSCommand) {
    try {
      await fetch('/api/bms/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmd),
      })
      setMessages(prev => [...prev, {
        id: `confirm-${Date.now()}`, role: 'AI', mode: 'ADMIN',
        content: `✓ BMS command sent: ${cmd.bms_command} → ${cmd.target_id}${cmd.value !== undefined ? ` = ${cmd.value}` : ''}`,
        created_at: new Date().toISOString(),
      }])
    } catch { /* silent */ }
  }

  if (collapsed) {
    return (
      <div
        style={{
          width: 40,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.70)',
          background: 'rgba(255,255,255,0.40)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 16,
          cursor: 'pointer',
        }}
        onClick={() => setCollapsed(false)}
        title="Expand AI Director"
      >
        <span style={{
          fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        }}>
          AI Director
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        width: 310,
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.70)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background: biophilic building-inspired gradient */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `
            linear-gradient(
              170deg,
              rgba(180,215,235,0.75) 0%,
              rgba(200,230,215,0.65) 30%,
              rgba(215,235,200,0.60) 55%,
              rgba(196,180,152,0.45) 80%,
              rgba(210,230,205,0.55) 100%
            )
          `,
          backdropFilter: 'blur(0px)',
        }}
      />
      {/* Frosted glass overlay on messages area */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'rgba(255,255,255,0.38)', backdropFilter: 'blur(20px)' }} />

      {/* Header */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          height: 48,
          borderBottom: '1px solid rgba(255,255,255,0.75)',
          background: 'rgba(255,255,255,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16,
          paddingRight: 12,
          flexShrink: 0,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: streaming ? 'var(--amber)' : 'var(--accent)',
              boxShadow: `0 0 0 3px ${streaming ? 'rgba(184,124,74,0.20)' : 'rgba(46,125,90,0.20)'}`,
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)', fontWeight: 500 }}>
            AI Director
          </span>
          {streaming && <span style={{ fontSize: 9, color: 'var(--muted)' }}>thinking…</span>}
        </div>
        <button
          onClick={() => setCollapsed(true)}
          style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
        >
          ‹
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          position: 'relative', zIndex: 1,
          flex: 1, overflowY: 'auto',
          padding: '14px 12px 0',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {messages.map(m => (
          <ChatBubble key={m.id} message={m} onExecuteBMS={executeBMS} />
        ))}
        <div style={{ height: 14 }} />
      </div>

      {/* Quick commands */}
      <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)' }}>
        <QuickCommandChips onSelect={sendMessage} disabled={streaming} />
      </div>

      {/* Input */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          padding: '8px 12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.75)',
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          display: 'flex', gap: 6,
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          placeholder="Ask about zones, carbon, strategies…"
          disabled={streaming}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.70)',
            border: '1.5px solid rgba(255,255,255,0.90)',
            borderRadius: 12,
            padding: '7px 12px',
            fontSize: 12,
            color: 'var(--text)',
            outline: 'none',
            boxShadow: '0 1px 6px rgba(50,90,70,0.06)',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          style={{
            borderRadius: 12, border: 'none',
            padding: '7px 14px',
            background: streaming || !input.trim() ? 'rgba(26,43,34,0.08)' : 'linear-gradient(135deg, #4A9AA0, #2E7D5A)',
            color: streaming || !input.trim() ? 'var(--muted)' : 'white',
            cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 14,
            transition: 'all 0.2s',
            boxShadow: streaming || !input.trim() ? 'none' : '0 2px 10px rgba(46,125,90,0.30)',
            flexShrink: 0,
          }}
        >
          →
        </button>
      </div>
    </div>
  )
}
