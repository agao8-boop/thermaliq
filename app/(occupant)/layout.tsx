// app/(occupant)/layout.tsx
import GlobalHeader from '@/components/layout/GlobalHeader'

export default function OccupantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <GlobalHeader />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
