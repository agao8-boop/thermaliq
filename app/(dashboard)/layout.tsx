import GlobalHeader from '@/components/layout/GlobalHeader'
import GlobalFooter from '@/components/layout/GlobalFooter'
import TabNav from '@/components/layout/TabNav'
import AIDirectorSidebar from '@/components/ai/AIDirectorSidebar'
import KPIStrip from '@/components/KPIStrip'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <GlobalHeader />
      <div className="flex flex-1 overflow-hidden">
        <AIDirectorSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <KPIStrip />
          <TabNav />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
      <GlobalFooter />
    </div>
  )
}
