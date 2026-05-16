import { PassiveTechnology } from '@/lib/types'

const CAT_LABEL: Record<string, string> = {
  VENTILATION:  'Ventilation',
  SHADING:      'Solar Shading',
  THERMAL_MASS: 'Thermal Mass',
  STACK:        'Stack Effect',
  EVAPORATIVE:  'Evaporative',
  GLAZING:      'Glazing',
  OTHER:        'Other',
}

export default function PassiveSheetBody({ tech }: { tech: PassiveTechnology }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Status hero */}
      <div
        style={{
          borderRadius: 'var(--r-card)',
          background: tech.active
            ? 'linear-gradient(155deg, rgba(63,127,102,0.10), transparent)'
            : 'linear-gradient(155deg, rgba(36,51,51,0.06), transparent)',
          border: `1px solid ${tech.active ? 'rgba(63,127,102,0.25)' : 'var(--lg-ink-08)'}`,
          padding: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span
            className={`status-dot status-dot--${tech.active ? 'ok' : 'warn'}`}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: tech.active ? 'var(--lg-mint-deep)' : 'var(--lg-amber)', fontFamily: 'var(--font-sans)' }}>
            {tech.active ? 'Active' : 'Inactive'}
          </span>
          <span style={{ flex: 1 }} />
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--r-pill)',
              background: 'rgba(255,255,255,0.60)',
              border: '1px solid var(--lg-ink-08)',
              fontSize: 9,
              color: 'var(--lg-ink-55)',
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
            }}
          >
            {CAT_LABEL[tech.category] || tech.category}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink-deep)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          {tech.name}
        </div>
      </div>

      {/* Constraints */}
      <div>
        <div className="label-eyebrow" style={{ marginBottom: 8 }}>Operational constraints</div>
        <div
          className="glass-soft"
          style={{ padding: '12px 14px', borderRadius: 'var(--r-card-sm)', fontSize: 12, color: 'var(--lg-ink-70)', lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}
        >
          {tech.operational_constraints}
        </div>
      </div>

      {/* Zone coverage */}
      <div>
        <div className="label-eyebrow" style={{ marginBottom: 8 }}>Zone coverage</div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
          {tech.zone_ids.map(id => (
            <span
              key={id}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--r-pill)',
                background: 'rgba(255,255,255,0.65)',
                border: '1px solid var(--lg-ink-08)',
                fontSize: 11,
                color: 'var(--lg-ink-70)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {id}
            </span>
          ))}
        </div>
      </div>

      {/* Auto dispatch toggle info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          borderRadius: 'var(--r-card-sm)',
          background: 'rgba(255,255,255,0.55)',
          border: '1px solid var(--lg-ink-08)',
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--lg-ink-70)', fontFamily: 'var(--font-sans)' }}>Auto dispatch</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          color: tech.auto_dispatch ? 'var(--lg-mint-deep)' : 'var(--lg-amber)',
        }}>
          {tech.auto_dispatch ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  )
}
