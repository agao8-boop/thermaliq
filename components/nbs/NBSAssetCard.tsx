'use client'
import { useState } from 'react'
import { NBSAsset } from '@/lib/types'

interface Props { asset: NBSAsset }

function moistureColor(pct: number) {
  return pct < 35 ? 'var(--hot)' : pct < 50 ? 'var(--warn)' : 'var(--ok)'
}

function assetIcon(type: NBSAsset['asset_type']) {
  const icons: Record<string, string> = {
    GREEN_ROOF: '🌿', ATRIUM_CANOPY: '🌳', RAIN_GARDEN: '💧',
    LIVING_WALL: '🪴', GROUND_VEGETATION: '🌾', OTHER: '◆',
  }
  return icons[type] ?? '◆'
}

export default function NBSAssetCard({ asset }: Props) {
  const [irrigating, setIrrigating] = useState(false)
  const [irrigated, setIrrigated] = useState(false)

  async function triggerIrrigation() {
    setIrrigating(true)
    await fetch('/api/nbs/irrigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset_id: asset.id, duration_minutes: 15 }),
    })
    setIrrigated(true)
    setTimeout(() => setIrrigated(false), 5000)
    setIrrigating(false)
  }

  const mColor = moistureColor(asset.current_soil_moisture_pct)
  const isCritical = asset.current_soil_moisture_pct < 35

  return (
    <div
      className="glass"
      style={{
        borderRadius: 16, padding: '18px',
        border: isCritical ? '1.5px solid rgba(196,90,74,0.30)' : '1px solid rgba(255,255,255,0.85)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{assetIcon(asset.asset_type)}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{asset.name}</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              {asset.asset_type.replace(/_/g, ' ')} · {asset.area_sqm} m²
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 9, padding: '2px 8px', borderRadius: 10,
          border: `1px solid ${asset.active ? 'rgba(46,125,90,0.35)' : 'rgba(26,43,34,0.15)'}`,
          color: asset.active ? 'var(--ok)' : 'var(--muted)',
          background: asset.active ? 'rgba(46,125,90,0.08)' : 'transparent',
          fontFamily: 'Azeret Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {asset.active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Soil moisture bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>Soil Moisture</span>
          <span style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 12, color: mColor }}>
            {asset.current_soil_moisture_pct}%
            {isCritical && <span style={{ marginLeft: 6, fontSize: 9, background: 'rgba(196,90,74,0.12)', padding: '1px 6px', borderRadius: 4 }}>CRITICAL</span>}
          </span>
        </div>
        <div style={{ height: 5, background: 'rgba(26,43,34,0.10)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${asset.current_soil_moisture_pct}%`,
            background: mColor === 'var(--ok)'
              ? 'linear-gradient(90deg, #7BAE7F, #2E7D5A)'
              : mColor === 'var(--warn)'
                ? 'linear-gradient(90deg, #D4BFA0, #B87C4A)'
                : 'linear-gradient(90deg, #e8a090, #C45A4A)',
            borderRadius: 3, transition: 'width 0.4s',
          }} />
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Surface Temp', value: `${asset.current_surface_temp_c.toFixed(1)}°C`, warn: asset.current_surface_temp_c > 35 },
          { label: 'Cooling Credit', value: `${asset.evap_cooling_credit_kw.toFixed(1)} kW`, warn: false },
        ].map(m => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.60)', borderRadius: 10, padding: '9px 12px', border: '1px solid rgba(255,255,255,0.85)' }}>
            <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 15, color: m.warn ? 'var(--warn)' : 'var(--teal)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Irrigation */}
      {asset.irrigation_connected && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(26,43,34,0.08)', paddingTop: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
            Irrigation: <span style={{ color: asset.irrigation_auto ? 'var(--ok)' : 'var(--muted)' }}>
              {asset.irrigation_auto ? 'Auto' : 'Manual'}
            </span>
          </div>
          <button
            onClick={triggerIrrigation}
            disabled={irrigating || irrigated}
            style={{
              fontSize: 10, padding: '4px 14px', borderRadius: 10, border: 'none',
              background: irrigated
                ? 'linear-gradient(135deg, #4A9AA0, #2E7D5A)'
                : 'linear-gradient(135deg, #2E7D5A, #1A5C3A)',
              color: 'white',
              cursor: irrigating || irrigated ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 6px rgba(46,125,90,0.25)',
              transition: 'all 0.15s',
            }}
          >
            {irrigated ? '✓ Irrigating' : irrigating ? '…' : '▶ Irrigate'}
          </button>
        </div>
      )}
    </div>
  )
}
