'use client'
import { ZONES } from '@/lib/mock-data'
import { Zone } from '@/lib/types'

interface Props {
  selectedId: string
  onChange: (id: string) => void
}

export default function ZonePicker({ selectedId, onChange }: Props) {
  return (
    <div>
      <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
        Your Work Area
      </label>
      <div className="flex flex-wrap gap-2">
        {ZONES.map(z => {
          const active = z.id === selectedId
          return (
            <button
              key={z.id}
              onClick={() => onChange(z.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1.5px solid ${active ? 'var(--accent)' : 'rgba(26,43,34,0.15)'}`,
                background: active ? 'rgba(46,125,90,0.12)' : 'rgba(255,255,255,0.50)',
                color: active ? 'var(--accent)' : 'var(--muted)',
                fontSize: 12,
                fontWeight: active ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {z.name}
              <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.7 }}>Fl.{z.floor}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
