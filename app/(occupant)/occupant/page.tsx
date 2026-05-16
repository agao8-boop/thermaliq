// app/(occupant)/occupant/page.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import { ZONES, OCCUPANT_CONVO, OCCUPANT_QUICK, QUICK_CHIP_RESPONSES } from '@/lib/mock-data'
import GettingStarted from '@/components/occupant/GettingStarted'
import WearableFlow from '@/components/occupant/WearableFlow'

const ZONE = ZONES.find(z => z.id === 'z-001') ?? ZONES[0]
const USER_NAME = 'Mia'

const STATUS_COLOR: Record<string, string> = {
  OK:   'var(--lg-mint-deep)',
  WARN: 'var(--lg-amber)',
  HOT:  'var(--lg-rust)',
  COLD: 'var(--lg-sky)',
}

interface Msg { role: 'AI' | 'USER'; text: string; id: string; quiet?: boolean }

// Extend preset convo: first AI message + a second "all good" quiet message
const INITIAL_MESSAGES: Msg[] = [
  { role: 'AI', id: 'init-0', text: OCCUPANT_CONVO[0].text },
  {
    role: 'AI', id: 'init-quiet', quiet: true,
    text: 'Your current environment fully meets your comfort profile.',
  },
  ...OCCUPANT_CONVO.slice(1).map((m, i) => ({ role: m.role, text: m.text, id: `init-${i + 1}` })),
]

export default function OccupantPage() {
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('thermaliq-onboarded') === 'true'
  })
  const [showWearable, setShowWearable] = useState(false)
  const [messages, setMessages] = useState<Msg[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function handleContinue() {
    localStorage.setItem('thermaliq-onboarded', 'true')
    setOnboarded(true)
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return
    const userMsg: Msg = { role: 'USER', text: text.trim(), id: `u-${Date.now()}` }
    const aiId = `ai-${Date.now()}`

    // Check for quick chip preset response
    const preset = QUICK_CHIP_RESPONSES[text.trim()]
    if (preset) {
      setMessages(prev => [...prev, userMsg, { role: 'AI', text: preset, id: aiId }])
      setInput('')
      return
    }

    setMessages(prev => [...prev, userMsg, { role: 'AI', text: '', id: aiId }])
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
            const p = JSON.parse(data)
            if (p.text) setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: m.text + p.text } : m))
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: 'Connection error.' } : m))
    } finally {
      setStreaming(false)
    }
  }

  if (!onboarded) return <GettingStarted onContinue={handleContinue} />

  const color = STATUS_COLOR[ZONE.thermal_status] || STATUS_COLOR.WARN
  const delta = (ZONE.current_temp_f - ZONE.setpoint_f).toFixed(1)
  const deltaSign = ZONE.current_temp_f >= ZONE.setpoint_f ? '+' : ''

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Greeting */}
      <div style={{ paddingTop: 8 }}>
        <h1 style={{
          fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700,
          color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 4,
          textShadow: '0 1px 8px rgba(0,0,0,0.25)',
        }}>
          Hello, {USER_NAME}
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-sans)' }}>
          📍 {ZONE.name} · Floor {ZONE.floor} — auto-detected
        </p>
      </div>

      {/* ComfortHero */}
      <div
        className="glass"
        style={{ padding: '20px', background: `linear-gradient(155deg, ${color}20 0%, rgba(245,250,247,0.88) 60%)` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>
              {ZONE.thermal_status === 'WARN' ? 'A touch warm' :
               ZONE.thermal_status === 'HOT'  ? 'Too hot' :
               ZONE.thermal_status === 'COLD' ? 'Chilly' : 'Comfortable'}
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, color, fontFamily: 'var(--font-sans)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {ZONE.current_temp_f}<span style={{ fontSize: 22, fontWeight: 400 }}>°F</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--lg-ink-55)', marginTop: 6 }}>
              Setpoint {ZONE.setpoint_f}°F · {deltaSign}{delta}° delta
            </div>
          </div>
          {/* Comfort ring */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <svg width={72} height={72} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(36,51,51,0.08)" strokeWidth={7} />
                <circle cx={36} cy={36} r={28} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
                  strokeDasharray={`${(ZONE.comfort_index_pct / 100) * 2 * Math.PI * 28} 999`} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'var(--font-sans)' }}>{ZONE.comfort_index_pct}</span>
              </div>
            </div>
            <div style={{ fontSize: 9, color: 'var(--lg-ink-55)', marginTop: 4 }}>comfort</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {[
            { label: 'CO₂', value: `${ZONE.current_co2_ppm}`, unit: 'ppm', warn: ZONE.current_co2_ppm > 1000 },
            { label: 'Humidity', value: `${ZONE.current_humidity_pct}`, unit: '%', warn: false },
            { label: 'Occupancy', value: `${ZONE.current_occupancy_count}`, unit: 'ppl', warn: false },
          ].map(m => (
            <div key={m.label} style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.90)', borderRadius: 'var(--r-control)', textAlign: 'center' }}>
              <div className="label-eyebrow">{m.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, fontFamily: 'var(--font-mono)', color: m.warn ? 'var(--lg-amber)' : 'var(--lg-ink-deep)' }}>
                {m.value}<span style={{ fontSize: 9, fontWeight: 400, color: 'var(--lg-ink-55)', marginLeft: 2 }}>{m.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Status Banner (Alm) */}
      <div className="glass-soft" style={{ padding: '14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--lg-mint), var(--lg-mint-deep))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(63,127,102,0.30)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'var(--font-sans)' }}>A</span>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--lg-mint-deep)', marginBottom: 4, fontFamily: 'var(--font-sans)' }}>Alm — active</div>
          <div style={{ fontSize: 12, color: 'var(--lg-ink-70)', lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}>
            {OCCUPANT_CONVO[0].text}
          </div>
        </div>
      </div>

      {/* Wearable section */}
      {showWearable ? (
        <WearableFlow onDismiss={() => setShowWearable(false)} />
      ) : (
        <button
          onClick={() => setShowWearable(true)}
          className="glass-soft"
          style={{
            padding: '13px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', textAlign: 'left',
            border: '1px solid rgba(255,255,255,0.85)',
            borderRadius: 'var(--r-card-sm)',
          }}
        >
          <span style={{ fontSize: 20 }}>⌚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)' }}>Connect Wearable</div>
            <div style={{ fontSize: 10, color: 'var(--lg-ink-55)' }}>Personalise comfort with biometrics</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--lg-mint-deep)', fontFamily: 'var(--font-sans)' }}>Set up →</span>
        </button>
      )}

      {/* Chat thread */}
      <div className="glass" style={{ display: 'flex', flexDirection: 'column', padding: '14px', overflow: 'hidden' }}>
        <div className="label-eyebrow" style={{ marginBottom: 12 }}>Conversation with Alm</div>
        <div ref={scrollRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
          {messages.map(m => (
            <div key={m.id} style={{ alignSelf: m.role === 'USER' ? 'flex-end' : 'flex-start', maxWidth: '84%' }}>
              <div style={{
                padding: '9px 13px',
                borderRadius: m.role === 'USER' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: m.role === 'USER' ? 'linear-gradient(135deg, var(--lg-mint), var(--lg-mint-deep))' : 'rgba(255,255,255,0.75)',
                color: m.role === 'USER' ? 'white' : 'var(--lg-ink)',
                fontSize: 12, lineHeight: 1.5, fontFamily: 'var(--font-sans)',
                border: m.role === 'AI' ? '1px solid var(--lg-ink-08)' : 'none',
                boxShadow: m.role === 'USER' ? '0 4px 12px rgba(63,127,102,0.25)' : 'none',
              }}>
                {m.text}{m.text === '' && streaming && <span style={{ opacity: 0.4 }}>●</span>}
              </div>
              {/* iMessage-style "Delivered Quietly" label for quiet AI messages */}
              {m.quiet && m.role === 'AI' && (
                <div style={{
                  fontSize: 9, color: 'var(--lg-ink-35)',
                  marginTop: 3, paddingLeft: 2,
                  fontFamily: 'var(--font-sans)',
                  fontStyle: 'italic',
                }}>
                  Delivered Quietly
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
        {OCCUPANT_QUICK.map(q => (
          <button key={q.id} onClick={() => sendMessage(q.label)} disabled={streaming}
            style={{
              padding: '7px 14px', borderRadius: 'var(--r-pill)',
              border: '1px solid rgba(255,255,255,0.70)',
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
              color: 'var(--lg-ink-deep)', fontSize: 12, cursor: streaming ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
            }}>
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
          placeholder="Describe how you feel…"
          disabled={streaming}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.80)',
            border: '1px solid var(--lg-stroke)', borderRadius: 'var(--r-pill)',
            padding: '10px 18px', fontSize: 12, fontFamily: 'var(--font-sans)',
            color: 'var(--lg-ink)', outline: 'none',
            boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset',
          }}
        />
        <button onClick={() => sendMessage(input)} disabled={streaming || !input.trim()}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: streaming || !input.trim() ? 'var(--lg-ink-08)' : 'linear-gradient(180deg, var(--lg-mint), var(--lg-mint-deep))',
            color: streaming || !input.trim() ? 'var(--lg-ink-35)' : 'white',
            cursor: streaming || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: streaming || !input.trim() ? 'none' : '0 4px 12px rgba(63,127,102,0.35)',
          }}
        >→</button>
      </div>
    </div>
  )
}
