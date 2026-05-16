// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ThermalStatus, Confidence } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function statusColor(status: ThermalStatus): string {
  const map: Record<ThermalStatus, string> = {
    OK:   '#2eff96',
    WARN: '#f0b840',
    HOT:  '#ff5c5c',
    COLD: '#3ecfcf',
  }
  return map[status]
}

export function statusBg(status: ThermalStatus): string {
  const map: Record<ThermalStatus, string> = {
    OK:   'rgba(46,255,150,0.10)',
    WARN: 'rgba(240,184,64,0.10)',
    HOT:  'rgba(255,92,92,0.10)',
    COLD: 'rgba(62,207,207,0.10)',
  }
  return map[status]
}

export function confidenceBadge(c: Confidence): string {
  const map: Record<Confidence, string> = {
    HIGH:   'text-[#2eff96]',
    MEDIUM: 'text-[#f0b840]',
    LOW:    'text-red-400',
  }
  return map[c]
}

export function formatTemp(f: number): string {
  return `${f.toFixed(1)}°F`
}

export function formatKWh(v: number): string {
  return `${v.toFixed(1)} kWh`
}

export function formatCarbon(v: number): string {
  return `${v.toFixed(1)} kg`
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Denver',
  })
}
