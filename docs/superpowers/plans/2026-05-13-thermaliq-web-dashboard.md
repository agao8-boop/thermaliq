# ThermalIQ Web Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ThermalIQ admin web dashboard (Next.js 14 + TypeScript) with Gemini AI Director chat, zone comfort monitoring, passive strategies management, and nature-based solutions tracking — deployable to Vercel.

**Architecture:** Next.js 14 App Router with a fixed three-column shell (GlobalHeader + GlobalFooter + AIDirectorSidebar + tabbed main content). All data starts as mock; Supabase and Gemini are wired via environment variables so the app works with or without real credentials. BMS integration is simulated by a mock service layer.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Recharts, @google/generative-ai, @supabase/supabase-js, Google Fonts (Cormorant Garamond + DM Sans + Azeret Mono)

---

## File Map

```
thermaliq/
├── app/
│   ├── layout.tsx                          # root layout — fonts, globals
│   ├── page.tsx                            # redirect → /zones
│   ├── globals.css                         # design system CSS variables
│   ├── (dashboard)/
│   │   ├── layout.tsx                      # header + footer + sidebar + tab shell
│   │   ├── zones/page.tsx                  # OccupantComfortTab
│   │   ├── passive/page.tsx                # PassiveStrategiesTab
│   │   └── nbs/page.tsx                    # NatureBasedSolutionsTab
│   └── api/
│       ├── admin/chat/route.ts             # Gemini Director chat endpoint
│       ├── zones/[building_id]/route.ts    # zone telemetry
│       ├── bms/write/route.ts              # BMS setpoint write (mocked)
│       ├── nbs/irrigate/route.ts           # NBS irrigation trigger
│       └── carbon/[building_id]/[date]/route.ts
├── components/
│   ├── layout/
│   │   ├── GlobalHeader.tsx
│   │   ├── GlobalFooter.tsx
│   │   └── TabNav.tsx
│   ├── ai/
│   │   ├── AIDirectorSidebar.tsx           # persistent chat panel
│   │   ├── ChatBubble.tsx
│   │   └── QuickCommandChips.tsx
│   ├── zones/
│   │   ├── FloorPlanGrid.tsx               # 2×3 zone colour grid
│   │   ├── ZoneCard.tsx                    # single zone block
│   │   ├── ZoneDetailPanel.tsx             # setpoint slider + metrics
│   │   └── ComfortHistoryChart.tsx         # stacked bar — 7d
│   ├── passive/
│   │   ├── TechConfigPanel.tsx             # technology checklist
│   │   ├── PreconditioningScheduler.tsx    # plan cards + approve
│   │   ├── PlanCard.tsx
│   │   └── PassivePerformancePanel.tsx
│   └── nbs/
│       ├── AssetRegisterPanel.tsx
│       ├── NBSTelemetryPanel.tsx
│       ├── NBSCoolingLoadChart.tsx          # grouped bar chart
│       ├── NBSActionPlanner.tsx
│       └── NBSDiagnosticsPanel.tsx
├── lib/
│   ├── types.ts                            # all shared TypeScript types
│   ├── mock-data.ts                        # comprehensive seed data
│   ├── gemini.ts                           # Gemini client + prompt builders
│   ├── supabase.ts                         # Supabase browser + server clients
│   └── utils.ts                            # cn(), formatters, constants
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `thermaliq/` (entire project via create-next-app)
- Create: `thermaliq/.env.local.example`
- Create: `thermaliq/app/globals.css`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/agao
npx create-next-app@latest thermaliq \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" --yes
cd thermaliq
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @google/generative-ai @supabase/supabase-js recharts \
  lucide-react clsx tailwind-merge
npm install --save-dev @types/node
```

- [ ] **Step 3: Install Google Fonts (next/font)**

Already available via next/font — no extra install needed.

- [ ] **Step 4: Write .env.local.example**

```bash
cat > .env.local.example << 'EOF'
GEMINI_API_KEY=your-gemini-api-key-here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
MOCK_BMS=true
EOF
cp .env.local.example .env.local
```

- [ ] **Step 5: Commit scaffold**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 project with dependencies"
```

---

### Task 2: Types + Mock Data + Utils

**Files:**
- Create: `lib/types.ts`
- Create: `lib/mock-data.ts`
- Create: `lib/utils.ts`

- [ ] **Step 1: Write lib/types.ts**

```typescript
// lib/types.ts
export type ThermalStatus = 'OK' | 'WARN' | 'HOT' | 'COLD'
export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW'
export type NBSAssetType = 'GREEN_ROOF' | 'ATRIUM_CANOPY' | 'GROUND_VEGETATION' | 'LIVING_WALL' | 'RAIN_GARDEN' | 'OTHER'
export type PassiveCategory = 'VENTILATION' | 'SHADING' | 'THERMAL_MASS' | 'STACK' | 'EVAPORATIVE' | 'GLAZING' | 'OTHER'
export type NBSActionStatus = 'PENDING' | 'SCHEDULED' | 'EXECUTED' | 'CANCELLED'

export interface Zone {
  id: string
  building_id: string
  name: string
  floor: number
  area_sqm: number
  current_temp_f: number
  current_humidity_pct: number
  current_co2_ppm: number
  current_occupancy_count: number
  setpoint_f: number
  ai_optimization_active: boolean
  thermal_status: ThermalStatus
  comfort_index_pct: number
  updated_at: string
}

export interface Building {
  id: string
  name: string
  address: string
  lat: number
  lon: number
  bms_protocol: 'BACNET' | 'MODBUS'
  bms_host: string
  bms_port: number
  timezone: string
}

export interface PassiveTechnology {
  id: string
  building_id: string
  name: string
  active: boolean
  auto_dispatch: boolean
  zone_ids: string[]
  operational_constraints: string
  category: PassiveCategory
}

export interface PreconditioningPlan {
  id: string
  building_id: string
  zone_id: string
  zone_name: string
  scheduled_start: string
  scheduled_end: string
  action_description: string
  energy_saved_kwh: number
  carbon_saved_kgco2e: number
  load_reduction_pct: number
  confidence: Confidence
  approved: boolean
  executed: boolean
}

export interface NBSAsset {
  id: string
  building_id: string
  name: string
  asset_type: NBSAssetType
  area_sqm: number
  active: boolean
  irrigation_connected: boolean
  irrigation_auto: boolean
  seasonal_active_months: number[]
  current_soil_moisture_pct: number
  current_surface_temp_c: number
  evap_cooling_credit_kw: number
  updated_at: string
}

export interface NBSAction {
  id: string
  building_id: string
  asset_id: string
  asset_name: string
  action_description: string
  expected_outcome: string
  carbon_impact_kgco2e: number
  confidence: Confidence
  status: NBSActionStatus
  approved: boolean
  irrigation_volume_kl: number
}

export interface CarbonLog {
  id: string
  building_id: string
  log_date: string
  passive_credit_kwh: number
  nbs_credit_kwh: number
  active_hvac_kwh: number
  carbon_avoided_kgco2e: number
  grid_carbon_intensity_gco2_kwh: number
  gas_boiler_active_minutes: number
}

export interface ChatMessage {
  id: string
  role: 'USER' | 'AI'
  mode: 'OCCUPANT' | 'ADMIN'
  content: string
  bms_command?: BMSCommand
  created_at: string
}

export interface BMSCommand {
  bms_command: string
  target_id: string
  value: number | string
  expected_outcome: string
  carbon_avoided_kgco2e: number
}

export interface ComfortHistoryPoint {
  day: string
  complaints: number
  proactive: number
}

export interface KPIData {
  comfort_events_today: number
  comfort_events_7d_avg: number
  proactive_interceptions: number
  passive_credit_kwh: number
  carbon_avoided_kg_m2: number
  carbon_target_kg_m2: number
}
```

- [ ] **Step 2: Write lib/mock-data.ts**

```typescript
// lib/mock-data.ts
import type { Zone, Building, PassiveTechnology, PreconditioningPlan, NBSAsset, NBSAction, CarbonLog, ComfortHistoryPoint, KPIData } from './types'

export const BUILDING: Building = {
  id: 'bld-001',
  name: 'Meridian Tower',
  address: '1400 Market Street, Denver CO 80202',
  lat: 39.7392,
  lon: -104.9903,
  bms_protocol: 'BACNET',
  bms_host: '192.168.1.100',
  bms_port: 47808,
  timezone: 'America/Denver',
}

export const ZONES: Zone[] = [
  { id: 'z-001', building_id: 'bld-001', name: 'North Office', floor: 3, area_sqm: 420, current_temp_f: 74.2, current_humidity_pct: 44, current_co2_ppm: 820, current_occupancy_count: 18, setpoint_f: 72, ai_optimization_active: true, thermal_status: 'WARN', comfort_index_pct: 71, updated_at: new Date().toISOString() },
  { id: 'z-002', building_id: 'bld-001', name: 'South Conference', floor: 3, area_sqm: 180, current_temp_f: 71.8, current_humidity_pct: 48, current_co2_ppm: 1140, current_occupancy_count: 12, setpoint_f: 71, ai_optimization_active: true, thermal_status: 'OK', comfort_index_pct: 88, updated_at: new Date().toISOString() },
  { id: 'z-003', building_id: 'bld-001', name: 'East Open Plan', floor: 4, area_sqm: 560, current_temp_f: 77.1, current_humidity_pct: 38, current_co2_ppm: 740, current_occupancy_count: 31, setpoint_f: 72, ai_optimization_active: true, thermal_status: 'HOT', comfort_index_pct: 54, updated_at: new Date().toISOString() },
  { id: 'z-004', building_id: 'bld-001', name: 'West Executive', floor: 4, area_sqm: 240, current_temp_f: 70.5, current_humidity_pct: 52, current_co2_ppm: 610, current_occupancy_count: 5, setpoint_f: 71, ai_optimization_active: false, thermal_status: 'COLD', comfort_index_pct: 67, updated_at: new Date().toISOString() },
  { id: 'z-005', building_id: 'bld-001', name: 'Atrium Level 2', floor: 2, area_sqm: 680, current_temp_f: 73.0, current_humidity_pct: 55, current_co2_ppm: 680, current_occupancy_count: 24, setpoint_f: 73, ai_optimization_active: true, thermal_status: 'OK', comfort_index_pct: 92, updated_at: new Date().toISOString() },
  { id: 'z-006', building_id: 'bld-001', name: 'Roof Terrace', floor: 6, area_sqm: 310, current_temp_f: 82.4, current_humidity_pct: 22, current_co2_ppm: 420, current_occupancy_count: 8, setpoint_f: 78, ai_optimization_active: true, thermal_status: 'HOT', comfort_index_pct: 48, updated_at: new Date().toISOString() },
]

export const PASSIVE_TECHNOLOGIES: PassiveTechnology[] = [
  { id: 'pt-001', building_id: 'bld-001', name: 'Night Flush Ventilation', active: true, auto_dispatch: true, zone_ids: ['z-001','z-003','z-005'], operational_constraints: 'Outdoor temp must be ≤ 65°F. Wind speed < 20 mph. Run 11 PM – 5 AM only.', category: 'VENTILATION' },
  { id: 'pt-002', building_id: 'bld-001', name: 'Automated Solar Shading', active: true, auto_dispatch: true, zone_ids: ['z-001','z-002','z-003'], operational_constraints: 'Deploy when direct solar irradiance > 500 W/m². Retract after 6 PM.', category: 'SHADING' },
  { id: 'pt-003', building_id: 'bld-001', name: 'Thermal Mass Pre-cooling', active: true, auto_dispatch: false, zone_ids: ['z-003','z-004'], operational_constraints: 'Cool exposed concrete slab via AHU to 68°F before 7 AM. Requires manual approval each day.', category: 'THERMAL_MASS' },
  { id: 'pt-004', building_id: 'bld-001', name: 'Stack Effect Ventilation', active: false, auto_dispatch: false, zone_ids: ['z-005'], operational_constraints: 'Open atrium high-level vents and low-level intakes. Only when outdoor temp < 72°F.', category: 'STACK' },
  { id: 'pt-005', building_id: 'bld-001', name: 'Indirect Evaporative Pre-cooling', active: true, auto_dispatch: true, zone_ids: ['z-001','z-002','z-003','z-004','z-005','z-006'], operational_constraints: 'Outdoor wet-bulb < 65°F required. Estimated energy reduction: 18–24% on AHU.', category: 'EVAPORATIVE' },
  { id: 'pt-006', building_id: 'bld-001', name: 'Electrochromic Glazing Control', active: true, auto_dispatch: true, zone_ids: ['z-002','z-004'], operational_constraints: 'Tint to 15% transmittance when solar angle > 30° and irradiance > 400 W/m².', category: 'GLAZING' },
]

export const PRECONDITIONING_PLANS: PreconditioningPlan[] = [
  { id: 'plan-001', building_id: 'bld-001', zone_id: 'z-003', zone_name: 'East Open Plan', scheduled_start: '2026-05-14T05:00:00Z', scheduled_end: '2026-05-14T07:30:00Z', action_description: 'Pre-cool East Open Plan via night flush + thermal mass charging. Supply air at 62°F from 5–7:30 AM.', energy_saved_kwh: 18.4, carbon_saved_kgco2e: 7.7, load_reduction_pct: 34, confidence: 'HIGH', approved: false, executed: false },
  { id: 'plan-002', building_id: 'bld-001', zone_id: 'z-001', zone_name: 'North Office', scheduled_start: '2026-05-14T06:00:00Z', scheduled_end: '2026-05-14T07:00:00Z', action_description: 'Automated solar shading deploy at sunrise. Reduce east-facing glazing to 20% transmittance.', energy_saved_kwh: 6.2, carbon_saved_kgco2e: 2.6, load_reduction_pct: 15, confidence: 'HIGH', approved: true, executed: false },
  { id: 'plan-003', building_id: 'bld-001', zone_id: 'z-006', zone_name: 'Roof Terrace', scheduled_start: '2026-05-14T07:30:00Z', scheduled_end: '2026-05-14T09:00:00Z', action_description: 'Indirect evaporative pre-cooling for Roof Terrace AHU. Outdoor conditions favorable: WB 58°F.', energy_saved_kwh: 9.1, carbon_saved_kgco2e: 3.8, load_reduction_pct: 22, confidence: 'MEDIUM', approved: false, executed: false },
]

export const NBS_ASSETS: NBSAsset[] = [
  { id: 'nbs-001', building_id: 'bld-001', name: 'Green Roof — West Wing', asset_type: 'GREEN_ROOF', area_sqm: 305, active: true, irrigation_connected: true, irrigation_auto: false, seasonal_active_months: [5,6,7,8,9], current_soil_moisture_pct: 28, current_surface_temp_c: 38.2, evap_cooling_credit_kw: 1.4, updated_at: new Date().toISOString() },
  { id: 'nbs-002', building_id: 'bld-001', name: 'Atrium Canopy Trees', asset_type: 'ATRIUM_CANOPY', area_sqm: 120, active: true, irrigation_connected: true, irrigation_auto: true, seasonal_active_months: [1,2,3,4,5,6,7,8,9,10,11,12], current_soil_moisture_pct: 64, current_surface_temp_c: 24.1, evap_cooling_credit_kw: 1.8, updated_at: new Date().toISOString() },
  { id: 'nbs-003', building_id: 'bld-001', name: 'Bioswale — South Entry', asset_type: 'RAIN_GARDEN', area_sqm: 85, active: true, irrigation_connected: false, irrigation_auto: false, seasonal_active_months: [4,5,6,7,8,9,10], current_soil_moisture_pct: 71, current_surface_temp_c: 29.8, evap_cooling_credit_kw: 0.3, updated_at: new Date().toISOString() },
  { id: 'nbs-004', building_id: 'bld-001', name: 'Living Wall — Lobby', asset_type: 'LIVING_WALL', area_sqm: 40, active: true, irrigation_connected: true, irrigation_auto: true, seasonal_active_months: [1,2,3,4,5,6,7,8,9,10,11,12], current_soil_moisture_pct: 58, current_surface_temp_c: 22.4, evap_cooling_credit_kw: 0.6, updated_at: new Date().toISOString() },
]

export const NBS_ACTIONS: NBSAction[] = [
  { id: 'nbsa-001', building_id: 'bld-001', asset_id: 'nbs-001', asset_name: 'Green Roof — West Wing', action_description: 'Emergency irrigation pulse: 6 hours at 4 L/min to restore 60% VWC by 08:00 tomorrow.', expected_outcome: 'Roof surface temp drops from 38°C to ~28°C. Cooling credit increases from 1.4 kW to 3.8 kW.', carbon_impact_kgco2e: 1.9, confidence: 'HIGH', status: 'PENDING', approved: false, irrigation_volume_kl: 1.44 },
  { id: 'nbsa-002', building_id: 'bld-001', asset_id: 'nbs-003', asset_name: 'Bioswale — South Entry', action_description: 'Open underdrain valve for 48 hours to lower saturation from 71% to 40% before Thursday storm.', expected_outcome: 'Infiltration rate restored to 2.8 cm/hr. First-flush capture maximised.', carbon_impact_kgco2e: 45.0, confidence: 'HIGH', status: 'PENDING', approved: false, irrigation_volume_kl: 0 },
]

export const CARBON_LOG: CarbonLog = {
  id: 'cl-001', building_id: 'bld-001', log_date: new Date().toISOString().split('T')[0],
  passive_credit_kwh: 32.4, nbs_credit_kwh: 8.2, active_hvac_kwh: 284.0,
  carbon_avoided_kgco2e: 17.1, grid_carbon_intensity_gco2_kwh: 420, gas_boiler_active_minutes: 0,
}

export const COMFORT_HISTORY: ComfortHistoryPoint[] = [
  { day: 'Mon', complaints: 4, proactive: 7 },
  { day: 'Tue', complaints: 2, proactive: 9 },
  { day: 'Wed', complaints: 6, proactive: 5 },
  { day: 'Thu', complaints: 1, proactive: 12 },
  { day: 'Fri', complaints: 3, proactive: 8 },
  { day: 'Sat', complaints: 0, proactive: 4 },
  { day: 'Today', complaints: 2, proactive: 6 },
]

export const KPI: KPIData = {
  comfort_events_today: 8, comfort_events_7d_avg: 11.4,
  proactive_interceptions: 6, passive_credit_kwh: 32.4,
  carbon_avoided_kg_m2: 0.007, carbon_target_kg_m2: 0.010,
}

export const GRID_CARBON_INTENSITY = 420 // gCO₂/kWh
```

- [ ] **Step 3: Write lib/utils.ts**

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ThermalStatus, Confidence } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function statusColor(status: ThermalStatus): string {
  return { OK: '#2eff96', WARN: '#f0b840', HOT: '#ff4d4d', COLD: '#3ecfcf' }[status]
}

export function statusBg(status: ThermalStatus): string {
  return {
    OK: 'rgba(46,255,150,0.12)',
    WARN: 'rgba(240,184,64,0.12)',
    HOT: 'rgba(255,77,77,0.12)',
    COLD: 'rgba(62,207,207,0.12)',
  }[status]
}

export function confidenceBadge(c: Confidence) {
  return { HIGH: 'text-[#2eff96]', MEDIUM: 'text-[#f0b840]', LOW: 'text-red-400' }[c]
}

export function formatTemp(f: number) { return `${f.toFixed(1)}°F` }
export function formatKWh(v: number) { return `${v.toFixed(1)} kWh` }
export function formatCarbon(v: number) { return `${v.toFixed(1)} kg` }
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
```

- [ ] **Step 4: Commit types and data**

```bash
git add lib/
git commit -m "feat: add types, mock data, and utility helpers"
```

---

### Task 3: Design System + Root Layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `tailwind.config.ts` (extend with design tokens)

- [ ] **Step 1: Write app/globals.css**

```css
/* app/globals.css */
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=Azeret+Mono:wght@300;400&display=swap');

:root {
  --bg:      #06100a;
  --surface: rgba(255,255,255,0.04);
  --accent:  #2eff96;
  --teal:    #3ecfcf;
  --amber:   #f0b840;
  --text:    #dceee2;
  --muted:   rgba(220,238,226,0.45);
  --rule:    rgba(220,238,226,0.10);
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'Azeret Mono', 'Courier New', monospace;
}

html, body { background: var(--bg); color: var(--text); }
body { font-family: var(--font-body); font-size: 13px; line-height: 1.5; }
h1, h2, h3 { font-family: var(--font-display); font-weight: 400; }
code, .mono { font-family: var(--font-mono); }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 2px; }
```

- [ ] **Step 2: Write app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ThermalIQ — Intelligent Building Comfort',
  description: 'AI-powered thermal comfort and carbon management for commercial buildings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Write app/page.tsx (redirect)**

```tsx
// app/page.tsx
import { redirect } from 'next/navigation'
export default function Home() { redirect('/zones') }
```

- [ ] **Step 4: Write tailwind.config.ts**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#06100a', accent: '#2eff96', teal: '#3ecfcf',
        amber: '#f0b840', surface: 'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Azeret Mono', 'Courier New', 'monospace'],
      },
    },
  },
} satisfies Config
```

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx app/page.tsx tailwind.config.ts
git commit -m "feat: design system CSS variables and root layout"
```

---

### Task 4: Global Header + Footer + Tab Nav

**Files:**
- Create: `components/layout/GlobalHeader.tsx`
- Create: `components/layout/GlobalFooter.tsx`
- Create: `components/layout/TabNav.tsx`
- Create: `app/(dashboard)/layout.tsx`

- [ ] **Step 1: Write GlobalHeader.tsx**

```tsx
// components/layout/GlobalHeader.tsx
'use client'
import { useEffect, useState } from 'react'
import { BUILDING, GRID_CARBON_INTENSITY } from '@/lib/mock-data'

export default function GlobalHeader() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="h-[52px] flex items-center justify-between px-6 border-b border-[var(--rule)] bg-[#06100a] z-50 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-display text-[18px] text-[var(--accent)] tracking-wide">ThermalIQ</span>
        <span className="text-[var(--rule)]">|</span>
        <span className="text-[var(--muted)] text-[12px]">{BUILDING.name}</span>
      </div>

      <div className="flex items-center gap-6">
        {/* BMS Live indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="font-mono text-[11px] text-[var(--accent)]">BMS Live</span>
        </div>

        {/* Grid carbon badge */}
        <div className="px-3 py-1 rounded border border-[var(--rule)] bg-[var(--surface)]">
          <span className="font-mono text-[11px] text-[var(--teal)]">{GRID_CARBON_INTENSITY} gCO₂/kWh</span>
        </div>

        {/* Clock */}
        <span className="font-mono text-[11px] text-[var(--muted)]">{time}</span>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Write GlobalFooter.tsx**

```tsx
// components/layout/GlobalFooter.tsx
'use client'
import { useState } from 'react'
import { CARBON_LOG } from '@/lib/mock-data'

export default function GlobalFooter() {
  const [simRunning, setSimRunning] = useState(false)
  const log = CARBON_LOG

  return (
    <footer className="h-[36px] flex items-center justify-between px-6 border-t border-[var(--rule)] bg-[#06100a] flex-shrink-0 text-[11px]">
      {/* Status indicators */}
      <div className="flex items-center gap-5">
        {[
          { label: 'BACnet', ok: true },
          { label: 'NBS Irrigation', ok: true },
          { label: 'Biometric Stream', ok: false },
          { label: 'Grid Carbon', ok: true },
        ].map(s => (
          <span key={s.label} className="flex items-center gap-1.5 text-[var(--muted)]">
            <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-[var(--accent)]' : 'bg-[var(--amber)]'}`} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Carbon target */}
      <div className="font-mono text-[var(--teal)]">
        Carbon avoided today: {log.carbon_avoided_kgco2e.toFixed(1)} kg CO₂e
      </div>

      {/* Simulator toggle */}
      <div className="flex items-center gap-3">
        <span className="text-[var(--muted)]">Simulator:</span>
        <button
          onClick={() => setSimRunning(r => !r)}
          className={`px-3 py-0.5 rounded border text-[10px] font-mono transition-colors ${
            simRunning
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(46,255,150,0.08)]'
              : 'border-[var(--rule)] text-[var(--muted)]'
          }`}
        >
          {simRunning ? '◼ Running' : '▶ Start'}
        </button>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Write TabNav.tsx**

```tsx
// components/layout/TabNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/zones',   label: 'Occupant Comfort' },
  { href: '/passive', label: 'Passive Strategies' },
  { href: '/nbs',     label: 'Nature-Based Solutions' },
]

export default function TabNav() {
  const path = usePathname()
  return (
    <nav className="flex border-b border-[var(--rule)] px-6 flex-shrink-0 bg-[#06100a]">
      {TABS.map(t => (
        <Link
          key={t.href}
          href={t.href}
          className={`px-5 py-3 text-[12px] tracking-wide border-b-2 transition-colors ${
            path.startsWith(t.href)
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
```

- [ ] **Step 4: Write app/(dashboard)/layout.tsx**

```tsx
// app/(dashboard)/layout.tsx
import GlobalHeader from '@/components/layout/GlobalHeader'
import GlobalFooter from '@/components/layout/GlobalFooter'
import TabNav from '@/components/layout/TabNav'
import AIDirectorSidebar from '@/components/ai/AIDirectorSidebar'
import KPIStrip from '@/components/KPIStrip'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <GlobalHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* AI Director Sidebar — fixed 280px */}
        <AIDirectorSidebar />
        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <KPIStrip />
          <TabNav />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
      <GlobalFooter />
    </div>
  )
}
```

- [ ] **Step 5: Commit layout shell**

```bash
git add components/layout/ app/\(dashboard\)/layout.tsx
git commit -m "feat: global header, footer, tab nav, dashboard shell"
```

---

### Task 5: KPI Strip + Alert Banner

**Files:**
- Create: `components/KPIStrip.tsx`
- Create: `components/AlertBanner.tsx`

- [ ] **Step 1: Write KPIStrip.tsx**

```tsx
// components/KPIStrip.tsx
import { KPI } from '@/lib/mock-data'

export default function KPIStrip() {
  const k = KPI
  const cells = [
    {
      label: 'Comfort Events Today',
      value: String(k.comfort_events_today),
      sub: `vs. ${k.comfort_events_7d_avg.toFixed(1)} / 7-day avg`,
      delta: k.comfort_events_today < k.comfort_events_7d_avg ? 'good' : 'warn',
    },
    {
      label: 'AI Proactive Intercepts',
      value: String(k.proactive_interceptions),
      sub: 'adjustments made today',
      delta: 'good',
    },
    {
      label: 'Passive Credit Today',
      value: `${k.passive_credit_kwh.toFixed(1)} kWh`,
      sub: 'avoided active HVAC load',
      delta: 'good',
    },
    {
      label: 'Carbon Avoided (kg/m²)',
      value: k.carbon_avoided_kg_m2.toFixed(4),
      sub: `target ${k.carbon_target_kg_m2.toFixed(4)} kg/m²`,
      delta: k.carbon_avoided_kg_m2 >= k.carbon_target_kg_m2 ? 'good' : 'warn',
    },
  ]

  return (
    <div className="grid grid-cols-4 border-b border-[var(--rule)] flex-shrink-0">
      {cells.map((c, i) => (
        <div key={i} className={`px-6 py-3 ${i < 3 ? 'border-r border-[var(--rule)]' : ''}`}>
          <div className="text-[9px] uppercase tracking-[0.14em] text-[var(--muted)] mb-1">{c.label}</div>
          <div className={`font-mono text-[20px] leading-none mb-1 ${c.delta === 'good' ? 'text-[var(--accent)]' : 'text-[var(--amber)]'}`}>
            {c.value}
          </div>
          <div className="text-[10px] text-[var(--muted)]">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit KPI strip**

```bash
git add components/KPIStrip.tsx
git commit -m "feat: KPI strip with 4 live metrics"
```

---

### Task 6: AI Director Sidebar + Gemini API Route

**Files:**
- Create: `components/ai/AIDirectorSidebar.tsx`
- Create: `components/ai/ChatBubble.tsx`
- Create: `components/ai/QuickCommandChips.tsx`
- Create: `lib/gemini.ts`
- Create: `app/api/admin/chat/route.ts`

- [ ] **Step 1: Write lib/gemini.ts**

```typescript
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { BUILDING, ZONES, CARBON_LOG, NBS_ASSETS, PRECONDITIONING_PLANS } from './mock-data'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export function getAdminModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildAdminSystemPrompt(),
  })
}

function buildAdminSystemPrompt(): string {
  return `You are ThermalIQ Director AI, an AI assistant for the facility manager and building owner. You have full read access to all building data and can recommend BMS commands after confirmation.

BUILDING: ${JSON.stringify({ name: BUILDING.name, address: BUILDING.address })}
ZONES: ${JSON.stringify(ZONES.map(z => ({ name: z.name, temp: z.current_temp_f, status: z.thermal_status, occupancy: z.current_occupancy_count, setpoint: z.setpoint_f })))}
CARBON_LOG (today): passive_credit=${CARBON_LOG.passive_credit_kwh}kWh, nbs_credit=${CARBON_LOG.nbs_credit_kwh}kWh, avoided=${CARBON_LOG.carbon_avoided_kgco2e}kg CO₂e
NBS_ASSETS: ${JSON.stringify(NBS_ASSETS.map(a => ({ name: a.name, moisture: a.current_soil_moisture_pct, cooling_credit: a.evap_cooling_credit_kw })))}
PRECONDITIONING_PLANS: ${JSON.stringify(PRECONDITIONING_PLANS.map(p => ({ zone: p.zone_name, start: p.scheduled_start, confidence: p.confidence, approved: p.approved })))}

Rules:
1. Always include a natural language answer and confidence level where forecasting.
2. If recommending a BMS command, append a JSON block after your response:
   {"bms_command":"SETPOINT|IRRIGATION|SHADING|VENTILATION","target_id":"...","value":0,"expected_outcome":"...","carbon_avoided_kgco2e":0}
3. Never expose individual occupant wearable data. Aggregates only.
4. For irrigation or setpoint override commands, state that admin must confirm before you output the bms_command block.
5. Cite data sources (sensor, forecast, model) for any specific claim.
6. Keep responses concise — 2–4 sentences for status queries, up to 8 sentences for planning queries.
7. For the 📋 Briefing command: report passive credit today, comfort events, gas boiler status, NBS contribution, and top alert.
8. For the 🌱 Irrigate command: confirm volume, timing, and expected cooling outcome before outputting bms_command.
9. For the ⚖️ Tradeoff command: report energy and carbon cost of the requested change.
10. For the 📅 Event Plan command: return full thermal strategy with irrigation time, passive sequence, precondition schedule, carbon estimate.`
}

export async function streamAdminChat(history: { role: string; parts: { text: string }[] }[], message: string) {
  const model = getAdminModel()
  const chat = model.startChat({ history })
  const result = await chat.sendMessageStream(message)
  return result
}
```

- [ ] **Step 2: Write app/api/admin/chat/route.ts**

```typescript
// app/api/admin/chat/route.ts
import { NextRequest } from 'next/server'
import { streamAdminChat } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { message, history = [] } = await req.json()

  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ content: 'Gemini API key not configured. Set GEMINI_API_KEY in .env.local.' })
  }

  try {
    const stream = await streamAdminChat(history, message)
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream.stream) {
          const text = chunk.text()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })
    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  } catch (e) {
    console.error('Gemini error:', e)
    return Response.json({ error: 'AI request failed' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Write ChatBubble.tsx**

```tsx
// components/ai/ChatBubble.tsx
'use client'
import type { ChatMessage } from '@/lib/types'

interface Props { msg: ChatMessage }

export default function ChatBubble({ msg }: Props) {
  const isUser = msg.role === 'USER'
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
      <div
        className={`max-w-[88%] px-4 py-3 rounded text-[12px] leading-relaxed ${
          isUser
            ? 'bg-[rgba(46,255,150,0.10)] border border-[rgba(46,255,150,0.25)] text-[var(--text)]'
            : 'bg-[var(--surface)] border border-[var(--rule)] text-[var(--text)]'
        }`}
      >
        {msg.content}
      </div>
      {msg.bms_command && (
        <div className="max-w-[88%] px-3 py-2 rounded border border-[var(--teal)] bg-[rgba(62,207,207,0.08)] text-[11px] font-mono text-[var(--teal)]">
          ↳ BMS: {msg.bms_command.bms_command} → {msg.bms_command.expected_outcome}
          {msg.bms_command.carbon_avoided_kgco2e > 0 && (
            <span className="ml-2 text-[var(--accent)]">−{msg.bms_command.carbon_avoided_kgco2e} kg CO₂e</span>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Write QuickCommandChips.tsx**

```tsx
// components/ai/QuickCommandChips.tsx
interface Props { onSelect: (cmd: string) => void }
const CHIPS = ['📋 Briefing', '🌱 Irrigate', '⚖️ Tradeoff', '📅 Event Plan']
export default function QuickCommandChips({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-[var(--rule)]">
      {CHIPS.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="px-3 py-1 rounded border border-[var(--rule)] text-[11px] text-[var(--muted)] hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors"
        >
          {c}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Write AIDirectorSidebar.tsx**

```tsx
// components/ai/AIDirectorSidebar.tsx
'use client'
import { useState, useRef, useEffect } from 'react'
import ChatBubble from './ChatBubble'
import QuickCommandChips from './QuickCommandChips'
import type { ChatMessage } from '@/lib/types'

const WELCOME: ChatMessage = {
  id: 'welcome', role: 'AI', mode: 'ADMIN',
  content: 'Good morning. East Open Plan is trending HOT at 77.1°F with 31 occupants. Passive pre-cooling plan for tomorrow is pending your approval. Type 📋 Briefing for a full status summary.',
  created_at: new Date().toISOString(),
}

export default function AIDirectorSidebar() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'USER', mode: 'ADMIN', content: text, created_at: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    const history = messages.filter(m => m.id !== 'welcome').map(m => ({
      role: m.role === 'USER' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!res.ok) throw new Error('API error')
      const contentType = res.headers.get('content-type') ?? ''

      if (contentType.includes('text/event-stream')) {
        // streaming
        const aiId = (Date.now() + 1).toString()
        setMessages(m => [...m, { id: aiId, role: 'AI', mode: 'ADMIN', content: '', created_at: new Date().toISOString() }])
        const reader = res.body!.getReader()
        const dec = new TextDecoder()
        let fullText = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const lines = dec.decode(value).split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            const payload = line.replace('data: ', '')
            if (payload === '[DONE]') break
            try { fullText += JSON.parse(payload).text } catch {}
          }
          setMessages(m => m.map(msg => msg.id === aiId ? { ...msg, content: fullText } : msg))
        }
        // parse BMS command if present
        const bmsMatch = fullText.match(/\{[^{}]*"bms_command"[^{}]*\}/s)
        if (bmsMatch) {
          try {
            const bms = JSON.parse(bmsMatch[0])
            setMessages(m => m.map(msg => msg.id === aiId ? { ...msg, bms_command: bms } : msg))
          } catch {}
        }
      } else {
        const data = await res.json()
        setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'AI', mode: 'ADMIN', content: data.content ?? data.error ?? 'Error.', created_at: new Date().toISOString() }])
      }
    } catch {
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'AI', mode: 'ADMIN', content: 'Connection error. Check your GEMINI_API_KEY.', created_at: new Date().toISOString() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="w-[280px] flex flex-col border-r border-[var(--rule)] flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--rule)]">
        <div className="flex items-center justify-between">
          <span className="font-display text-[15px] text-[var(--text)]">Director AI</span>
          <span className="text-[9px] px-2 py-0.5 rounded border border-[var(--teal)] text-[var(--teal)] font-mono">BACnet-linked</span>
        </div>
        <div className="text-[10px] text-[var(--muted)] mt-0.5">Natural language building control</div>
      </div>

      <QuickCommandChips onSelect={send} />

      {/* Message log */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map(m => <ChatBubble key={m.id} msg={m} />)}
        {loading && (
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] animate-pulse" />
            Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--rule)]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
            placeholder="Ask the Director…"
            className="flex-1 px-3 py-2 rounded bg-[var(--surface)] border border-[var(--rule)] text-[12px] text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--teal)]"
          />
          <button
            onClick={() => send(input)}
            disabled={loading}
            className="px-3 py-2 rounded bg-[rgba(46,255,150,0.15)] border border-[var(--accent)] text-[var(--accent)] text-[12px] hover:bg-[rgba(46,255,150,0.25)] transition-colors disabled:opacity-40"
          >
            ↑
          </button>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 6: Commit AI sidebar**

```bash
git add components/ai/ lib/gemini.ts app/api/admin/
git commit -m "feat: AI Director sidebar with Gemini streaming chat"
```

---

### Task 7: Zone Comfort Tab

**Files:**
- Create: `components/zones/FloorPlanGrid.tsx`
- Create: `components/zones/ZoneCard.tsx`
- Create: `components/zones/ZoneDetailPanel.tsx`
- Create: `components/zones/ComfortHistoryChart.tsx`
- Create: `app/(dashboard)/zones/page.tsx`

- [ ] **Step 1: Write ZoneCard.tsx**

```tsx
// components/zones/ZoneCard.tsx
'use client'
import type { Zone } from '@/lib/types'
import { statusColor, statusBg, formatTemp } from '@/lib/utils'

interface Props { zone: Zone; selected: boolean; onClick: () => void }

export default function ZoneCard({ zone, selected, onClick }: Props) {
  const color = statusColor(zone.thermal_status)
  return (
    <button
      onClick={onClick}
      style={{ borderColor: selected ? color : 'var(--rule)', background: selected ? statusBg(zone.thermal_status) : 'var(--surface)' }}
      className="rounded p-4 text-left border transition-all hover:border-[var(--teal)] cursor-pointer w-full"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-display text-[14px] text-[var(--text)] leading-tight">{zone.name}</span>
        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color, borderColor: color }}>
          {zone.thermal_status}
        </span>
      </div>
      <div className="font-mono text-[22px] leading-none mb-2" style={{ color }}>{formatTemp(zone.current_temp_f)}</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {[
          ['RH', `${zone.current_humidity_pct}%`],
          ['CO₂', `${zone.current_co2_ppm} ppm`],
          ['Occ.', `${zone.current_occupancy_count} people`],
          ['Floor', `${zone.floor}`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-[10px]">
            <span className="text-[var(--muted)]">{k}</span>
            <span className="font-mono text-[var(--text)]">{v}</span>
          </div>
        ))}
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Write FloorPlanGrid.tsx**

```tsx
// components/zones/FloorPlanGrid.tsx
import type { Zone } from '@/lib/types'
import ZoneCard from './ZoneCard'

interface Props { zones: Zone[]; selectedId: string; onSelect: (id: string) => void }

export default function FloorPlanGrid({ zones, selectedId, onSelect }: Props) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">Zone Status — Floor Plan View</div>
      <div className="grid grid-cols-2 gap-3">
        {zones.map(z => (
          <ZoneCard key={z.id} zone={z} selected={selectedId === z.id} onClick={() => onSelect(z.id)} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write ComfortHistoryChart.tsx**

```tsx
// components/zones/ComfortHistoryChart.tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { COMFORT_HISTORY } from '@/lib/mock-data'

export default function ComfortHistoryChart() {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">Comfort Events — Last 7 Days</div>
      <div className="h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={COMFORT_HISTORY} barSize={14} barGap={2}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(220,238,226,0.45)', fontFamily: 'Azeret Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(220,238,226,0.45)', fontFamily: 'Azeret Mono' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#06100a', border: '1px solid rgba(220,238,226,0.10)', color: '#dceee2', fontSize: 11, fontFamily: 'Azeret Mono' }} />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Azeret Mono' }} />
            <Bar dataKey="complaints" fill="#f0b840" name="Complaints" radius={[2,2,0,0]} />
            <Bar dataKey="proactive" fill="#2eff96" name="AI Proactive" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write ZoneDetailPanel.tsx**

```tsx
// components/zones/ZoneDetailPanel.tsx
'use client'
import { useState } from 'react'
import type { Zone } from '@/lib/types'
import { statusColor, formatTemp } from '@/lib/utils'

interface Props { zone: Zone }

export default function ZoneDetailPanel({ zone }: Props) {
  const [setpoint, setSetpoint] = useState(zone.setpoint_f)
  const [saved, setSaved] = useState(false)
  const color = statusColor(zone.thermal_status)
  const PRIVACY_THRESHOLD = 3

  async function writeSetpoint() {
    await fetch('/api/bms/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ building_id: zone.building_id, command_type: 'SETPOINT', target_id: zone.id, value: setpoint }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="border border-[var(--rule)] rounded p-5 bg-[var(--surface)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-display text-[18px] text-[var(--text)]">{zone.name}</div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">Floor {zone.floor} · {zone.area_sqm} m²</div>
        </div>
        <span className="text-[9px] uppercase tracking-wider px-2 py-1 rounded border" style={{ color, borderColor: color }}>
          {zone.thermal_status}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Temperature', value: formatTemp(zone.current_temp_f), accent: true },
          { label: 'Humidity', value: `${zone.current_humidity_pct}%` },
          { label: 'CO₂', value: `${zone.current_co2_ppm} ppm`, warn: zone.current_co2_ppm > 1000 },
          { label: 'Occupancy', value: `${zone.current_occupancy_count} people` },
        ].map(m => (
          <div key={m.label} className="px-3 py-2.5 rounded bg-[rgba(0,0,0,0.3)] border border-[var(--rule)]">
            <div className="text-[9px] uppercase tracking-wider text-[var(--muted)] mb-1">{m.label}</div>
            <div className={`font-mono text-[16px] ${m.accent ? '' : m.warn ? 'text-[var(--amber)]' : 'text-[var(--text)]'}`}
              style={m.accent ? { color } : undefined}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Comfort index */}
      {zone.current_occupancy_count >= PRIVACY_THRESHOLD ? (
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1.5">
            <span>Comfort Index</span><span className="font-mono text-[var(--text)]">{zone.comfort_index_pct}%</span>
          </div>
          <div className="h-1.5 bg-[rgba(0,0,0,0.4)] rounded overflow-hidden">
            <div className="h-full rounded transition-all" style={{ width: `${zone.comfort_index_pct}%`, background: color }} />
          </div>
        </div>
      ) : (
        <div className="mb-4 px-3 py-2 rounded border border-[var(--rule)] text-[11px] text-[var(--muted)] text-center">
          Comfort index hidden — fewer than 3 occupants
        </div>
      )}

      {/* Setpoint slider */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-[var(--muted)] mb-2">
          <span>BACnet Setpoint</span>
          <span className="font-mono text-[var(--teal)]">{setpoint.toFixed(1)}°F</span>
        </div>
        <input
          type="range" min={65} max={80} step={0.5} value={setpoint}
          onChange={e => setSetpoint(parseFloat(e.target.value))}
          className="w-full h-1 appearance-none bg-[var(--rule)] rounded cursor-pointer accent-[var(--teal)]"
        />
        <div className="flex justify-between text-[9px] text-[var(--muted)] mt-1"><span>65°F</span><span>80°F</span></div>
      </div>

      {/* AI optimization + write button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${zone.ai_optimization_active ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'}`} />
          <span className="text-[11px] text-[var(--muted)]">AI Optimization {zone.ai_optimization_active ? 'On' : 'Off'}</span>
        </div>
        <button
          onClick={writeSetpoint}
          className={`px-4 py-1.5 rounded border text-[11px] transition-colors ${
            saved
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(46,255,150,0.1)]'
              : 'border-[var(--teal)] text-[var(--teal)] hover:bg-[rgba(62,207,207,0.1)]'
          }`}
        >
          {saved ? '✓ Sent to BMS' : 'Write Setpoint'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write zones/page.tsx**

```tsx
// app/(dashboard)/zones/page.tsx
'use client'
import { useState } from 'react'
import { ZONES } from '@/lib/mock-data'
import FloorPlanGrid from '@/components/zones/FloorPlanGrid'
import ZoneDetailPanel from '@/components/zones/ZoneDetailPanel'
import ComfortHistoryChart from '@/components/zones/ComfortHistoryChart'

export default function ZonesPage() {
  const [selectedId, setSelectedId] = useState(ZONES[2].id) // start with HOT zone
  const selected = ZONES.find(z => z.id === selectedId)!

  return (
    <div className="grid grid-cols-[1fr_320px] gap-6 h-full">
      {/* Left: floor plan + chart */}
      <div className="flex flex-col gap-6">
        <FloorPlanGrid zones={ZONES} selectedId={selectedId} onSelect={setSelectedId} />
        <ComfortHistoryChart />
      </div>
      {/* Right: zone detail */}
      <div>
        <ZoneDetailPanel zone={selected} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Write BMS write route**

```typescript
// app/api/bms/write/route.ts
import { NextRequest } from 'next/server'
export async function POST(req: NextRequest) {
  const body = await req.json()
  // In production: connect to BACnet/Modbus adapter
  console.log('[BMS WRITE]', body)
  return Response.json({ success: true, message: `Mock BMS: ${body.command_type} ${body.target_id} → ${body.value}` })
}
```

- [ ] **Step 7: Commit zones tab**

```bash
git add components/zones/ app/\(dashboard\)/zones/ app/api/bms/
git commit -m "feat: zone comfort tab with floor plan, detail panel, comfort chart"
```

---

### Task 8: Passive Strategies Tab

**Files:**
- Create: `components/passive/TechConfigPanel.tsx`
- Create: `components/passive/PlanCard.tsx`
- Create: `components/passive/PreconditioningScheduler.tsx`
- Create: `components/passive/PassivePerformancePanel.tsx`
- Create: `app/(dashboard)/passive/page.tsx`

- [ ] **Step 1: Write TechConfigPanel.tsx**

```tsx
// components/passive/TechConfigPanel.tsx
'use client'
import { useState } from 'react'
import { PASSIVE_TECHNOLOGIES } from '@/lib/mock-data'
import type { PassiveTechnology } from '@/lib/types'

export default function TechConfigPanel() {
  const [techs, setTechs] = useState<PassiveTechnology[]>(PASSIVE_TECHNOLOGIES)
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggle(id: string) {
    setTechs(ts => ts.map(t => t.id === id ? { ...t, active: !t.active } : t))
  }

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">Passive Technologies</div>
      <div className="flex flex-col gap-2">
        {techs.map(t => (
          <div key={t.id} className="rounded border border-[var(--rule)] bg-[var(--surface)] overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[rgba(255,255,255,0.03)]"
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            >
              {/* Active toggle */}
              <button
                onClick={e => { e.stopPropagation(); toggle(t.id) }}
                className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${
                  t.active ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--rule)]'
                }`}
              />
              <span className="flex-1 text-[12px] text-[var(--text)]">{t.name}</span>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--rule)] text-[var(--muted)]">
                {t.category}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded border ${
                t.auto_dispatch
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-[var(--amber)] text-[var(--amber)]'
              }`}>
                {t.auto_dispatch ? 'Auto' : 'Approval'}
              </span>
            </div>
            {expanded === t.id && (
              <div className="px-4 pb-4 border-t border-[var(--rule)] pt-3">
                <div className="text-[11px] text-[var(--muted)] mb-3 leading-relaxed">{t.operational_constraints}</div>
                <div className="text-[10px] text-[var(--muted)]">Zones: {t.zone_ids.length} assigned</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write PlanCard.tsx**

```tsx
// components/passive/PlanCard.tsx
'use client'
import { useState } from 'react'
import type { PreconditioningPlan } from '@/lib/types'
import { confidenceBadge, formatKWh, formatCarbon, formatTime } from '@/lib/utils'

interface Props { plan: PreconditioningPlan }

export default function PlanCard({ plan }: Props) {
  const [approved, setApproved] = useState(plan.approved)
  const [paused, setPaused] = useState(false)

  return (
    <div className={`rounded border p-4 bg-[var(--surface)] transition-colors ${
      approved ? 'border-[rgba(46,255,150,0.35)]' : 'border-[var(--rule)]'
    } ${paused ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-display text-[14px] text-[var(--text)]">{plan.zone_name}</div>
          <div className="text-[10px] text-[var(--muted)] font-mono mt-0.5">
            {formatTime(plan.scheduled_start)} — {formatTime(plan.scheduled_end)}
          </div>
        </div>
        <span className={`text-[10px] font-mono ${confidenceBadge(plan.confidence)}`}>{plan.confidence}</span>
      </div>

      <p className="text-[11px] text-[var(--muted)] leading-relaxed mb-3">{plan.action_description}</p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          ['Saved', formatKWh(plan.energy_saved_kwh)],
          ['Carbon', formatCarbon(plan.carbon_saved_kgco2e)],
          ['Load −', `${plan.load_reduction_pct}%`],
        ].map(([k, v]) => (
          <div key={k} className="px-2 py-1.5 rounded bg-[rgba(0,0,0,0.3)]">
            <div className="text-[9px] text-[var(--muted)]">{k}</div>
            <div className="font-mono text-[12px] text-[var(--accent)]">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setApproved(a => !a)}
          disabled={paused}
          className={`flex-1 py-1.5 rounded border text-[11px] transition-colors ${
            approved
              ? 'border-[var(--accent)] text-[var(--accent)] bg-[rgba(46,255,150,0.1)]'
              : 'border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          {approved ? '✓ Approved' : 'Approve'}
        </button>
        <button
          onClick={() => setPaused(p => !p)}
          className="px-3 py-1.5 rounded border border-[var(--rule)] text-[11px] text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write PreconditioningScheduler.tsx**

```tsx
// components/passive/PreconditioningScheduler.tsx
import { PRECONDITIONING_PLANS } from '@/lib/mock-data'
import PlanCard from './PlanCard'

export default function PreconditioningScheduler() {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">Preconditioning Schedule — Next 24 Hours</div>
      <div className="flex flex-col gap-3">
        {PRECONDITIONING_PLANS.map(p => <PlanCard key={p.id} plan={p} />)}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write PassivePerformancePanel.tsx**

```tsx
// components/passive/PassivePerformancePanel.tsx
import { CARBON_LOG } from '@/lib/mock-data'

const ACTUATORS = [
  { name: 'Night Flush Dampers', status: 'STANDBY', reading: 'Closed — outdoor 68°F' },
  { name: 'Solar Shading Blinds', status: 'OPERATING', reading: '62% deployed — W façade' },
  { name: 'Evap. Pre-cooler', status: 'OPERATING', reading: 'WB 58°F — 18% AHU reduction' },
  { name: 'Electrochromic Glazing', status: 'OPERATING', reading: '15% transmittance — S/E' },
  { name: 'Stack Vents', status: 'OFFLINE', reading: 'Disabled — not configured' },
]
const statusDot = { OPERATING: 'var(--accent)', STANDBY: 'var(--amber)', OFFLINE: '#555' }

export default function PassivePerformancePanel() {
  const log = CARBON_LOG
  const counterfactual = log.passive_credit_kwh + log.active_hvac_kwh

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1">Actuator Status</div>
      {ACTUATORS.map(a => (
        <div key={a.name} className="flex items-start gap-3 px-4 py-3 rounded border border-[var(--rule)] bg-[var(--surface)]">
          <div className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" style={{ background: statusDot[a.status as keyof typeof statusDot] }} />
          <div>
            <div className="text-[12px] text-[var(--text)]">{a.name}</div>
            <div className="text-[10px] text-[var(--muted)] font-mono mt-0.5">{a.reading}</div>
          </div>
        </div>
      ))}

      {/* Credits */}
      <div className="rounded border border-[var(--rule)] p-4 bg-[var(--surface)]">
        <div className="text-[10px] text-[var(--muted)] mb-3 uppercase tracking-[0.12em]">Passive Credit Today</div>
        <div className="font-mono text-[28px] text-[var(--accent)] leading-none mb-1">{log.passive_credit_kwh.toFixed(1)} kWh</div>
        <div className="text-[11px] text-[var(--muted)]">Counterfactual HVAC: {counterfactual.toFixed(1)} kWh without passive systems</div>
        <div className="mt-3 h-1.5 bg-[rgba(0,0,0,0.4)] rounded overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded" style={{ width: `${(log.passive_credit_kwh / counterfactual * 100).toFixed(0)}%` }} />
        </div>
        <div className="text-[10px] text-[var(--muted)] mt-1">{(log.passive_credit_kwh / counterfactual * 100).toFixed(0)}% of potential load avoided</div>
      </div>

      {/* Forecast divergence */}
      <div className="rounded border border-[rgba(240,184,64,0.3)] p-4 bg-[rgba(240,184,64,0.05)]">
        <div className="text-[10px] text-[var(--amber)] uppercase tracking-[0.12em] mb-2">Forecast Divergence</div>
        <div className="text-[11px] text-[var(--muted)]">NWS forecast: <span className="font-mono text-[var(--text)]">88°F</span></div>
        <div className="text-[11px] text-[var(--muted)]">On-site sensor: <span className="font-mono text-[var(--amber)]">91.2°F</span> (+3.2°F)</div>
        <div className="text-[10px] text-[var(--muted)] mt-2 italic">Solar irradiance 8% above forecast — shading plan recalculated.</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write passive/page.tsx**

```tsx
// app/(dashboard)/passive/page.tsx
import TechConfigPanel from '@/components/passive/TechConfigPanel'
import PreconditioningScheduler from '@/components/passive/PreconditioningScheduler'
import PassivePerformancePanel from '@/components/passive/PassivePerformancePanel'

export default function PassivePage() {
  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      <TechConfigPanel />
      <PreconditioningScheduler />
      <PassivePerformancePanel />
    </div>
  )
}
```

- [ ] **Step 6: Commit passive tab**

```bash
git add components/passive/ app/\(dashboard\)/passive/
git commit -m "feat: passive strategies tab with tech config, schedule, performance"
```

---

### Task 9: Nature-Based Solutions Tab

**Files:**
- Create: `components/nbs/AssetRegisterPanel.tsx`
- Create: `components/nbs/NBSTelemetryPanel.tsx`
- Create: `components/nbs/NBSCoolingLoadChart.tsx`
- Create: `components/nbs/NBSActionPlanner.tsx`
- Create: `components/nbs/NBSDiagnosticsPanel.tsx`
- Create: `app/(dashboard)/nbs/page.tsx`
- Create: `app/api/nbs/irrigate/route.ts`

- [ ] **Step 1: Write AssetRegisterPanel.tsx**

```tsx
// components/nbs/AssetRegisterPanel.tsx
'use client'
import { useState } from 'react'
import { NBS_ASSETS } from '@/lib/mock-data'
import type { NBSAsset } from '@/lib/types'

interface Props { selectedId: string; onSelect: (id: string) => void }
const typeLabel: Record<string, string> = { GREEN_ROOF: 'Green Roof', ATRIUM_CANOPY: 'Atrium Canopy', GROUND_VEGETATION: 'Ground Veg.', LIVING_WALL: 'Living Wall', RAIN_GARDEN: 'Rain Garden', OTHER: 'Other' }

export default function AssetRegisterPanel({ selectedId, onSelect }: Props) {
  const [assets] = useState<NBSAsset[]>(NBS_ASSETS)
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">NBS Asset Register</div>
      <div className="flex flex-col gap-2">
        {assets.map(a => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`w-full text-left px-4 py-3 rounded border transition-colors ${
              selectedId === a.id
                ? 'border-[var(--teal)] bg-[rgba(62,207,207,0.08)]'
                : 'border-[var(--rule)] bg-[var(--surface)] hover:border-[var(--teal)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[var(--text)]">{a.name}</span>
              <span className="text-[9px] text-[var(--muted)]">{typeLabel[a.asset_type]}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] font-mono text-[var(--teal)]">{a.evap_cooling_credit_kw.toFixed(1)} kW credit</span>
              <span className={`text-[10px] font-mono ${a.current_soil_moisture_pct < 40 ? 'text-[var(--amber)]' : 'text-[var(--muted)]'}`}>
                {a.current_soil_moisture_pct}% moisture
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write NBSTelemetryPanel.tsx**

```tsx
// components/nbs/NBSTelemetryPanel.tsx
import type { NBSAsset } from '@/lib/types'

interface Props { asset: NBSAsset }

export default function NBSTelemetryPanel({ asset }: Props) {
  const lowMoisture = asset.current_soil_moisture_pct < 40
  const metrics = [
    {
      label: 'Soil Moisture', value: `${asset.current_soil_moisture_pct}%`,
      bar: asset.current_soil_moisture_pct, warn: lowMoisture,
      note: lowMoisture ? 'Below 40% threshold — irrigation recommended' : 'Moisture within optimal range',
      color: lowMoisture ? 'var(--amber)' : 'var(--teal)',
    },
    {
      label: 'Surface Temperature', value: `${asset.current_surface_temp_c.toFixed(1)} °C`,
      bar: Math.min(asset.current_surface_temp_c / 50 * 100, 100),
      warn: asset.current_surface_temp_c > 35,
      note: `Solar load: ${asset.current_surface_temp_c > 35 ? 'High — ET rate elevated' : 'Moderate'}`,
      color: asset.current_surface_temp_c > 35 ? 'var(--amber)' : 'var(--teal)',
    },
    {
      label: 'Evap. Cooling Credit', value: `${asset.evap_cooling_credit_kw.toFixed(2)} kW`,
      bar: Math.min(asset.evap_cooling_credit_kw / 5 * 100, 100),
      warn: false, note: 'Penman-Monteith estimate from sensor data', color: 'var(--accent)',
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-1">{asset.name} — Telemetry</div>
      {metrics.map(m => (
        <div key={m.label} className="rounded border border-[var(--rule)] bg-[var(--surface)] p-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-[0.1em]">{m.label}</span>
            <span className="font-mono text-[16px]" style={{ color: m.color }}>{m.value}</span>
          </div>
          <div className="h-1.5 bg-[rgba(0,0,0,0.4)] rounded overflow-hidden mb-2">
            <div className="h-full rounded" style={{ width: `${m.bar}%`, background: m.color }} />
          </div>
          <div className="text-[10px] text-[var(--muted)] italic">{m.note}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Write NBSCoolingLoadChart.tsx**

```tsx
// components/nbs/NBSCoolingLoadChart.tsx
'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const DATA = [
  { time: '09:00', withoutNBS: 48, withNBS: 42 },
  { time: '10:00', withoutNBS: 56, withNBS: 48 },
  { time: '11:00', withoutNBS: 68, withNBS: 57 },
  { time: '12:00', withoutNBS: 76, withNBS: 62 },
  { time: '13:00', withoutNBS: 82, withNBS: 66 },
  { time: '14:00', withoutNBS: 88, withNBS: 70 },
  { time: '15:00', withoutNBS: 84, withNBS: 67 },
  { time: '16:00', withoutNBS: 74, withNBS: 60 },
  { time: '17:00', withoutNBS: 60, withNBS: 51 },
  { time: '18:00', withoutNBS: 44, withNBS: 40 },
  { time: '19:00', withoutNBS: 32, withNBS: 30 },
]

export default function NBSCoolingLoadChart() {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">Cooling Load — NBS Counterfactual (kW thermal)</div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} barSize={12} barGap={2}>
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(220,238,226,0.45)', fontFamily: 'Azeret Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'rgba(220,238,226,0.45)', fontFamily: 'Azeret Mono' }} axisLine={false} tickLine={false} unit=" kW" />
            <Tooltip contentStyle={{ background: '#06100a', border: '1px solid rgba(220,238,226,0.10)', color: '#dceee2', fontSize: 11, fontFamily: 'Azeret Mono' }} />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Azeret Mono' }} />
            <Bar dataKey="withoutNBS" fill="rgba(240,184,64,0.6)" name="No NBS" radius={[2,2,0,0]} />
            <Bar dataKey="withNBS" fill="rgba(46,255,150,0.6)" name="With NBS Active" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write NBSActionPlanner.tsx**

```tsx
// components/nbs/NBSActionPlanner.tsx
'use client'
import { useState } from 'react'
import { NBS_ACTIONS } from '@/lib/mock-data'
import type { NBSAction } from '@/lib/types'
import { confidenceBadge } from '@/lib/utils'

export default function NBSActionPlanner() {
  const [actions, setActions] = useState<NBSAction[]>(NBS_ACTIONS)
  const [pulsing, setPulsing] = useState<string | null>(null)

  function authorize(id: string) {
    setActions(as => as.map(a => a.id === id ? { ...a, approved: true, status: 'SCHEDULED' } : a))
  }

  async function pulseNow(action: NBSAction) {
    setPulsing(action.id)
    await fetch('/api/nbs/irrigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset_id: action.asset_id, volume_kl: action.irrigation_volume_kl, admin_id: 'admin-001' }),
    })
    setActions(as => as.map(a => a.id === action.id ? { ...a, status: 'EXECUTED', approved: true } : a))
    setPulsing(null)
  }

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">NBS Action Planner</div>
      <div className="flex flex-col gap-3">
        {actions.map(a => (
          <div key={a.id} className={`rounded border p-4 bg-[var(--surface)] ${
            a.status === 'EXECUTED' ? 'border-[rgba(46,255,150,0.35)] opacity-60' : 'border-[var(--rule)]'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="font-display text-[13px] text-[var(--text)]">{a.asset_name}</div>
              <span className={`text-[10px] font-mono ${confidenceBadge(a.confidence)}`}>{a.confidence}</span>
            </div>
            <p className="text-[11px] text-[var(--muted)] mb-2 leading-relaxed">{a.action_description}</p>
            <p className="text-[10px] text-[var(--teal)] mb-3 italic">{a.expected_outcome}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[12px] text-[var(--accent)]">
                {a.carbon_impact_kgco2e > 0 ? `−${a.carbon_impact_kgco2e}` : `+${Math.abs(a.carbon_impact_kgco2e)}`} kg CO₂e
              </span>
              <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                a.status === 'EXECUTED' ? 'border-[var(--accent)] text-[var(--accent)]' :
                a.status === 'SCHEDULED' ? 'border-[var(--teal)] text-[var(--teal)]' :
                'border-[var(--rule)] text-[var(--muted)]'
              }`}>{a.status}</span>
            </div>
            {a.status === 'PENDING' && (
              <div className="flex gap-2">
                <button onClick={() => authorize(a.id)} className="flex-1 py-1.5 rounded border border-[var(--teal)] text-[11px] text-[var(--teal)] hover:bg-[rgba(62,207,207,0.1)] transition-colors">
                  Authorize
                </button>
                {a.irrigation_volume_kl > 0 && (
                  <button
                    onClick={() => pulseNow(a)}
                    disabled={pulsing === a.id}
                    className="px-3 py-1.5 rounded border border-[var(--accent)] text-[11px] text-[var(--accent)] hover:bg-[rgba(46,255,150,0.1)] transition-colors disabled:opacity-40"
                  >
                    {pulsing === a.id ? '…' : 'Pulse Now'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Write NBSDiagnosticsPanel.tsx**

```tsx
// components/nbs/NBSDiagnosticsPanel.tsx
import { NBS_ASSETS } from '@/lib/mock-data'

export default function NBSDiagnosticsPanel() {
  const alerts = NBS_ASSETS.filter(a => a.current_soil_moisture_pct < 40 || a.current_surface_temp_c > 35)
  const allGood = alerts.length === 0

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-3">NBS Diagnostics</div>
      {allGood ? (
        <div className="rounded border border-[rgba(46,255,150,0.3)] bg-[rgba(46,255,150,0.06)] p-4">
          <div className="text-[var(--accent)] font-display text-[14px] mb-1">All assets nominal</div>
          <div className="text-[11px] text-[var(--muted)]">
            Total evaporative cooling credit: {NBS_ASSETS.reduce((s, a) => s + a.evap_cooling_credit_kw, 0).toFixed(2)} kW
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map(a => (
            <div key={a.id} className="rounded border border-[rgba(240,184,64,0.35)] bg-[rgba(240,184,64,0.06)] p-3">
              <div className="text-[12px] text-[var(--amber)]">{a.name}</div>
              {a.current_soil_moisture_pct < 40 && (
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  Soil moisture: <span className="font-mono text-[var(--amber)]">{a.current_soil_moisture_pct}%</span> — below 40% threshold
                </div>
              )}
              {a.current_surface_temp_c > 35 && (
                <div className="text-[11px] text-[var(--muted)] mt-1">
                  Surface temp: <span className="font-mono text-[var(--amber)]">{a.current_surface_temp_c}°C</span> — heat stress risk
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Write nbs/page.tsx**

```tsx
// app/(dashboard)/nbs/page.tsx
'use client'
import { useState } from 'react'
import { NBS_ASSETS } from '@/lib/mock-data'
import AssetRegisterPanel from '@/components/nbs/AssetRegisterPanel'
import NBSTelemetryPanel from '@/components/nbs/NBSTelemetryPanel'
import NBSCoolingLoadChart from '@/components/nbs/NBSCoolingLoadChart'
import NBSActionPlanner from '@/components/nbs/NBSActionPlanner'
import NBSDiagnosticsPanel from '@/components/nbs/NBSDiagnosticsPanel'

export default function NBSPage() {
  const [selectedId, setSelectedId] = useState(NBS_ASSETS[0].id)
  const selected = NBS_ASSETS.find(a => a.id === selectedId)!

  return (
    <div className="grid grid-cols-[220px_1fr_260px] gap-6 h-full">
      <AssetRegisterPanel selectedId={selectedId} onSelect={setSelectedId} />
      <div className="flex flex-col gap-5">
        <NBSTelemetryPanel asset={selected} />
        <NBSCoolingLoadChart />
      </div>
      <div className="flex flex-col gap-5">
        <NBSActionPlanner />
        <NBSDiagnosticsPanel />
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Write NBS irrigate route**

```typescript
// app/api/nbs/irrigate/route.ts
import { NextRequest } from 'next/server'
export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('[NBS IRRIGATE]', body)
  return Response.json({ success: true, message: `Irrigation pulse triggered: ${body.volume_kl}kL to asset ${body.asset_id}` })
}
```

- [ ] **Step 8: Commit NBS tab**

```bash
git add components/nbs/ app/\(dashboard\)/nbs/ app/api/nbs/
git commit -m "feat: NBS tab with asset register, telemetry, counterfactual chart, action planner"
```

---

### Task 10: GitHub + Vercel Deployment

**Files:**
- Create: `.gitignore` (ensure .env.local excluded)
- Create: `vercel.json`

- [ ] **Step 1: Verify .env.local excluded from git**

```bash
grep ".env.local" .gitignore || echo ".env.local" >> .gitignore
```

- [ ] **Step 2: Create GitHub repo and push**

```bash
gh repo create thermaliq --public --source=. --remote=origin --push
```

- [ ] **Step 3: Install Vercel CLI and deploy**

```bash
npm install -g vercel
vercel --yes 2>&1
```

- [ ] **Step 4: Add env vars to Vercel**

```bash
vercel env add GEMINI_API_KEY production
# paste key when prompted
```

- [ ] **Step 5: Final production deploy**

```bash
vercel --prod
```

---

## Self-Review

**Spec coverage:**
- Section 2 (data models) → all types in `lib/types.ts` ✓
- Section 4 layout (header 52px, footer 36px, sidebar 280px) → `(dashboard)/layout.tsx` ✓
- KPI strip (4 cells) → `KPIStrip.tsx` ✓
- AIDirectorSidebar with quick commands → `AIDirectorSidebar.tsx` ✓
- OccupantComfortTab (floor plan + chart + zone detail) → `zones/page.tsx` ✓
- PassiveStrategiesTab (3 columns) → `passive/page.tsx` ✓
- NBS tab (left + center + right) → `nbs/page.tsx` ✓
- Section 5 system prompts → `lib/gemini.ts` ✓
- Section 6 API endpoints → all routes created ✓
- Section 8 privacy: comfort index hidden if < 3 occupants → `ZoneDetailPanel.tsx` ✓
- Streaming Gemini responses → `AIDirectorSidebar.tsx` + `api/admin/chat/route.ts` ✓

**Not included (Phase 3–5 per spec):** Supabase live data sync, HealthKit wearable integration, ML models, React Native mobile app, BACnet real adapter, CSV/PDF export. These require dedicated phases.
