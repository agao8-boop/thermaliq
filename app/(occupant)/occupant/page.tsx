'use client'
import { useState, useRef, useEffect } from 'react'
import { ZONES, OCCUPANT_CONVO, OCCUPANT_QUICK } from '@/lib/mock-data'

// Hard-coded zone z-001 — auto-detected via Bluetooth beacon
const ZONE = ZONES.find(z => z.id === 'z-001') ?? ZONES[0]
const USER_NAME = 'Mia'

const STATUS_COLOR: Record<string, string> = {
  OK:   'var(--lg-mint-deep)',
  WARN: 'var(--lg-amber)',
  HOT:  'var(--lg-rust)',
  COLD: 'var(--lg-sky)',
}

interface ConvoMsg { role: 'AI' | 'USER'; text: string; id: string }

export default function OccupantPage() {
  // Start with the pre-existing thread from mock data
  const [messages, setMessages] = useState<ConvoMsg[]>(
    OCCUPANT_CONVO.map((m, i) => ({ ...m, id: `init-${i}` }))
  )
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return

    const userMsg: ConvoMsg = { role: 'USER', text: text.trim(), id: `u-${Date.now()}` }
    const aiMsgId = `ai-${Date.now()}`

    setMessages(prev => [...prev, userMsg, { role: 'AI', text: '', id: aiMsgId }])
    setInput('')
    setStreaming(true)

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.text })),
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
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, text: m.text + parsed.text } : m)
              )
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, text: 'Connection error. Please try again.' } : m)
      )
    } finally {
      setStreaming(false)
    }
  }

  const color = STATUS_COLOR[ZONE.thermal_status] || STATUS_COLOR.WARN
  const delta = (ZONE.current_temp_f - ZONE.setpoint_f).toFixed(1)
  const deltaSign = ZONE.current_temp_f >= ZONE.setpoint_f ? '+' : ''

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '28px 0 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Greeting */}
      <div>
        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--lg-ink-deep)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 4,
        }}>
          Hello, {USER_NAME}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--lg-ink-55)', fontFamily: 'var(--font-sans)' }}>
          📍 {ZONE.name} · Floor {ZONE.floor} — auto-detected
        </p>
      </div>

      {/* ComfortHero */}
      <div
        className="glass"
        style={{
          padding: '20px',
          background: `linear-gradient(155deg, ${color}18 0%, rgba(255,255,255,0.78) 60%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>
              {ZONE.thermal_status === 'WARN' ? 'A bit warm' :
               ZONE.thermal_status === 'HOT'  ? 'Too hot' :
               ZONE.thermal_status === 'COLD' ? 'Chilly' : 'Comfortable'}
            </div>
            <div style={{
              fontSize: 56,
              fontWeight: 700,
              color,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}>
              {ZONE.current_temp_f}
              <span style={{ fontSize: 22, fontWeight: 400 }}>°F</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--lg-ink-55)', marginTop: 6 }}>
              Setpoint {ZONE.setpoint_f}°F · {deltaSign}{delta}° above target
            </div>
          </div>

          {/* Comfort ring */}
          <div style={{ textAlign: 'center' }}>
            <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(36,51,51,0.08)" strokeWidth={7} />
              <circle
                cx={36} cy={36} r={28}
                fill="none"
                stroke={color}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={`${(ZONE.comfort_index_pct / 100) * 2 * Math.PI * 28} 999`}
              />
            </svg>
            <div style={{
              marginTop: -46,
              fontSize: 16,
              fontWeight: 700,
              color,
              fontFamily: 'var(--font-sans)',
              textAlign: 'center',
            }}>
              {ZONE.comfort_index_pct}
            </div>
            <div style={{ marginTop: 30, fontSize: 9, color: 'var(--lg-ink-55)' }}>comfort</div>
          </div>
        </div>

        {/* Sub metrics */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {[
            { label: 'CO₂', value: `${ZONE.current_co2_ppm}`, unit: 'ppm', warn: ZONE.current_co2_ppm > 1000 },
            { label: 'Humidity', value: `${ZONE.current_humidity_pct}`, unit: '%', warn: false },
            { label: 'Occupancy', value: `${ZONE.current_occupancy_count}`, unit: 'people', warn: false },
          ].map(m => (
            <div
              key={m.label}
              style={{
                flex: 1, padding: '8px 10px',
                background: 'rgba(255,255,255,0.60)',
                border: '1px solid rgba(255,255,255,0.90)',
                borderRadius: 'var(--r-control)',
                textAlign: 'center',
              }}
            >
              <div className="label-eyebrow">{m.label}</div>
              <div style={{
                fontSize: 14, fontWeight: 600, marginTop: 2,
                fontFamily: 'var(--font-mono)',
                color: m.warn ? 'var(--lg-amber)' : 'var(--lg-ink-deep)',
              }}>
                {m.value}
                <span style={{ fontSize: 9, fontWeight: 400, color: 'var(--lg-ink-55)', marginLeft: 2 }}>{m.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Status Banner */}
      <div
        className="glass-soft"
        style={{ padding: '14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}
      >
        {/* 34px mint avatar */}
        <div
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--lg-mint), var(--lg-mint-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(63,127,102,0.30)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'var(--font-sans)' }}>A</span>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lg-mint-deep)', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>
            AI Director — working on it
          </div>
          <div style={{ fontSize: 12, color: 'var(--lg-ink-70)', lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}>
            {OCCUPANT_CONVO[0].text}
          </div>
        </div>
      </div>

      {/* Chat thread */}
      <div
        className="glass"
        style={{ display: 'flex', flexDirection: 'column', padding: '14px', gap: 0, overflow: 'hidden' }}
      >
        <div className="label-eyebrow" style={{ marginBottom: 12 }}>Conversation</div>
        <div
          ref={scrollRef}
          style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            maxHeight: 280, overflowY: 'auto',
          }}
        >
          {messages.map(m => (
            <div
              key={m.id}
              style={{
                alignSelf: m.role === 'USER' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
              }}
            >
              <div
                style={{
                  padding: '9px 13px',
                  borderRadius: m.role === 'USER' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'USER'
                    ? 'linear-gradient(135deg, var(--lg-mint), var(--lg-mint-deep))'
                    : 'rgba(255,255,255,0.72)',
                  color: m.role === 'USER' ? 'white' : 'var(--lg-ink)',
                  fontSize: 12,
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-sans)',
                  border: m.role === 'AI' ? '1px solid var(--lg-ink-08)' : 'none',
                  boxShadow: m.role === 'USER' ? '0 4px 12px rgba(63,127,102,0.25)' : 'none',
                }}
              >
                {m.text}
                {m.text === '' && streaming && (
                  <span style={{ opacity: 0.5 }}>●</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick feedback chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {OCCUPANT_QUICK.map(q => (
          <button
            key={q.id}
            onClick={() => sendMessage(q.label)}
            disabled={streaming}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--r-pill)',
              border: '1px solid var(--lg-ink-15)',
              background: 'rgba(255,255,255,0.70)',
              color: 'var(--lg-ink-70)',
              fontSize: 12,
              cursor: streaming ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.15s',
            }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Text input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          placeholder="Describe how you feel…"
          disabled={streaming}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.80)',
            border: '1px solid var(--lg-stroke)',
            borderRadius: 'var(--r-pill)',
            padding: '10px 18px',
            fontSize: 12,
            fontFamily: 'var(--font-sans)',
            color: 'var(--lg-ink)',
            outline: 'none',
            boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          style={{
            width: 38, height: 38,
            borderRadius: '50%',
            border: 'none',
            background: streaming || !input.trim()
              ? 'var(--lg-ink-08)'
              : 'linear-gradient(180deg, var(--lg-mint), var(--lg-mint-deep))',
            color: streaming || !input.trim() ? 'var(--lg-ink-35)' : 'white',
            cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: streaming || !input.trim() ? 'none' : '0 4px 12px rgba(63,127,102,0.35)',
            transition: 'all 0.15s',
          }}
          aria-label="Send"
        >
          →
        </button>
      </div>
    </div>
  )
}
