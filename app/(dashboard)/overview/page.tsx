'use client'
import { useState } from 'react'
import { ZONES, NBS_ASSETS, PASSIVE_TECHNOLOGIES } from '@/lib/mock-data'
import CarbonHero from '@/components/overview/CarbonHero'
import AIQueueCard from '@/components/overview/AIQueueCard'
import IsometricBuilding from '@/components/zones/IsometricBuilding'
import Modal from '@/components/layout/Modal'
import ZoneSheetBody from '@/components/zones/ZoneSheetBody'
import PassiveSheetBody from '@/components/passive/PassiveSheetBody'
import NBSSheetBody from '@/components/nbs/NBSSheetBody'

export default function OverviewPage() {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(ZONES[0].id)
  const [zoneSheetOpen, setZoneSheetOpen] = useState(false)
  const selectedZone = ZONES.find(z => z.id === selectedZoneId) ?? ZONES[0]

  function handleZoneSelect(id: string) {
    setSelectedZoneId(id)
    setZoneSheetOpen(true)
  }

  // Count passive active + NBS alerts
  const passiveActive = PASSIVE_TECHNOLOGIES.filter(p => p.active).length
  const nbsAlerts = NBS_ASSETS.filter(a => a.current_soil_moisture_pct < 35).length

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>

        {/* ── Left column ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CarbonHero />
          <AIQueueCard />
        </div>

        {/* ── Right column ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Isometric building */}
          <div className="glass" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="label-eyebrow">Live zones</div>
              <span style={{ fontSize: 10, color: 'var(--lg-ink-35)' }}>tap to inspect</span>
            </div>
            <IsometricBuilding
              zones={ZONES}
              selectedId={selectedZoneId}
              onSelect={handleZoneSelect}
            />
            {/* Zone status legend */}
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              {ZONES.map(z => (
                <button
                  key={z.id}
                  onClick={() => handleZoneSelect(z.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '3px 8px',
                    borderRadius: 'var(--r-pill)',
                    border: z.id === selectedZoneId ? '1px solid var(--lg-ink-15)' : '1px solid transparent',
                    background: z.id === selectedZoneId ? 'rgba(255,255,255,0.70)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span className={`status-dot status-dot--${z.thermal_status.toLowerCase()}`} />
                  <span style={{ fontSize: 10, color: 'var(--lg-ink-55)', fontFamily: 'var(--font-sans)' }}>
                    {z.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Passive entry tile */}
          <div className="glass" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div className="label-eyebrow">Passive strategies</div>
                <div style={{ fontSize: 11, color: 'var(--lg-ink-35)', marginTop: 2 }}>
                  {passiveActive} of {PASSIVE_TECHNOLOGIES.length} active
                </div>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--r-pill)',
                  background: 'rgba(63,127,102,0.10)',
                  border: '1px solid rgba(63,127,102,0.25)',
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--lg-mint-deep)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {passiveActive}/{PASSIVE_TECHNOLOGIES.length}
              </span>
            </div>
            {/* 6-pip status bar */}
            <div style={{ display: 'flex', gap: 5 }}>
              {PASSIVE_TECHNOLOGIES.map(p => (
                <div
                  key={p.id}
                  style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: p.active ? 'var(--lg-mint-deep)' : 'rgba(36,51,51,0.12)',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {PASSIVE_TECHNOLOGIES.slice(0, 3).map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0',
                    borderBottom: '1px solid var(--lg-ink-08)',
                  }}
                >
                  <span className={`status-dot status-dot--${p.active ? 'ok' : 'warn'}`} />
                  <span style={{ flex: 1, fontSize: 11, color: 'var(--lg-ink-70)', fontFamily: 'var(--font-sans)' }}>
                    {p.name}
                  </span>
                  {p.auto_dispatch && (
                    <span style={{ fontSize: 9, color: 'var(--lg-ink-35)', fontFamily: 'var(--font-mono)' }}>AUTO</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* NBS entry tile */}
          <div className="glass" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div className="label-eyebrow">Nature-based solutions</div>
                <div style={{ fontSize: 11, color: 'var(--lg-ink-35)', marginTop: 2 }}>
                  {NBS_ASSETS.length} assets monitored
                </div>
              </div>
              {nbsAlerts > 0 && (
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--r-pill)',
                    background: 'rgba(201,144,94,0.12)',
                    border: '1px solid rgba(201,144,94,0.30)',
                    fontSize: 10,
                    fontWeight: 600,
                    color: 'var(--lg-amber)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  ⚠ {nbsAlerts} alert{nbsAlerts > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {NBS_ASSETS.map(a => {
                const lowMoisture = a.current_soil_moisture_pct < 35
                return (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 0',
                      borderBottom: '1px solid var(--lg-ink-08)',
                    }}
                  >
                    <span className={`status-dot status-dot--${lowMoisture ? 'warn' : 'ok'}`} />
                    <span style={{ flex: 1, fontSize: 11, color: 'var(--lg-ink-70)', fontFamily: 'var(--font-sans)' }}>
                      {a.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: lowMoisture ? 'var(--lg-amber)' : 'var(--lg-ink-35)',
                    }}>
                      {a.current_soil_moisture_pct}% moisture
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Zone Modal */}
      <Modal
        open={zoneSheetOpen}
        onClose={() => setZoneSheetOpen(false)}
        title={selectedZone.name}
        subtitle={`Floor ${selectedZone.floor} · ${selectedZone.area_sqm} m²`}
        width={500}
      >
        <ZoneSheetBody zone={selectedZone} />
      </Modal>
    </>
  )
}
