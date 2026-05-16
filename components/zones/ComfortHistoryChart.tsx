'use client'
import { COMFORT_HISTORY } from '@/lib/mock-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ComfortHistoryChart() {
  const data = COMFORT_HISTORY.map(h => ({
    day: h.day,
    'Comfort Events': h.complaints,
    'AI Intercepts': h.proactive,
  }))

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '18px 20px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
        Comfort Events vs AI Intercepts — 7 Day Trend
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={16} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,43,34,0.07)" />
          <XAxis dataKey="day" tick={{ fill: 'rgba(26,43,34,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(26,43,34,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.90)', borderRadius: 10, fontSize: 12, color: 'var(--text)', boxShadow: '0 4px 16px rgba(50,90,70,0.12)' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(26,43,34,0.55)', paddingTop: 8 }} />
          <Bar dataKey="Comfort Events" fill="var(--warn)" opacity={0.75} radius={[4, 4, 0, 0]} />
          <Bar dataKey="AI Intercepts" fill="var(--ok)" opacity={0.80} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
