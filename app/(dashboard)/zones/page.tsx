'use client'
import { useState } from 'react'
import { ZONES } from '@/lib/mock-data'
import ZoneCard from '@/components/zones/ZoneCard'
import FloorPlanGrid from '@/components/zones/FloorPlanGrid'
import ZoneDetailPanel from '@/components/zones/ZoneDetailPanel'
import ComfortHistoryChart from '@/components/zones/ComfortHistoryChart'

export default function ZonesPage() {
  const [selectedId, setSelectedId] = useState<string>(ZONES[0].id)
  const selectedZone = ZONES.find(z => z.id === selectedId) ?? ZONES[0]

  return (
    <div className="flex flex-col gap-6 max-w-full">
      {/* Zone cards row */}
      <div className="grid grid-cols-3 gap-3" style={{ minWidth: 0 }}>
        {ZONES.map(zone => (
          <ZoneCard
            key={zone.id}
            zone={zone}
            selected={zone.id === selectedId}
            onClick={() => setSelectedId(zone.id)}
          />
        ))}
      </div>

      {/* Floor plan + detail panel */}
      <div className="grid grid-cols-3 gap-4" style={{ minWidth: 0 }}>
        <div className="col-span-2">
          <FloorPlanGrid
            zones={ZONES}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <div>
          <ZoneDetailPanel zone={selectedZone} />
        </div>
      </div>

      {/* Comfort history chart */}
      <ComfortHistoryChart />
    </div>
  )
}
