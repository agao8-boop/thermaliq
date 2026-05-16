import { NextRequest, NextResponse } from 'next/server'
import { BMSCommand } from '@/lib/types'

// Mock BMS write — in production this would call the BACnet/IP gateway
export async function POST(req: NextRequest) {
  const command: BMSCommand = await req.json()

  if (!command.bms_command || !command.target_id) {
    return NextResponse.json({ error: 'bms_command and target_id required' }, { status: 400 })
  }

  // Simulate a 300ms BMS round-trip
  await new Promise(r => setTimeout(r, 300))

  return NextResponse.json({
    ok: true,
    command,
    executed_at: new Date().toISOString(),
    message: `BMS command ${command.bms_command} applied to ${command.target_id}`,
  })
}
