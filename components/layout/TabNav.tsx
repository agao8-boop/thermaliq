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
      className="flex px-6 flex-shrink-0"
      style={{
        borderBottom: '1px solid rgba(26,43,34,0.10)',
        background: 'rgba(255,255,255,0.40)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {TABS.map(t => {
        const active = path.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              padding: '11px 20px',
              fontSize: 12,
              letterSpacing: '0.03em',
              fontWeight: active ? 500 : 400,
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
