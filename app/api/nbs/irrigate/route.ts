import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { asset_id, duration_minutes } = await req.json()

  if (!asset_id) {
    return NextResponse.json({ error: 'asset_id required' }, { status: 400 })
  }

  await new Promise(r => setTimeout(r, 200))

  return NextResponse.json({
    ok: true,
    asset_id,
    duration_minutes: duration_minutes ?? 15,
    started_at: new Date().toISOString(),
    expected_completion: new Date(Date.now() + (duration_minutes ?? 15) * 60_000).toISOString(),
    estimated_cooling_kw: 2.4,
    estimated_carbon_avoided_kgco2e: 0.42,
  })
}
