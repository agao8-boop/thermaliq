// lib/mock-data.ts
import type {
  Zone, Building, PassiveTechnology, PreconditioningPlan,
  NBSAsset, NBSAction, CarbonLog, ComfortHistoryPoint, KPIData,
  AIQueueItem, LoadStackItem,
} from './types'

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
  {
    id: 'z-001', building_id: 'bld-001', name: 'North Office', floor: 3,
    area_sqm: 420, current_temp_f: 74.2, current_humidity_pct: 44,
    current_co2_ppm: 820, current_occupancy_count: 18, setpoint_f: 72,
    ai_optimization_active: true, thermal_status: 'WARN',
    comfort_index_pct: 71, updated_at: new Date().toISOString(),
    fp_x: 0.10, fp_y: 0.30, fp_w: 0.32, fp_h: 0.30,
  },
  {
    id: 'z-002', building_id: 'bld-001', name: 'South Conference', floor: 3,
    area_sqm: 180, current_temp_f: 71.8, current_humidity_pct: 48,
    current_co2_ppm: 1140, current_occupancy_count: 12, setpoint_f: 71,
    ai_optimization_active: true, thermal_status: 'OK',
    comfort_index_pct: 88, updated_at: new Date().toISOString(),
    fp_x: 0.46, fp_y: 0.62, fp_w: 0.22, fp_h: 0.24,
  },
  {
    id: 'z-003', building_id: 'bld-001', name: 'East Open Plan', floor: 4,
    area_sqm: 560, current_temp_f: 77.1, current_humidity_pct: 38,
    current_co2_ppm: 740, current_occupancy_count: 31, setpoint_f: 72,
    ai_optimization_active: true, thermal_status: 'HOT',
    comfort_index_pct: 54, updated_at: new Date().toISOString(),
    fp_x: 0.46, fp_y: 0.30, fp_w: 0.40, fp_h: 0.30,
  },
  {
    id: 'z-004', building_id: 'bld-001', name: 'West Executive', floor: 4,
    area_sqm: 240, current_temp_f: 70.5, current_humidity_pct: 52,
    current_co2_ppm: 610, current_occupancy_count: 5, setpoint_f: 71,
    ai_optimization_active: false, thermal_status: 'COLD',
    comfort_index_pct: 67, updated_at: new Date().toISOString(),
    fp_x: 0.10, fp_y: 0.62, fp_w: 0.32, fp_h: 0.24,
  },
  {
    id: 'z-005', building_id: 'bld-001', name: 'Atrium Level 2', floor: 2,
    area_sqm: 680, current_temp_f: 73.0, current_humidity_pct: 55,
    current_co2_ppm: 680, current_occupancy_count: 24, setpoint_f: 73,
    ai_optimization_active: true, thermal_status: 'OK',
    comfort_index_pct: 92, updated_at: new Date().toISOString(),
    fp_x: 0.30, fp_y: 0.06, fp_w: 0.40, fp_h: 0.20,
  },
  {
    id: 'z-006', building_id: 'bld-001', name: 'Roof Terrace', floor: 6,
    area_sqm: 310, current_temp_f: 82.4, current_humidity_pct: 22,
    current_co2_ppm: 420, current_occupancy_count: 8, setpoint_f: 78,
    ai_optimization_active: true, thermal_status: 'HOT',
    comfort_index_pct: 48, updated_at: new Date().toISOString(),
    fp_x: 0.70, fp_y: 0.06, fp_w: 0.20, fp_h: 0.18,
  },
]

export const PASSIVE_TECHNOLOGIES: PassiveTechnology[] = [
  {
    id: 'pt-001', building_id: 'bld-001', name: 'Night Flush Ventilation',
    active: true, auto_dispatch: true, zone_ids: ['z-001', 'z-003', 'z-005'],
    operational_constraints: 'Outdoor temp must be ≤ 65°F. Wind speed < 20 mph. Run 11 PM – 5 AM only.',
    category: 'VENTILATION',
  },
  {
    id: 'pt-002', building_id: 'bld-001', name: 'Automated Solar Shading',
    active: true, auto_dispatch: true, zone_ids: ['z-001', 'z-002', 'z-003'],
    operational_constraints: 'Deploy when direct solar irradiance > 500 W/m². Retract after 6 PM.',
    category: 'SHADING',
  },
  {
    id: 'pt-003', building_id: 'bld-001', name: 'Thermal Mass Pre-cooling',
    active: true, auto_dispatch: false, zone_ids: ['z-003', 'z-004'],
    operational_constraints: 'Cool exposed concrete slab via AHU to 68°F before 7 AM. Requires manual approval each day.',
    category: 'THERMAL_MASS',
  },
  {
    id: 'pt-004', building_id: 'bld-001', name: 'Stack Effect Ventilation',
    active: false, auto_dispatch: false, zone_ids: ['z-005'],
    operational_constraints: 'Open atrium high-level vents and low-level intakes. Only when outdoor temp < 72°F.',
    category: 'STACK',
  },
  {
    id: 'pt-005', building_id: 'bld-001', name: 'Indirect Evaporative Pre-cooling',
    active: true, auto_dispatch: true, zone_ids: ['z-001', 'z-002', 'z-003', 'z-004', 'z-005', 'z-006'],
    operational_constraints: 'Outdoor wet-bulb < 65°F required. Estimated energy reduction: 18–24% on AHU.',
    category: 'EVAPORATIVE',
  },
  {
    id: 'pt-006', building_id: 'bld-001', name: 'Electrochromic Glazing Control',
    active: true, auto_dispatch: true, zone_ids: ['z-002', 'z-004'],
    operational_constraints: 'Tint to 15% transmittance when solar angle > 30° and irradiance > 400 W/m².',
    category: 'GLAZING',
  },
]

export const PRECONDITIONING_PLANS: PreconditioningPlan[] = [
  {
    id: 'plan-001', building_id: 'bld-001', zone_id: 'z-003', zone_name: 'East Open Plan',
    scheduled_start: '2026-05-14T05:00:00Z', scheduled_end: '2026-05-14T07:30:00Z',
    action_description: 'Pre-cool East Open Plan via night flush + thermal mass charging. Supply air at 62°F from 5–7:30 AM.',
    energy_saved_kwh: 18.4, carbon_saved_kgco2e: 7.7, load_reduction_pct: 34,
    confidence: 'HIGH', approved: false, executed: false,
  },
  {
    id: 'plan-002', building_id: 'bld-001', zone_id: 'z-001', zone_name: 'North Office',
    scheduled_start: '2026-05-14T06:00:00Z', scheduled_end: '2026-05-14T07:00:00Z',
    action_description: 'Automated solar shading deploy at sunrise. Reduce east-facing glazing to 20% transmittance.',
    energy_saved_kwh: 6.2, carbon_saved_kgco2e: 2.6, load_reduction_pct: 15,
    confidence: 'HIGH', approved: true, executed: false,
  },
  {
    id: 'plan-003', building_id: 'bld-001', zone_id: 'z-006', zone_name: 'Roof Terrace',
    scheduled_start: '2026-05-14T07:30:00Z', scheduled_end: '2026-05-14T09:00:00Z',
    action_description: 'Indirect evaporative pre-cooling for Roof Terrace AHU. Outdoor conditions favorable: WB 58°F.',
    energy_saved_kwh: 9.1, carbon_saved_kgco2e: 3.8, load_reduction_pct: 22,
    confidence: 'MEDIUM', approved: false, executed: false,
  },
]

export const NBS_ASSETS: NBSAsset[] = [
  {
    id: 'nbs-001', building_id: 'bld-001', name: 'Green Roof — West Wing',
    asset_type: 'GREEN_ROOF', area_sqm: 305, active: true,
    irrigation_connected: true, irrigation_auto: false,
    seasonal_active_months: [5, 6, 7, 8, 9],
    current_soil_moisture_pct: 28, current_surface_temp_c: 38.2,
    evap_cooling_credit_kw: 1.4, updated_at: new Date().toISOString(),
  },
  {
    id: 'nbs-002', building_id: 'bld-001', name: 'Atrium Canopy Trees',
    asset_type: 'ATRIUM_CANOPY', area_sqm: 120, active: true,
    irrigation_connected: true, irrigation_auto: true,
    seasonal_active_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    current_soil_moisture_pct: 64, current_surface_temp_c: 24.1,
    evap_cooling_credit_kw: 1.8, updated_at: new Date().toISOString(),
  },
  {
    id: 'nbs-003', building_id: 'bld-001', name: 'Bioswale — South Entry',
    asset_type: 'RAIN_GARDEN', area_sqm: 85, active: true,
    irrigation_connected: false, irrigation_auto: false,
    seasonal_active_months: [4, 5, 6, 7, 8, 9, 10],
    current_soil_moisture_pct: 71, current_surface_temp_c: 29.8,
    evap_cooling_credit_kw: 0.3, updated_at: new Date().toISOString(),
  },
  {
    id: 'nbs-004', building_id: 'bld-001', name: 'Living Wall — Lobby',
    asset_type: 'LIVING_WALL', area_sqm: 40, active: true,
    irrigation_connected: true, irrigation_auto: true,
    seasonal_active_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    current_soil_moisture_pct: 58, current_surface_temp_c: 22.4,
    evap_cooling_credit_kw: 0.6, updated_at: new Date().toISOString(),
  },
]

export const NBS_ACTIONS: NBSAction[] = [
  {
    id: 'nbsa-001', building_id: 'bld-001', asset_id: 'nbs-001',
    asset_name: 'Green Roof — West Wing',
    action_description: 'Emergency irrigation pulse: 6 hours at 4 L/min to restore 60% VWC by 08:00 tomorrow.',
    expected_outcome: 'Roof surface temp drops from 38°C to ~28°C. Cooling credit increases from 1.4 kW to 3.8 kW.',
    carbon_impact_kgco2e: 1.9, confidence: 'HIGH',
    status: 'PENDING', approved: false, irrigation_volume_kl: 1.44,
  },
  {
    id: 'nbsa-002', building_id: 'bld-001', asset_id: 'nbs-003',
    asset_name: 'Bioswale — South Entry',
    action_description: 'Open underdrain valve for 48 hours to lower saturation from 71% to 40% before Thursday storm.',
    expected_outcome: 'Infiltration rate restored to 2.8 cm/hr. First-flush capture maximised.',
    carbon_impact_kgco2e: 45.0, confidence: 'HIGH',
    status: 'PENDING', approved: false, irrigation_volume_kl: 0,
  },
]

export const CARBON_LOG: CarbonLog = {
  id: 'cl-001',
  building_id: 'bld-001',
  log_date: new Date().toISOString().split('T')[0],
  passive_credit_kwh: 32.4,
  nbs_credit_kwh: 8.2,
  active_hvac_kwh: 284.0,
  carbon_avoided_kgco2e: 17.1,
  grid_carbon_intensity_gco2_kwh: 420,
  gas_boiler_active_minutes: 0,
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
  comfort_events_today: 8,
  comfort_events_7d_avg: 11.4,
  proactive_interceptions: 6,
  passive_credit_kwh: 32.4,
  carbon_avoided_kg_m2: 0.007,
  carbon_target_kg_m2: 0.010,
}

export const GRID_CARBON_INTENSITY = 420 // gCO₂/kWh

export const AI_QUEUE: AIQueueItem[] = [
  {
    id: 'q-1', priority: 'now', title: 'Cool East Open Plan',
    rationale: 'Zone 3.2° above setpoint with 31 occupants. Indirect evaporative pre-cool available — outdoor WB 58°F.',
    impact_kwh: 8.4, impact_kg: 3.5, eta: '12 min', confidence: 'HIGH',
  },
  {
    id: 'q-2', priority: 'now', title: 'Irrigate Green Roof — West',
    rationale: 'Soil moisture 28%. A 6h pulse restores 60% VWC and recovers 2.4 kW of cooling credit.',
    impact_kwh: 6.2, impact_kg: 2.6, eta: '2 h', confidence: 'HIGH',
  },
  {
    id: 'q-3', priority: 'tonight', title: 'Schedule Night Flush',
    rationale: 'Outdoor temp dropping to 58°F at 23:30. Run zones 1, 3, 5 until 05:00.',
    impact_kwh: 22.8, impact_kg: 9.6, eta: '11:30 PM', confidence: 'HIGH',
  },
  {
    id: 'q-4', priority: 'tomorrow', title: 'Pre-cool Slab — East',
    rationale: 'Forecast 88°F. Charge concrete mass overnight via AHU at 68°F. Awaiting your approval.',
    impact_kwh: 18.4, impact_kg: 7.7, eta: '05:00–07:30', confidence: 'MEDIUM',
  },
]

export const LOAD_STACK: LoadStackItem[] = [
  { day: 'Mon',   passive: 18, nbs: 4, active: 312 },
  { day: 'Tue',   passive: 22, nbs: 5, active: 298 },
  { day: 'Wed',   passive: 28, nbs: 6, active: 276 },
  { day: 'Thu',   passive: 34, nbs: 7, active: 254 },
  { day: 'Fri',   passive: 30, nbs: 8, active: 268 },
  { day: 'Sat',   passive: 38, nbs: 9, active: 220 },
  { day: 'Today', passive: 32, nbs: 8, active: 244 },
]

// 14-day carbon series (kg CO₂e / m² avoided) — gentle upward trend toward target
export const CARBON_SERIES_14D = [
  0.0042, 0.0048, 0.0051, 0.0049, 0.0056, 0.0061, 0.0058,
  0.0064, 0.0068, 0.0065, 0.0072, 0.0075, 0.0078, 0.0070,
]
export const CARBON_TARGET = 0.010

export const OCCUPANT_CONVO = [
  { role: 'AI' as const, text: "Good morning, Mia. Your zone — North Office — is reading 74.2°F, a touch warm. I've already nudged the supply temp down by 1.5° and deployed shading. Should resolve in about 8 minutes." },
  { role: 'USER' as const, text: "It actually feels stuffy more than warm." },
  { role: 'AI' as const, text: "Noted. CO₂ is at 820 ppm — fine, but air movement is low. I'll open the atrium dampers for 20 minutes and bump fresh-air fraction to 32%. No setpoint change needed." },
]

export const OCCUPANT_QUICK = [
  { id: 'warm',  label: 'Too warm' },
  { id: 'cold',  label: 'Too cold' },
  { id: 'air',   label: 'Stuffy air' },
  { id: 'noise', label: 'Too noisy' },
]

export const QUICK_CHIP_RESPONSES: Record<string, string> = {
  'Too warm': "I've nudged the supply air temp down 1.5° and opened your east dampers 20%. Should feel cooler in about 6 minutes.",
  'Too cold': "Raising supply temp by 2° and reducing fresh-air fraction to 18% — thermal mass should hold that for 90 minutes.",
  'Stuffy air': "CO₂ is fine at 820 ppm but velocity is low. Opening atrium dampers for 20 minutes and bumping fresh-air to 32%. No setpoint change.",
  'Too noisy': "I can't control acoustics directly, but I've checked: the AHU fan is at minimum speed. Consider noise-cancelling mode — I'll note your feedback.",
}
