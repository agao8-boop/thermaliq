'use client'
import { useState } from 'react'
import { NBSAsset } from '@/lib/types'

interface Props {
  asset: NBSAsset
}

function moistureColor(pct: number) {
  if (pct < 35) return '#ff5c5c'
  if (pct < 50) return 'var(--amber)'
  return 'var(--accent)'
}

function assetIcon(type: NBSAsset['asset_type']) {
  const icons: Record<string, string> = {
    GREEN_ROOF: '◈',
    ATRIUM_CANOPY: '◉',
    BIOSWALE: '◎',
    LIVING_WALL: '◧',
    CONSTRUCTED_WETLAND: '◌',
    URBAN_ORCHARD: '◍',
  }
  return icons[type] ?? '◆'
}

export default function NBSAssetCard({ asset }: Props) {
  const [irrigating, setIrrigating] = useState(false)
  const [irrigated, setIrrigated] = useState(false)

  async function triggerIrrigation() {
    setIrrigating(true)
    try {
      await fetch('/api/nbs/irrigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset_id: asset.id, duration_minutes: 15 }),
      })
      setIrrigated(true)
      setTimeout(() => setIrrigated(false), 5000)
    } finally {
      setIrrigating(false)
    }
  }

  const mColor = moistureColor(asset.current_soil_moisture_pct)
  const isCritical = asset.current_soil_moisture_pct < 35

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isCritical ? 'rgba(255,92,92,0.30)' : 'var(--rule)'}`,
        borderRadius: 6,
        padding: '16px',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 10 }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 18, color: 'var(--accent)' }}>{assetIcon(asset.asset_type)}</span>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{asset.name}</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 1 }}>
              {asset.asset_type.replace(/_/g, ' ')} · {asset.area_sqm} m²
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 9,
            padding: '2px 8px',
            borderRadius: 3,
            border: `1px solid ${asset.active ? 'rgba(46,255,150,0.30)' : 'var(--rule)'}`,
            color: asset.active ? 'var(--accent)' : 'var(--muted)',
            fontFamily: 'Azeret Mono, monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {asset.active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Soil moisture bar */}
      <div style={{ marginBottom: 12 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
            Soil Moisture
          </span>
          <span style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 12, color: mColor }}>
            {asset.current_soil_moisture_pct}%
            {isCritical && <span style={{ marginLeft: 6, color: '#ff5c5c', fontSize: 9 }}>CRITICAL</span>}
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${asset.current_soil_moisture_pct}%`,
              background: mColor,
              borderRadius: 2,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: 12 }}>
        {[
          { label: 'Surface Temp', value: `${asset.current_surface_temp_c.toFixed(1)}°C`, color: asset.current_surface_temp_c > 35 ? 'var(--amber)' : 'var(--text)' },
          { label: 'Cooling Credit', value: `${asset.evap_cooling_credit_kw.toFixed(1)} kW`, color: 'var(--teal)' },
        ].map(m => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '8px 10px', border: '1px solid var(--rule)' }}>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 3 }}>
              {m.label}
            </div>
            <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 14, color: m.color }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Irrigation controls */}
      {asset.irrigation_connected && (
        <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 10 }}>
          <div className="flex items-center justify-between">
            <div>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>Irrigation: </span>
              <span style={{ fontSize: 10, color: asset.irrigation_auto ? 'var(--accent)' : 'var(--muted)' }}>
                {asset.irrigation_auto ? 'Auto' : 'Manual'}
              </span>
            </div>
            <button
              onClick={triggerIrrigation}
              disabled={irrigating || irrigated}
              style={{
                fontFamily: 'Azeret Mono, monospace',
                fontSize: 10,
                padding: '3px 12px',
                borderRadius: 3,
                border: `1px solid ${irrigated ? 'var(--teal)' : 'var(--accent)'}`,
                color: irrigated ? 'var(--teal)' : 'var(--accent)',
                background: irrigated ? 'rgba(62,207,207,0.08)' : 'rgba(46,255,150,0.08)',
                cursor: irrigating || irrigated ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {irrigated ? '✓ Irrigating' : irrigating ? '…' : '▶ Irrigate'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
