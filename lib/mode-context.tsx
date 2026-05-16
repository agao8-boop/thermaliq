'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type AppMode = 'MANAGER' | 'OCCUPANT'

interface ModeContextValue {
  mode: AppMode
  setMode: (m: AppMode) => void
}

const ModeContext = createContext<ModeContextValue>({
  mode: 'MANAGER',
  setMode: () => {},
})

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('MANAGER')

  useEffect(() => {
    const saved = localStorage.getItem('thermaliq-mode') as AppMode | null
    if (saved === 'OCCUPANT' || saved === 'MANAGER') setModeState(saved)
  }, [])

  function setMode(m: AppMode) {
    setModeState(m)
    localStorage.setItem('thermaliq-mode', m)
  }

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>
}

export function useMode() {
  return useContext(ModeContext)
}
