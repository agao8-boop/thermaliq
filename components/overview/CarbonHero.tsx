'use client'
import { useState } from 'react'
import { KPI, CARBON_SERIES_14D, CARBON_TARGET, LOAD_STACK } from '@/lib/mock-data'

type Range = '7D' | '30D' | 'YTD'

const RANGE_DATA: Record<Range, { avoided: number; baseline: number; label: string }> = {
  '7D':  { avoided: 8.4,  baseline: 14.2, label: '7-day' },
  '30D': { avoided: 41.8, baseline: 68.2, label: '30-day' },
  'YTD': { avoided: 41.8, baseline: 68.2, label: 'Year to date' },
}

// Radial progress ring
function ProgressRing({ pct }: { pct: number }) {
  const r = 80
  const stroke = 10
  const norm = r - stroke / 2
  const circ = 2 * Math.PI * norm
  const dash = (pct / 100) * circ

  return (
    <svg width={180} height={180} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={90} cy={90} r={norm}
        fill="none" stroke="rgba(36,51,51,0.08)" strokeWidth={stroke}
      />
      <circle cx={90} cy={90} r={norm}
        fill="none"
        stroke="url(#mintGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)' }}
      />
      <defs>
        <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7DB8A1" />
          <stop offset="100%" stopColor="#3F7F66" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Mini sparkline for 14d carbon series
function Sparkline() {
  const vals = CARBON_SERIES_14D
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const W = 120, H = 28
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W
    const y = H - ((v - min) / (max - min + 0.0001)) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke="var(--lg-mint-deep)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line x1={0} y1={H} x2={W} y2={H} stroke="var(--lg-ink-08)" strokeWidth={1} />
    </svg>
  )
}

export default function CarbonHero() {
  const [range, setRange] = useState<Range>('30D')
  const d = RANGE_DATA[range]
  const pct = Math.round((d.avoided / d.baseline) * 100)
  const savedPct = Math.round(((d.baseline - d.avoided) / d.baseline) * 100)

  return (
    <div
      className="glass"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="label-eyebrow">Carbon avoided</div>
          <div style={{ fontSize: 11, color: 'var(--lg-ink-35)', marginTop: 2 }}>{d.label}</div>
        </div>
        {/* 7D / 30D / YTD toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(36,51,51,0.06)', borderRadius: 'var(--r-pill)', padding: 3 }}>
          {(['7D', '30D', 'YTD'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--r-pill)',
                border: 'none',
                fontSize: 11,
                fontFamily: 'var(--font-sans)',
                fontWeight: r === range ? 600 : 400,
                background: r === range ? 'rgba(255,255,255,0.90)' : 'transparent',
                color: r === range ? 'var(--lg-ink-deep)' : 'var(--lg-ink-55)',
                cursor: 'pointer',
                boxShadow: r === range ? '0 1px 4px rgba(31,53,52,0.12)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Ring + number */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
        <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
          <ProgressRing pct={pct} />
          {/* Centre text */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: 'var(--lg-mint-deep)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {d.avoided}
            </div>
            <div style={{ fontSize: 10, color: 'var(--lg-ink-55)', marginTop: 2 }}>t CO₂e</div>
          </div>
        </div>

        {/* Right stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0, justifyContent: 'space-between', minHeight: 160 }}>
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>vs. baseline</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em' }}>
              {d.baseline} t
            </div>
            <div style={{ fontSize: 11, color: 'var(--lg-mint-deep)' }}>
              −{savedPct}% reduction
            </div>
          </div>

          <div>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>14-day trend</div>
            <Sparkline />
          </div>

          <div>
            <div className="label-eyebrow" style={{ marginBottom: 4 }}>Today's rate</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--lg-mint-deep)' }}>
                {KPI.carbon_avoided_kg_m2.toFixed(4)}
              </span>
              <span style={{ fontSize: 10, color: 'var(--lg-ink-35)' }}>kg/m² · target {KPI.carbon_target_kg_m2.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Load split bar */}
      <div>
        <div className="label-eyebrow" style={{ marginBottom: 6 }}>Today's load split</div>
        {(() => {
          const today = LOAD_STACK[LOAD_STACK.length - 1]
          const total = today.passive + today.nbs + today.active
          const passivePct = (today.passive / total * 100).toFixed(0)
          const nbsPct = (today.nbs / total * 100).toFixed(0)
          const activePct = (today.active / total * 100).toFixed(0)
          return (
            <>
              <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', gap: 1, background: 'rgba(36,51,51,0.08)' }}>
                <div style={{ width: `${passivePct}%`, background: 'var(--lg-mint-deep)', transition: 'width 0.5s' }} />
                <div style={{ width: `${nbsPct}%`, background: 'var(--lg-teal)', transition: 'width 0.5s' }} />
                <div style={{ width: `${activePct}%`, background: 'rgba(36,51,51,0.20)', transition: 'width 0.5s' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                {[
                  { label: 'Passive', value: `${today.passive} kWh`, color: 'var(--lg-mint-deep)' },
                  { label: 'NbS', value: `${today.nbs} kWh`, color: 'var(--lg-teal)' },
                  { label: 'Active HVAC', value: `${today.active} kWh`, color: 'var(--lg-ink-35)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 9, color: 'var(--lg-ink-55)' }}>{item.label}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
