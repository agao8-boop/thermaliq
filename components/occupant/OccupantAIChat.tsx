'use client'
import { useState, useRef, useEffect } from 'react'

interface Message { id: string; role: 'USER' | 'AI'; content: string }

const QUICK_PROMPTS = [
  { label: '🥵 Too Warm', prompt: "It's too warm at my desk right now." },
  { label: '🥶 Too Cold', prompt: "My area feels cold." },
  { label: '💨 Stuffy Air', prompt: "The air feels stuffy and stale." },
  { label: '🌿 Air Quality', prompt: "How's the air quality in my zone today?" },
  { label: '⌚ Wearable', prompt: "How does the wearable integration work?" },
]

const INITIAL: Message = {
  id: 'init',
  role: 'AI',
  content: `Hi! I'm your personal comfort assistant for Meridian Tower. 😊

Your zone is currently comfortable, with temperature tracking close to target.

How are you feeling? You can tell me if you're too warm, too cold, or have any air quality concerns — I'll handle the rest.`,
}

export default function OccupantAIChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'USER', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setStreaming(true)

    const aiId = `ai-${Date.now()}`
    setMessages(prev => [...prev, { id: aiId, role: 'AI', content: '' }])

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          mode: 'OCCUPANT',
        }),
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
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + parsed.text } : m))
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: 'Sorry, I had trouble connecting. Please try again.' } : m))
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div
      className="glass"
      style={{ borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', minHeight: 400 }}
    >
      {/* Header */}
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid rgba(26,43,34,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
              background: streaming ? 'var(--amber)' : 'var(--accent)',
              boxShadow: `0 0 0 3px ${streaming ? 'rgba(184,124,74,0.20)' : 'rgba(46,125,90,0.20)'}`,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Comfort Assistant</span>
          {streaming && <span style={{ fontSize: 10, color: 'var(--muted)' }}>thinking…</span>}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'AI' ? 'flex-start' : 'flex-end' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3, padding: '0 4px' }}>
              {m.role === 'AI' ? 'Assistant' : 'You'}
            </div>
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: m.role === 'AI' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                background: m.role === 'AI' ? 'rgba(255,255,255,0.75)' : 'rgba(46,125,90,0.12)',
                border: m.role === 'AI' ? '1px solid rgba(255,255,255,0.90)' : '1px solid rgba(46,125,90,0.22)',
                fontSize: 12,
                lineHeight: 1.6,
                color: 'var(--text)',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 1px 8px rgba(50,90,70,0.06)',
              }}
            >
              {m.content}
              {m.role === 'AI' && m.content === '' && streaming && (
                <span style={{ opacity: 0.5 }}>●●●</span>
              )}
            </div>
          </div>
        ))}
        <div style={{ height: 4 }} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(26,43,34,0.08)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {QUICK_PROMPTS.map(q => (
          <button
            key={q.label}
            onClick={() => send(q.prompt)}
            disabled={streaming}
            style={{
              fontSize: 10, padding: '4px 10px', borderRadius: 12,
              border: '1px solid rgba(26,43,34,0.12)',
              background: 'rgba(255,255,255,0.60)',
              color: 'var(--muted)',
              cursor: streaming ? 'not-allowed' : 'pointer',
              opacity: streaming ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 16px 16px', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder="Tell me how you feel…"
          disabled={streaming}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.65)',
            border: '1.5px solid rgba(255,255,255,0.85)',
            borderRadius: 12,
            padding: '8px 14px',
            fontSize: 12,
            color: 'var(--text)',
            outline: 'none',
            boxShadow: '0 1px 6px rgba(50,90,70,0.06)',
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={streaming || !input.trim()}
          style={{
            padding: '8px 16px', borderRadius: 12,
            border: 'none',
            background: streaming || !input.trim() ? 'rgba(26,43,34,0.08)' : 'linear-gradient(135deg, #4A9AA0, #2E7D5A)',
            color: streaming || !input.trim() ? 'var(--muted)' : 'white',
            cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 13,
            transition: 'all 0.2s',
            boxShadow: streaming || !input.trim() ? 'none' : '0 2px 10px rgba(46,125,90,0.30)',
          }}
        >
          →
        </button>
      </div>
    </div>
  )
}
