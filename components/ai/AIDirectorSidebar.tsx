'use client'
import { useState, useRef, useEffect } from 'react'
import { ChatMessage, BMSCommand } from '@/lib/types'
import { ALMS_PRESETS } from '@/lib/mock-data'
import ChatBubble from './ChatBubble'

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'AI',
  mode: 'ADMIN',
  content: `I'm Alm, your native AI agent for thermal comfort and building efficiency at Meridian Tower.\n\nEast Open Plan is running 3.2° above setpoint — evaporative pre-cool queued. Green Roof moisture at 28% — irrigation recommended. Everything else is stable.\n\nHow can I help?`,
  created_at: new Date().toISOString(),
}

export default function AIDirectorSidebar() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`, role: 'USER', mode: 'ADMIN',
      content: text.trim(), created_at: new Date().toISOString(),
    }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')

    // Preset match
    const preset = ALMS_PRESETS.find(p => p.q === text.trim())
    if (preset) {
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`, role: 'AI', mode: 'ADMIN',
        content: preset.a, created_at: new Date().toISOString(),
      }])
      return
    }

    setStreaming(true)
    const aiId = `ai-${Date.now()}`
    setMessages(prev => [...prev, { id: aiId, role: 'AI', mode: 'ADMIN', content: '', created_at: new Date().toISOString() }])
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
            const p = JSON.parse(data)
            if (p.text) setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + p.text } : m))
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: '[Connection error]' } : m))
      }
    } finally {
      setStreaming(false)
    }
  }

  async function executeBMS(cmd: BMSCommand) {
    try {
      await fetch('/api/bms/write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) })
      setMessages(prev => [...prev, { id: `confirm-${Date.now()}`, role: 'AI', mode: 'ADMIN', content: `✓ BMS command sent: ${cmd.bms_command} → ${cmd.target_id}`, created_at: new Date().toISOString() }])
    } catch { /* silent */ }
  }

  if (collapsed) {
    return (
      <div onClick={() => setCollapsed(false)} style={{ width: 40, flexShrink: 0, borderRight: '1px solid var(--lg-ink-08)', background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, cursor: 'pointer' }}>
        <span style={{ fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lg-ink-55)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Alm</span>
      </div>
    )
  }

  const showPresets = messages.length <= 1

  return (
    <div style={{ width: 296, flexShrink: 0, borderRight: '1px solid var(--lg-ink-08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(28px) saturate(1.5)', WebkitBackdropFilter: 'blur(28px) saturate(1.5)' }}>
      {/* Orb accent */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(142,197,168,0.20) 0%, transparent 70%), radial-gradient(ellipse 60% 30% at 20% 100%, rgba(106,173,184,0.12) 0%, transparent 70%)' }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px 12px', borderBottom: '1px solid var(--lg-ink-08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lg-mint), var(--lg-mint-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(63,127,102,0.35)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lg-ink-deep)', lineHeight: 1 }}>Alm</div>
            <div style={{ fontSize: 10, color: 'var(--lg-ink-55)', marginTop: 2 }}>{streaming ? '● thinking…' : '● active'}</div>
          </div>
        </div>
        <button onClick={() => setCollapsed(true)} style={{ color: 'var(--lg-ink-35)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '0 2px' }}>‹</button>
      </div>

      {/* Preset Q&A chips */}
      {showPresets && (
        <div style={{ position: 'relative', zIndex: 1, padding: '10px 12px 0', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {ALMS_PRESETS.map(p => (
            <button
              key={p.q}
              onClick={() => sendMessage(p.q)}
              className="glass-soft"
              style={{ border: '1px solid var(--lg-ink-08)', textAlign: 'left', padding: '8px 12px', fontSize: 11, color: 'var(--lg-ink-70)', cursor: 'pointer', borderRadius: 'var(--r-card-sm)', fontFamily: 'var(--font-sans)' }}
            >
              {p.q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(m => <ChatBubble key={m.id} message={m} onExecuteBMS={executeBMS} />)}
        <div style={{ height: 12 }} />
      </div>

      {/* Input */}
      <div style={{ position: 'relative', zIndex: 1, padding: '10px 12px 14px', borderTop: '1px solid var(--lg-ink-08)', display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          placeholder="Ask Alm…"
          disabled={streaming}
          style={{ flex: 1, background: 'rgba(255,255,255,0.75)', border: '1px solid var(--lg-stroke)', borderRadius: 'var(--r-pill)', padding: '8px 14px', fontSize: 12, fontFamily: 'var(--font-sans)', color: 'var(--lg-ink)', outline: 'none' }}
        />
        <button onClick={() => sendMessage(input)} disabled={streaming || !input.trim()}
          style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: streaming || !input.trim() ? 'var(--lg-ink-08)' : 'linear-gradient(180deg, var(--lg-mint), var(--lg-mint-deep))', color: streaming || !input.trim() ? 'var(--lg-ink-35)' : 'white', cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer', fontSize: 14, flexShrink: 0, boxShadow: streaming || !input.trim() ? 'none' : '0 4px 10px rgba(63,127,102,0.40)' }}>
          →
        </button>
      </div>
    </div>
  )
}
