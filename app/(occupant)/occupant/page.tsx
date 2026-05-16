'use client'
import { useState } from 'react'
import { ZONES } from '@/lib/mock-data'
import ZonePicker from '@/components/occupant/ZonePicker'
import PersonalComfortCard from '@/components/occupant/PersonalComfortCard'
import WearableConnect from '@/components/occupant/WearableConnect'
import BuildingOverview from '@/components/occupant/BuildingOverview'
import OccupantAIChat from '@/components/occupant/OccupantAIChat'

export default function OccupantPage() {
  const [selectedZoneId, setSelectedZoneId] = useState(ZONES[0].id)
  const zone = ZONES.find(z => z.id === selectedZoneId) ?? ZONES[0]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 40px' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 32, fontWeight: 400, color: 'var(--text)',
          marginBottom: 4,
        }}>
          Your Comfort, <em>personalised</em>
        </h1>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Meridian Tower · Select your work area to see live conditions
        </p>
      </div>

      {/* Zone picker */}
      <div
        className="glass"
        style={{ borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}
      >
        <ZonePicker selectedId={selectedZoneId} onChange={setSelectedZoneId} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <PersonalComfortCard zone={zone} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <WearableConnect />
          <BuildingOverview />
        </div>
      </div>

      {/* AI Chat — full width */}
      <OccupantAIChat />
    </div>
  )
}
