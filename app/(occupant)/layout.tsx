// app/(occupant)/layout.tsx
import GlobalHeader from '@/components/layout/GlobalHeader'

export default function OccupantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Building photo — fixed background */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: "url('/building-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.80) saturate(0.85)',
        }}
      />
      {/* Sea Mist mesh tint overlay */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 1,
          background: 'linear-gradient(155deg, rgba(100,185,150,0.22) 0%, rgba(100,165,210,0.18) 50%, rgba(200,185,100,0.14) 100%)',
          backdropFilter: 'blur(0px)',
        }}
      />
      {/* App content */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <GlobalHeader />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
