'use client'
import { useState } from 'react'
import { AI_QUEUE } from '@/lib/mock-data'
import type { AIQueueItem } from '@/lib/types'
import DrillSheet from '@/components/layout/DrillSheet'
import AISheetBody from '@/components/ai/AISheetBody'

const PRIORITY_COLOR: Record<string, string> = {
  now:      'var(--lg-rust)',
  tonight:  'var(--lg-amber)',
  tomorrow: 'var(--lg-sky)',
}

const PRIORITY_BG: Record<string, string> = {
  now:      'rgba(181,96,75,0.08)',
  tonight:  'rgba(201,144,94,0.08)',
  tomorrow: 'rgba(132,182,204,0.08)',
}

function QueueTile({ item, onClick }: { item: AIQueueItem; onClick: () => void }) {
  const color = PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.now
  const bg = PRIORITY_BG[item.priority] || PRIORITY_BG.now

  return (
    <button
      onClick={onClick}
      className="glass-soft"
      style={{
        padding: '12px',
        textAlign: 'left',
        cursor: 'pointer',
        border: `1px solid ${color}30`,
        background: bg,
        borderRadius: 'var(--r-card-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'transform 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          padding: '2px 7px',
          borderRadius: 'var(--r-pill)',
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.10em',
          textTransform: 'uppercase' as const,
          color,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          fontFamily: 'var(--font-sans)',
        }}>
          {item.priority}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--lg-ink-35)' }}>
          {item.eta}
        </span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)', lineHeight: 1.3 }}>
        {item.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--lg-mint-deep)', fontFamily: 'var(--font-mono)' }}>
          −{item.impact_kwh} kWh
        </span>
        <span style={{ fontSize: 9, color: 'var(--lg-ink-35)' }}>·</span>
        <span style={{ fontSize: 10, color: 'var(--lg-mint-deep)', fontFamily: 'var(--font-mono)' }}>
          −{item.impact_kg} kg CO₂
        </span>
      </div>
    </button>
  )
}

export default function AIQueueCard() {
  const [selectedItem, setSelectedItem] = useState<AIQueueItem | null>(null)

  return (
    <>
      <div className="glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="label-eyebrow">AI Director Queue</div>
            <div style={{ fontSize: 11, color: 'var(--lg-ink-35)', marginTop: 2 }}>
              {AI_QUEUE.filter(q => q.priority === 'now').length} actions ready now
            </div>
          </div>
          {/* Mint dot */}
          <span
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--lg-mint-deep)',
              boxShadow: '0 0 0 3px rgba(63,127,102,0.20)',
              display: 'inline-block',
            }}
          />
        </div>

        {/* 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {AI_QUEUE.map(item => (
            <QueueTile key={item.id} item={item} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      </div>

      <DrillSheet
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title ?? ''}
        subtitle={`AI recommendation · ${selectedItem?.priority}`}
      >
        {selectedItem && (
          <AISheetBody
            item={selectedItem}
            onApprove={() => setSelectedItem(null)}
            onDismiss={() => setSelectedItem(null)}
          />
        )}
      </DrillSheet>
    </>
  )
}
