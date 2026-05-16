'use client'
import { useState } from 'react'
import { AI_QUEUE } from '@/lib/mock-data'
import type { AIQueueItem } from '@/lib/types'
import Modal from '@/components/layout/Modal'
import AISheetBody from '@/components/ai/AISheetBody'

const PRIORITY_COLOR: Record<string, string> = {
  now:      'var(--lg-rust)',
  tonight:  'var(--lg-amber)',
  tomorrow: 'var(--lg-sky)',
}

const PRIORITY_BG: Record<string, string> = {
  now:      'rgba(181,96,75,0.06)',
  tonight:  'rgba(201,144,94,0.06)',
  tomorrow: 'rgba(132,182,204,0.06)',
}

const CUSTOM_FUNCTIONS = [
  { icon: '🌿', label: 'NbS Irrigation Schedule', desc: 'Auto-irrigate based on forecast' },
  { icon: '🌙', label: 'Night Flush Automation', desc: 'Enable rule-based night flush' },
  { icon: '📊', label: 'Carbon Report', desc: 'Weekly summary to your inbox' },
  { icon: '+',  label: 'Add Custom Function', desc: 'Build your own automation', add: true },
]

function QueueRow({ item, onClick }: { item: AIQueueItem; onClick: () => void }) {
  const color = PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.now
  const bg    = PRIORITY_BG[item.priority]    || PRIORITY_BG.now
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '12px 14px',
        background: bg,
        border: `1px solid ${color}25`,
        borderRadius: 'var(--r-card-sm)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'transform 0.12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(2px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            padding: '2px 8px', borderRadius: 'var(--r-pill)',
            fontSize: 8, fontWeight: 700, letterSpacing: '0.10em',
            textTransform: 'uppercase' as const,
            color, background: `${color}18`, border: `1px solid ${color}30`,
          }}>{item.priority}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--lg-ink-35)' }}>eta {item.eta}</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)' }}>
          {item.title}
        </div>
        <div style={{ fontSize: 10, color: 'var(--lg-ink-55)', marginTop: 3 }}>
          −{item.impact_kwh} kWh · −{item.impact_kg} kg CO₂
        </div>
      </div>
      <span style={{ fontSize: 14, color: 'var(--lg-ink-35)' }}>›</span>
    </button>
  )
}

export default function AIQueueCard() {
  const [selected, setSelected] = useState<AIQueueItem | null>(null)

  return (
    <>
      <div className="glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div className="label-eyebrow">Alm's Action Queue</div>
            <div style={{ fontSize: 11, color: 'var(--lg-ink-35)', marginTop: 2 }}>
              {AI_QUEUE.filter(q => q.priority === 'now').length} ready now
            </div>
          </div>
          <span className="status-dot status-dot--ok" />
        </div>

        {/* 4-block single-column */}
        {AI_QUEUE.map(item => (
          <QueueRow key={item.id} item={item} onClick={() => setSelected(item)} />
        ))}

        {/* Thin "Add Function" customisation strip */}
        <div style={{ marginTop: 6, borderTop: '1px solid var(--lg-ink-08)', paddingTop: 12 }}>
          <div className="label-eyebrow" style={{ marginBottom: 8 }}>Customise</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {CUSTOM_FUNCTIONS.map(f => (
              <button
                key={f.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 'var(--r-control)',
                  border: f.add ? '1.5px dashed var(--lg-ink-15)' : '1px solid var(--lg-ink-08)',
                  background: f.add ? 'transparent' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.70)')}
                onMouseLeave={e => (e.currentTarget.style.background = f.add ? 'transparent' : 'rgba(255,255,255,0.45)')}
              >
                <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center' }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: f.add ? 'var(--lg-mint-deep)' : 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--lg-ink-35)' }}>{f.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        subtitle={`Alm recommendation · ${selected?.priority}`}
        width={480}
      >
        {selected && (
          <AISheetBody
            item={selected}
            onApprove={() => setSelected(null)}
            onDismiss={() => setSelected(null)}
          />
        )}
      </Modal>
    </>
  )
}
