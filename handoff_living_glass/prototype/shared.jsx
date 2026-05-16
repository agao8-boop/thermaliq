// Shared mock data + small helpers reused across the 3 design directions.

const ZONES = [
  { id: 'z-001', name: 'North Office',     floor: 3, area: 420, temp: 74.2, sp: 72, rh: 44, co2: 820,  occ: 18, comfort: 71, status: 'WARN', x: 0.10, y: 0.30, w: 0.32, h: 0.30 },
  { id: 'z-002', name: 'South Conference', floor: 3, area: 180, temp: 71.8, sp: 71, rh: 48, co2: 1140, occ: 12, comfort: 88, status: 'OK',   x: 0.46, y: 0.62, w: 0.22, h: 0.24 },
  { id: 'z-003', name: 'East Open Plan',   floor: 4, area: 560, temp: 77.1, sp: 72, rh: 38, co2: 740,  occ: 31, comfort: 54, status: 'HOT',  x: 0.46, y: 0.30, w: 0.40, h: 0.30 },
  { id: 'z-004', name: 'West Executive',   floor: 4, area: 240, temp: 70.5, sp: 71, rh: 52, co2: 610,  occ: 5,  comfort: 67, status: 'COLD', x: 0.10, y: 0.62, w: 0.32, h: 0.24 },
  { id: 'z-005', name: 'Atrium L2',        floor: 2, area: 680, temp: 73.0, sp: 73, rh: 55, co2: 680,  occ: 24, comfort: 92, status: 'OK',   x: 0.30, y: 0.06, w: 0.40, h: 0.20 },
  { id: 'z-006', name: 'Roof Terrace',     floor: 6, area: 310, temp: 82.4, sp: 78, rh: 22, co2: 420,  occ: 8,  comfort: 48, status: 'HOT',  x: 0.70, y: 0.06, w: 0.20, h: 0.18 },
];

const PASSIVE = [
  { id: 'pt-1', name: 'Night Flush Ventilation',     active: true,  auto: true,  cat: 'VENTILATION' },
  { id: 'pt-2', name: 'Automated Solar Shading',     active: true,  auto: true,  cat: 'SHADING' },
  { id: 'pt-3', name: 'Thermal Mass Pre-cooling',    active: true,  auto: false, cat: 'THERMAL_MASS' },
  { id: 'pt-4', name: 'Stack Effect Ventilation',    active: false, auto: false, cat: 'STACK' },
  { id: 'pt-5', name: 'Indirect Evaporative Pre-cool', active: true, auto: true, cat: 'EVAPORATIVE' },
  { id: 'pt-6', name: 'Electrochromic Glazing',      active: true,  auto: true,  cat: 'GLAZING' },
];

const NBS = [
  { id: 'nbs-1', name: 'Green Roof — West Wing',  type: 'Green roof',   moisture: 28, surface: 38.2, credit: 1.4, area: 305, alert: true  },
  { id: 'nbs-2', name: 'Atrium Canopy Trees',     type: 'Canopy',       moisture: 64, surface: 24.1, credit: 1.8, area: 120, alert: false },
  { id: 'nbs-3', name: 'Bioswale — South Entry',  type: 'Rain garden',  moisture: 71, surface: 29.8, credit: 0.3, area: 85,  alert: false },
  { id: 'nbs-4', name: 'Living Wall — Lobby',     type: 'Living wall',  moisture: 58, surface: 22.4, credit: 0.6, area: 40,  alert: false },
];

// 14-day carbon series — gentle downward trend (kg CO2e / m² avoided)
const CARBON_SERIES = [
  0.0042, 0.0048, 0.0051, 0.0049, 0.0056, 0.0061, 0.0058,
  0.0064, 0.0068, 0.0065, 0.0072, 0.0075, 0.0078, 0.0070,
];
const CARBON_TARGET = 0.010;

// Passive vs active load split, 7 days, kWh
const LOAD_STACK = [
  { day: 'Mon', passive: 18, nbs: 4,  active: 312 },
  { day: 'Tue', passive: 22, nbs: 5,  active: 298 },
  { day: 'Wed', passive: 28, nbs: 6,  active: 276 },
  { day: 'Thu', passive: 34, nbs: 7,  active: 254 },
  { day: 'Fri', passive: 30, nbs: 8,  active: 268 },
  { day: 'Sat', passive: 38, nbs: 9,  active: 220 },
  { day: 'Today', passive: 32, nbs: 8, active: 244 },
];

const KPI = {
  carbon_avoided_kg_m2: 0.0078,
  carbon_target_kg_m2:  0.010,
  carbon_ytd_t: 41.8,
  carbon_baseline_t: 68.2,
  passive_kwh: 32.4,
  nbs_kwh: 8.2,
  active_kwh: 244.0,
  proactive_intercepts: 6,
  comfort_today: 8,
  comfort_avg: 11.4,
  grid_intensity: 420,
  occupancy: 98,
};

// AI-suggested actions surfaced as cards (the "click-into-layer" idea — fewer at top, drawer reveals detail)
const AI_QUEUE = [
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
    rationale: 'Outdoor temp dropping to 58°F at 23:30. Run zones 1,3,5 until 05:00.',
    impact_kwh: 22.8, impact_kg: 9.6, eta: '11:30 PM', confidence: 'HIGH',
  },
  {
    id: 'q-4', priority: 'tomorrow', title: 'Pre-cool slab — East',
    rationale: 'Forecast 88°F. Charge concrete mass overnight via AHU at 68°F. Awaiting your approval.',
    impact_kwh: 18.4, impact_kg: 7.7, eta: '05:00–07:30', confidence: 'MEDIUM',
  },
];

const OCCUPANT_CONVO = [
  { role: 'AI',   text: "Good morning, Mia. Your zone — North Office — is reading 74.2°F, a touch warm. I've already nudged the supply temp down by 1.5° and deployed shading. Should resolve in about 8 minutes." },
  { role: 'USER', text: "It actually feels stuffy more than warm." },
  { role: 'AI',   text: "Noted. CO₂ is at 820 ppm — fine, but air movement is low. I'll open the atrium dampers for 20 minutes and bump fresh-air fraction to 32%. No setpoint change needed." },
];

const OCCUPANT_QUICK = [
  { id: 'warm',  label: 'Too warm' },
  { id: 'cold',  label: 'Too cold' },
  { id: 'air',   label: 'Stuffy air' },
  { id: 'noise', label: 'Too noisy' },
];

function statusToken(s, theme) {
  // theme: { ok, warn, hot, cold }
  return ({ OK: theme.ok, WARN: theme.warn, HOT: theme.hot, COLD: theme.cold })[s] || theme.warn;
}

function pct(x) { return Math.round(x); }

Object.assign(window, {
  ZONES, PASSIVE, NBS, CARBON_SERIES, CARBON_TARGET,
  LOAD_STACK, KPI, AI_QUEUE, OCCUPANT_CONVO, OCCUPANT_QUICK,
  statusToken, pct,
});
