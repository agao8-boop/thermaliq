'use client'
import { NBS_ASSETS } from '@/lib/mock-data'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function NBSCoolingLoadChart() {
  const data = NBS_ASSETS.map(a => ({
    name: a.name.replace(' ', '\n'),
    'Cooling Credit (kW)': a.evap_cooling_credit_kw,
    'Surface Temp (°C)': a.current_surface_temp_c,
  }))

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--rule)',
        borderRadius: 6,
        padding: '16px',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
        NBS Cooling Performance
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={14} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(220,238,226,0.08)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(220,238,226,0.45)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(220,238,226,0.45)', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#0e1f16',
              border: '1px solid rgba(220,238,226,0.10)',
              borderRadius: 4,
              fontSize: 11,
              color: '#dceee2',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(220,238,226,0.45)' }} />
          <Bar dataKey="Cooling Credit (kW)" fill="#3ecfcf" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Surface Temp (°C)" fill="#f0b840" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
