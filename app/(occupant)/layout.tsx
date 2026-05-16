import GlobalHeader from '@/components/layout/GlobalHeader'
import GlobalFooter from '@/components/layout/GlobalFooter'

export default function OccupantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <GlobalHeader />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <GlobalFooter />
    </div>
  )
}
