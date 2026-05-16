import { NBS_ASSETS } from '@/lib/mock-data'
import NBSAssetCard from '@/components/nbs/NBSAssetCard'
import NBSCoolingLoadChart from '@/components/nbs/NBSCoolingLoadChart'
import NBSActionsLog from '@/components/nbs/NBSActionsLog'

export default function NBSPage() {
  const totalCooling = NBS_ASSETS.reduce((s, a) => s + a.evap_cooling_credit_kw, 0)
  const activeAssets = NBS_ASSETS.filter(a => a.active)
  const criticalAssets = NBS_ASSETS.filter(a => a.current_soil_moisture_pct < 35)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active NBS Assets', value: `${activeAssets.length} / ${NBS_ASSETS.length}`, color: 'var(--ok)' },
          { label: 'Total Cooling Credit', value: `${totalCooling.toFixed(1)} kW`, color: 'var(--teal)' },
          { label: 'Attention Required', value: criticalAssets.length > 0 ? `${criticalAssets.length} asset${criticalAssets.length > 1 ? 's' : ''}` : 'None', color: criticalAssets.length > 0 ? 'var(--hot)' : 'var(--ok)' },
        ].map(item => (
          <div key={item.label} className="glass" style={{ borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 22, color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {NBS_ASSETS.map(asset => <NBSAssetCard key={asset.id} asset={asset} />)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NBSCoolingLoadChart />
        <NBSActionsLog />
      </div>
    </div>
  )
}
