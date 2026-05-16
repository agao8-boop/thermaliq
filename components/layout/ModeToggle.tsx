'use client'
import { useMode, AppMode } from '@/lib/mode-context'
import { useRouter } from 'next/navigation'

const OPTIONS: { mode: AppMode; label: string; dest: string }[] = [
  { mode: 'MANAGER',  label: 'Admin',    dest: '/overview' },
  { mode: 'OCCUPANT', label: 'Occupant', dest: '/occupant' },
]

export default function ModeToggle() {
  const { mode, setMode } = useMode()
  const router = useRouter()

  function switchTo(m: AppMode, dest: string) {
    setMode(m)
    router.push(dest)
  }

  return (
    <div className="mode-toggle">
      {OPTIONS.map(o => (
        <button
          key={o.mode}
          onClick={() => switchTo(o.mode, o.dest)}
          className={`mode-toggle__option${mode === o.mode ? ' mode-toggle__option--active' : ''}`}
          style={{ border: 'none', background: mode === o.mode ? undefined : 'transparent' }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
