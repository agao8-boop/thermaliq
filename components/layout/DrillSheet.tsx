'use client'
import { useEffect, useRef, ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: number
}

export default function DrillSheet({ open, onClose, title, subtitle, children, width = 400 }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus trap + Esc close
  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(27,42,42,0.08)',
          backdropFilter: 'blur(2px)',
          zIndex: 100,
        }}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="lg-sheet"
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width,
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--lg-white-hi)',
          backdropFilter: 'blur(32px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
          borderLeft: '1px solid var(--lg-stroke)',
          boxShadow: '-20px 0 60px rgba(31,53,52,0.12)',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--lg-ink-08)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--lg-ink-deep)',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                fontSize: 11,
                color: 'var(--lg-ink-55)',
                marginTop: 4,
                fontFamily: 'var(--font-sans)',
              }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              border: '1px solid var(--lg-ink-15)',
              background: 'rgba(255,255,255,0.70)',
              color: 'var(--lg-ink-55)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
              flexShrink: 0,
              marginTop: 2,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 32px' }}>
          {children}
        </div>
      </div>
    </>
  )
}
