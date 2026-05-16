import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ThermalIQ — Intelligent Building Comfort',
  description: 'AI-powered thermal comfort and carbon management for commercial buildings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
