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
    <nav
      style={{ borderBottom: '1px solid var(--rule)', background: 'var(--bg)' }}
      className="flex px-6 flex-shrink-0"
    >
      {TABS.map(t => {
        const active = path.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              padding: '12px 20px',
              fontSize: 12,
              letterSpacing: '0.04em',
              borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
              color: active ? 'var(--accent)' : 'var(--muted)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
