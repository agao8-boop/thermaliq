'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/overview', label: 'Overview' },
  { href: '/zones',    label: 'Comfort' },
  { href: '/passive',  label: 'Passive' },
  { href: '/nbs',      label: 'Nature' },
]

export default function TabNav() {
  const path = usePathname()
  return (
    <nav
      style={{
        display: 'flex',
        gap: 6,
        padding: '10px 24px',
        flexShrink: 0,
        borderBottom: '1px solid var(--lg-ink-08)',
        background: 'rgba(255,255,255,0.30)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {TABS.map(t => {
        const active = path === t.href || (t.href !== '/overview' && path.startsWith(t.href))
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--r-pill)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--lg-ink-deep)' : 'var(--lg-ink-55)',
              textDecoration: 'none',
              transition: 'all 0.15s',
              ...(active ? {
                background: 'var(--lg-white-hi)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--lg-stroke)',
                boxShadow: '0 2px 8px -4px rgba(31,53,52,0.20), 0 1px 0 rgba(255,255,255,0.95) inset',
              } : {
                border: '1px solid transparent',
              }),
            }}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
