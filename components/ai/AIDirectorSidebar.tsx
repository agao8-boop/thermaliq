'use client'
import { useState, useRef, useEffect } from 'react'
import { ChatMessage, BMSCommand } from '@/lib/types'
import ChatBubble from './ChatBubble'
import QuickCommandChips from './QuickCommandChips'

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'AI',
  mode: 'ADMIN',
  content: `Good morning. I'm monitoring Meridian Tower across 6 zones.\n\nCurrent alerts:\n• East Open Plan is running HOT at 78.2°F — 2.2° above setpoint\n• Green Roof soil moisture at 28% — irrigation recommended\n• Roof Terrace at 83.4°F with high occupancy\n\nI'm ready to assist with thermal optimization, carbon management, or BMS commands.`,
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
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'AI',
      mode: 'ADMIN',
      content: '',
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, aiMsg])

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
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
                prev.map(m =>
                  m.id === aiMsgId ? { ...m, content: m.content + parsed.text } : m
                )
              )
            }
            if (parsed.error) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === aiMsgId ? { ...m, content: `[Error: ${parsed.error}]` } : m
                )
              )
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiMsgId ? { ...m, content: '[Connection error — check console]' } : m
          )
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
      const confirmMsg: ChatMessage = {
        id: `confirm-${Date.now()}`,
        role: 'AI',
        mode: 'ADMIN',
        content: `✓ BMS command executed: ${cmd.bms_command} → ${cmd.target_id}${cmd.value !== undefined ? ` = ${cmd.value}` : ''}`,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, confirmMsg])
    } catch {
      // silent fail
    }
  }

  if (collapsed) {
    return (
      <div
        style={{
          width: 36,
          borderRight: '1px solid var(--rule)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 12,
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => setCollapsed(false)}
        title="Expand AI Director"
      >
        <span style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          AI Director
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        width: 320,
        flexShrink: 0,
        borderRight: '1px solid var(--rule)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 44,
          borderBottom: '1px solid var(--rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 16,
          paddingRight: 12,
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: streaming ? 'var(--amber)' : 'var(--accent)', animation: streaming ? 'pulse 1s infinite' : undefined }}
          />
          <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)' }}>
            AI Director
          </span>
          {streaming && (
            <span style={{ fontSize: 9, color: 'var(--muted)' }}>thinking…</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(true)}
          style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
          title="Collapse"
        >
          ‹
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 overflow-y-auto flex-1"
        style={{ padding: '12px 12px 0' }}
      >
        {messages.map(m => (
          <ChatBubble key={m.id} message={m} onExecuteBMS={executeBMS} />
        ))}
        {/* Bottom padding */}
        <div style={{ height: 12 }} />
      </div>

      {/* Quick commands */}
      <QuickCommandChips onSelect={sendMessage} disabled={streaming} />

      {/* Input */}
      <div
        style={{
          padding: '8px 12px 12px',
          borderTop: '1px solid var(--rule)',
          display: 'flex',
          gap: 6,
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
            background: 'var(--surface)',
            border: '1px solid var(--rule)',
            borderRadius: 4,
            padding: '6px 10px',
            fontSize: 12,
            color: 'var(--text)',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          style={{
            fontFamily: 'Azeret Mono, monospace',
            fontSize: 11,
            padding: '6px 12px',
            borderRadius: 4,
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            background: 'rgba(46,255,150,0.08)',
            cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: streaming || !input.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          →
        </button>
      </div>
    </div>
  )
}
