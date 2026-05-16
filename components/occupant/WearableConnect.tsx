'use client'
import { useState } from 'react'

type WearableStatus = 'disconnected' | 'scanning' | 'connected'

const DEVICES = [
  { id: 'apple-watch', name: 'Apple Watch', icon: '⌚', desc: 'Series 4+ via HealthKit' },
  { id: 'fitbit', name: 'Fitbit Sense', icon: '⬡', desc: 'Sense / Versa 3+' },
  { id: 'garmin', name: 'Garmin Venu', icon: '◉', desc: 'Venu / Vivoactive 4+' },
]

export default function WearableConnect() {
  const [status, setStatus] = useState<WearableStatus>('disconnected')
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null)

  function connect(deviceId: string) {
    setSelectedDevice(deviceId)
    setStatus('scanning')
    setTimeout(() => {
      setStatus('connected')
      setConnectedDevice(deviceId)
    }, 2200)
  }

  function disconnect() {
    setStatus('disconnected')
    setConnectedDevice(null)
    setSelectedDevice(null)
  }

  const device = DEVICES.find(d => d.id === connectedDevice)

  return (
    <div
      className="glass"
      style={{ borderRadius: 20, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>
            Wearable Integration
          </div>
          <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500, marginTop: 2 }}>
            Personal Biometrics
          </div>
        </div>
        {status === 'connected' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 0 3px rgba(46,125,90,0.20)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.06em' }}>CONNECTED</span>
          </div>
        )}
      </div>

      {status === 'disconnected' && (
        <>
          <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
            Connect your wearable to enable personalised comfort adjustments based on your skin temperature, heart rate, and activity level.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEVICES.map(d => (
              <button
                key={d.id}
                onClick={() => connect(d.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1.5px solid rgba(26,43,34,0.12)',
                  background: 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(46,125,90,0.06)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,43,34,0.12)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.55)'
                }}
              >
                <span style={{ fontSize: 20 }}>{d.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{d.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--accent)' }}>Connect →</span>
              </button>
            ))}
          </div>
        </>
      )}

      {status === 'scanning' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }} className="shimmer">⬡</div>
          <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 4 }}>Scanning for device…</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>Make sure Bluetooth is on and device is nearby</div>
        </div>
      )}

      {status === 'connected' && device && (
        <>
          <div
            style={{
              background: 'rgba(46,125,90,0.08)',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1.5px solid rgba(46,125,90,0.20)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{device.icon}</span>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{device.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Live biometric stream active</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Skin Temp', value: '34.2°C', note: 'Normal' },
                { label: 'Heart Rate', value: '68 bpm', note: 'Resting' },
                { label: 'Activity', value: 'Sedentary', note: '' },
                { label: 'Comfort Est.', value: 'Neutral+', note: '' },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--muted)', marginBottom: 2 }}>
                    {m.label}
                  </div>
                  <div style={{ fontFamily: 'Azeret Mono, monospace', fontSize: 13, color: 'var(--accent)' }}>
                    {m.value}
                    {m.note && <span style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 4 }}>{m.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={disconnect}
            style={{
              fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none',
              cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3,
            }}
          >
            Disconnect device
          </button>
        </>
      )}
    </div>
  )
}
