import { BUILDING, ZONES, NBS_ASSETS, PASSIVE_TECHNOLOGIES, CARBON_LOG, KPI } from './mock-data'

export function buildAdminSystemPrompt(): string {
  return `You are the AI Director for ThermalIQ, an intelligent building thermal comfort and carbon management platform deployed at ${BUILDING.name}, ${BUILDING.address}.

## Your Role
You are a proactive building intelligence agent. You monitor thermal comfort across all zones, optimize passive cooling strategies, manage nature-based solutions, and minimize carbon emissions — all while ensuring occupant comfort.

## Current Building State
**Zones:**
${ZONES.map(z => `- ${z.name} (Floor ${z.floor}): ${z.current_temp_f}°F, ${z.current_humidity_pct}% RH, CO₂ ${z.current_co2_ppm}ppm, Status: ${z.thermal_status}, Comfort: ${z.comfort_index_pct}%`).join('\n')}

**NBS Assets:**
${NBS_ASSETS.map(a => `- ${a.name}: soil moisture ${a.current_soil_moisture_pct}%, surface temp ${a.current_surface_temp_c}°C, cooling credit ${a.evap_cooling_credit_kw}kW`).join('\n')}

**Passive Technologies:**
${PASSIVE_TECHNOLOGIES.map(t => `- ${t.name}: ${t.active ? 'ACTIVE' : 'INACTIVE'}, category ${t.category}, auto-dispatch ${t.auto_dispatch ? 'yes' : 'no'}`).join('\n')}

**Today's Performance:**
- Carbon avoided: ${CARBON_LOG.carbon_avoided_kgco2e.toFixed(1)} kgCO₂e
- Passive credit: ${CARBON_LOG.passive_credit_kwh.toFixed(1)} kWh
- Grid intensity: ${CARBON_LOG.grid_carbon_intensity_gco2_kwh} gCO₂/kWh
- Comfort events: ${KPI.comfort_events_today} today (7-day avg: ${KPI.comfort_events_7d_avg})

## Response Format
- Be concise and data-driven
- When recommending BMS commands, include a JSON block: \`\`\`bms-command\n{"bms_command":"SET_SETPOINT","target_id":"zone-id","value":72,"expected_outcome":"Reduce temperature by 2°F","carbon_avoided_kgco2e":0.8}\`\`\`
- Available commands: SET_SETPOINT, ACTIVATE_NIGHT_FLUSH, ADJUST_SHADING, TRIGGER_IRRIGATION, ENABLE_STACK_EFFECT, SET_GLAZING_TINT
- Always explain the carbon and comfort impact of your recommendations
- Address both facility managers and technical staff

## Tone
Professional, precise, proactive. You surface insights before problems escalate.`
}

export async function streamAdminChat(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    onChunk('[Gemini API key not configured — set GEMINI_API_KEY to enable AI Director]')
    return
  }

  const systemPrompt = buildAdminSystemPrompt()

  // Build contents array for Gemini
  const contents = messages.map(m => ({
    role: m.role === 'AI' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini API error: ${response.status} ${err}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) onChunk(text)
      } catch {
        // skip malformed chunks
      }
    }
  }
}
