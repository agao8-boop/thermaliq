// components/layout/Modal.tsx
'use client'
import { useEffect, useRef, ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: number | string
}

export default function Modal({ open, onClose, title, subtitle, children, width = 520 }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trapFocus)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keydown', trapFocus)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(27,42,42,0.22)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          position: 'relative', zIndex: 1,
          width, maxWidth: '95vw', maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(245,250,247,0.92)',
          backdropFilter: 'blur(40px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.90)',
          boxShadow:
            '0 2px 0 rgba(255,255,255,0.95) inset, 0 32px 80px -20px rgba(31,60,50,0.22)',
          outline: 'none',
          animation: 'modal-pop 220ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '22px 24px 16px',
          borderBottom: '1px solid var(--lg-ink-08)',
          flexShrink: 0,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div
              id="modal-title"
              style={{
                fontSize: 17, fontWeight: 700, color: 'var(--lg-ink-deep)',
                fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 11, color: 'var(--lg-ink-55)', marginTop: 3, fontFamily: 'var(--font-sans)' }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid var(--lg-ink-15)',
              background: 'rgba(255,255,255,0.70)',
              color: 'var(--lg-ink-55)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0, marginTop: 2,
            }}
            aria-label="Close"
          >×</button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
