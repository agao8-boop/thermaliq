// components/occupant/GettingStarted.tsx
'use client'

interface Props {
  onContinue: () => void
}

export default function GettingStarted({ onContinue }: Props) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 0 48px',
        overflow: 'hidden',
      }}
    >
      {/* Hero gradient overlay (building image is on the layout bg) */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(20,40,32,0.72) 0%, rgba(20,40,32,0.30) 50%, transparent 100%)',
          zIndex: 1,
        }}
      />

      {/* Floating tag — top-left */}
      <div
        style={{
          position: 'absolute', top: 52, left: 28, zIndex: 2,
          padding: '6px 14px',
          borderRadius: 'var(--r-pill)',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.35)',
          fontSize: 11, color: 'rgba(255,255,255,0.90)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Meridian Tower · Swipe to Continue
      </div>

      {/* Content card */}
      <div
        style={{
          position: 'relative', zIndex: 2,
          padding: '0 28px',
        }}
      >
        <div style={{
          fontSize: 36, fontWeight: 700, color: 'white',
          fontFamily: 'var(--font-sans)', letterSpacing: '-0.03em',
          lineHeight: 1.15, marginBottom: 14,
        }}>
          Discover the Space<br />
          <span style={{ color: 'rgba(142,197,168,1)' }}>That Fits You</span>
        </div>
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.6, marginBottom: 28,
          fontFamily: 'var(--font-sans)', maxWidth: 320,
        }}>
          Perfect spaces begin with the right climate. Alm, your AI comfort agent, keeps your environment exactly where you want it.
        </p>
        <button
          onClick={onContinue}
          className="btn-primary"
          style={{
            padding: '14px 28px',
            fontSize: 13, fontWeight: 600,
            boxShadow: '0 8px 24px rgba(63,127,102,0.50)',
          }}
        >
          Explore →
        </button>
      </div>
    </div>
  )
}
