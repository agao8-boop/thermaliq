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
