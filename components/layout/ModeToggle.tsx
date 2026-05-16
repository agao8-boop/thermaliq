'use client'
import { useMode, AppMode } from '@/lib/mode-context'
import { useRouter } from 'next/navigation'

export default function ModeToggle() {
  const { mode, setMode } = useMode()
  const router = useRouter()

  function switchTo(m: AppMode) {
    setMode(m)
    router.push(m === 'MANAGER' ? '/zones' : '/occupant')
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.50)',
        border: '1px solid rgba(255,255,255,0.85)',
        borderRadius: 100,
        padding: '3px 4px',
        gap: 2,
        backdropFilter: 'blur(8px)',
      }}
    >
      {(['OCCUPANT', 'MANAGER'] as AppMode[]).map(m => {
        const active = mode === m
        return (
          <button
            key={m}
            onClick={() => switchTo(m)}
            style={{
              padding: '4px 14px',
              borderRadius: 100,
              border: 'none',
              fontSize: 11,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: active ? 500 : 400,
              letterSpacing: '0.03em',
              color: active ? 'white' : 'var(--muted)',
              background: active
                ? m === 'OCCUPANT'
                  ? 'linear-gradient(135deg, #4A9AA0, #2E7D5A)'
                  : 'linear-gradient(135deg, #2E7D5A, #1A5C3A)'
                : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: active ? '0 1px 8px rgba(46,125,90,0.30)' : 'none',
            }}
          >
            {m === 'OCCUPANT' ? 'My Comfort' : 'Manager'}
          </button>
        )
      })}
    </div>
  )
}
