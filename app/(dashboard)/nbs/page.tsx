import { NBS_ASSETS } from '@/lib/mock-data'
import NBSAssetCard from '@/components/nbs/NBSAssetCard'
import NBSCoolingLoadChart from '@/components/nbs/NBSCoolingLoadChart'
import NBSActionsLog from '@/components/nbs/NBSActionsLog'

export default function NBSPage() {
  const totalCooling = NBS_ASSETS.reduce((s, a) => s + a.evap_cooling_credit_kw, 0)
  const activeAssets = NBS_ASSETS.filter(a => a.active)
  const criticalAssets = NBS_ASSETS.filter(a => a.current_soil_moisture_pct < 35)

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active NBS Assets', value: `${activeAssets.length} / ${NBS_ASSETS.length}`, color: 'var(--accent)' },
          { label: 'Total Cooling Credit', value: `${totalCooling.toFixed(1)} kW`, color: 'var(--teal)' },
          { label: 'Attention Required', value: criticalAssets.length > 0 ? `${criticalAssets.length} asset${criticalAssets.length > 1 ? 's' : ''}` : 'None', color: criticalAssets.length > 0 ? '#ff5c5c' : 'var(--accent)' },
        ].map(item => (
          <div
            key={item.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--rule)',
              borderRadius: 6,
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 24, color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Assets grid */}
      <div className="grid grid-cols-2 gap-4">
        {NBS_ASSETS.map(asset => (
          <NBSAssetCard key={asset.id} asset={asset} />
        ))}
      </div>

      {/* Chart + actions */}
      <div className="grid grid-cols-2 gap-4">
        <NBSCoolingLoadChart />
        <NBSActionsLog />
      </div>
    </div>
  )
}
