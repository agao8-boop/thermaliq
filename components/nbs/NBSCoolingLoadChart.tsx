'use client'
import { NBS_ASSETS } from '@/lib/mock-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function NBSCoolingLoadChart() {
  const data = NBS_ASSETS.map(a => ({
    name: a.name.split('—')[0].trim(),
    'Cooling Credit (kW)': a.evap_cooling_credit_kw,
    'Surface Temp (°C)': a.current_surface_temp_c,
  }))

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '18px 20px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
        NBS Cooling Performance
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={16} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,43,34,0.07)" />
          <XAxis dataKey="name" tick={{ fill: 'rgba(26,43,34,0.45)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(26,43,34,0.45)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.90)', borderRadius: 10, fontSize: 12, color: 'var(--text)', boxShadow: '0 4px 16px rgba(50,90,70,0.12)' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(26,43,34,0.55)' }} />
          <Bar dataKey="Cooling Credit (kW)" fill="var(--teal)" opacity={0.80} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Surface Temp (°C)" fill="var(--warn)" opacity={0.70} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
