// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ThermalStatus, Confidence } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function statusColor(status: ThermalStatus): string {
  const map: Record<ThermalStatus, string> = {
    OK:   'var(--ok)',
    WARN: 'var(--warn)',
    HOT:  'var(--hot)',
    COLD: 'var(--cold)',
  }
  return map[status]
}

export function statusBg(status: ThermalStatus): string {
  const map: Record<ThermalStatus, string> = {
    OK:   'rgba(46,125,90,0.10)',
    WARN: 'rgba(184,124,74,0.10)',
    HOT:  'rgba(196,90,74,0.10)',
    COLD: 'rgba(74,154,160,0.10)',
  }
  return map[status]
}

export function confidenceBadge(c: Confidence): string {
  const map: Record<Confidence, string> = {
    HIGH:   'var(--ok)',
    MEDIUM: 'var(--warn)',
    LOW:    'var(--hot)',
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
