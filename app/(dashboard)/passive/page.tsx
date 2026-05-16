import { PASSIVE_TECHNOLOGIES, PRECONDITIONING_PLANS } from '@/lib/mock-data'
import PassiveTechCard from '@/components/passive/PassiveTechCard'
import PreconditioningPanel from '@/components/passive/PreconditioningPanel'

export default function PassivePage() {
  const activeTechs = PASSIVE_TECHNOLOGIES.filter(t => t.active)
  const autoTechs = PASSIVE_TECHNOLOGIES.filter(t => t.auto_dispatch)
  const pendingPlans = PRECONDITIONING_PLANS.filter(p => !p.approved && !p.executed)
  const totalEnergySaved = PRECONDITIONING_PLANS.reduce((s, p) => s + p.energy_saved_kwh, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Strategies', value: `${activeTechs.length} / ${PASSIVE_TECHNOLOGIES.length}`, color: 'var(--accent)' },
          { label: 'Auto-Dispatch', value: `${autoTechs.length} technologies`, color: 'var(--teal)' },
          { label: 'Plans Awaiting Approval', value: String(pendingPlans.length), color: pendingPlans.length > 0 ? 'var(--amber)' : 'var(--accent)' },
          { label: 'Projected Energy Save', value: `${totalEnergySaved.toFixed(1)} kWh`, color: 'var(--teal)' },
        ].map(item => (
          <div
            key={item.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--rule)',
              borderRadius: 6,
              padding: '14px 18px',
            }}
          >
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 20, color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: technologies + preconditioning */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 flex flex-col gap-3">
          <div style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Passive Cooling Technologies
          </div>
          {PASSIVE_TECHNOLOGIES.map(tech => (
            <PassiveTechCard key={tech.id} tech={tech} />
          ))}
        </div>
        <div>
          <PreconditioningPanel plans={PRECONDITIONING_PLANS} />
        </div>
      </div>
    </div>
  )
}
