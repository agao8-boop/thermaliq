// Mock AI responses — no API key required
// Used as fallback when GEMINI_API_KEY is not set

const MANAGER_RESPONSES: Record<string, string[]> = {
  zone: [
    `Here's a summary of all zones right now:\n\n• **East Open Plan (Floor 4)** is running HOT at 78.2°F — 5.2° above its setpoint. With 31 occupants and humidity at 38%, this is your most urgent comfort issue. I recommend lowering the setpoint to 70°F and activating stack effect ventilation.\n\n• **Roof Terrace** is at 83.4°F — outdoor solar load is significant today. Consider adjusting the shading override.\n\n• **South Conference & Atrium Level 2** are both in comfort range at 92% and 88% respectively.\n\n• **West Executive** is COLD at 70.5°F — only 5 occupants, setpoint is 71°F. A small +1°F adjustment would reduce heating load.\n\n**Net recommendation:** 3 BMS adjustments would bring all zones within 1°F of setpoint and save an estimated 4.2 kWh over the next 4 hours.`,
    `Zone status as of now:\n\n✓ 2 zones are comfortable (South Conference, Atrium Level 2)\n⚠ 1 zone needs attention (North Office — +2.2°F above setpoint)\n🔴 2 zones are critical (East Open Plan HOT, Roof Terrace HOT)\n❄ 1 zone is cool (West Executive — slight overcooling)\n\nOverall building comfort index: **64%** — below the 80% target. I can issue corrective BMS commands for all flagged zones. Shall I proceed?`,
  ],
  carbon: [
    `**Carbon performance today:**\n\nAvoided: **17.1 kgCO₂e** so far (65% of daily target)\nPassive credit: **32.4 kWh** from night flush + solar shading\nNBS credit: **8.2 kWh** from evapotranspiration cooling\nGrid intensity: **420 gCO₂/kWh** (moderate — Denver grid is coal-heavy this morning)\n\n**Opportunity:** If you activate stack effect ventilation in the Atrium and trigger Green Roof irrigation now, you can capture an additional **3.8 kWh** of passive credit before peak hours, avoiding approximately **1.6 kgCO₂e**.\n\n**Monthly projection:** On current trajectory, Meridian Tower will end May at **487 kgCO₂e avoided** — 12% above last month.`,
  ],
  comfort: [
    `**Active comfort issues** (ranked by impact):\n\n1. 🔴 **East Open Plan** — 31 occupants at 78.2°F. Suggested: SET_SETPOINT to 70°F + activate stack ventilation. Est. relief in 22 min.\n\n2. 🔴 **Roof Terrace** — 8 occupants at 83.4°F. Outdoor conditions limit options. Consider issuing an advisory to relocate meetings indoors.\n\n3. ⚠ **North Office** — 18 occupants at 74.2°F. Minor adjustment: SET_SETPOINT to 71°F would bring comfort index from 71% → 88%.\n\nShall I generate BMS commands for all three?`,
  ],
  flush: [
    `**Night flush analysis for tonight:**\n\nDenver forecast: Low of 58°F at 2 AM — optimal for flush ventilation (threshold: ≤65°F ✓)\nWind speed forecast: 8 mph ✓ (limit: <20 mph)\nRecommended window: **11:00 PM – 5:30 AM** (6.5 hours)\n\nBenefits:\n• Pre-cools concrete thermal mass by ~4°F\n• Reduces tomorrow's peak HVAC load by estimated 22%\n• Saves ~18 kWh and 7.6 kgCO₂e\n\nI can schedule this automatically. Should I issue the ACTIVATE_NIGHT_FLUSH command?`,
  ],
  irrigat: [
    `**NBS irrigation assessment:**\n\n🔴 **Green Roof — West Wing** is CRITICAL at 28% soil moisture (target: 60–70%). Surface temp is 38.2°C, reducing evaporative cooling capacity by ~65% from optimal.\n\nRecommended: Emergency irrigation pulse — 6 hours at 4 L/min starting now.\nExpected outcome: Surface temp drops to ~28°C, cooling credit increases from 1.4 kW → 3.8 kW.\nCarbon impact: +1.9 kgCO₂e avoided from reduced HVAC load.\n\nAll other NBS assets are within normal moisture range.\n\nShall I trigger the Green Roof irrigation?\`\`\`bms-command\n{"bms_command":"TRIGGER_IRRIGATION","target_id":"nbs-001","value":360,"expected_outcome":"Restore Green Roof soil moisture to 60% VWC, surface temp from 38°C to 28°C","carbon_avoided_kgco2e":1.9}\`\`\``,
  ],
  goal: [
    `Happy to help set carbon reduction goals for the next 30 days.\n\n**Current baseline (May 2026):**\n• Carbon avoided: ~487 kgCO₂e/month (projected)\n• Passive credit: ~890 kWh/month\n• Building carbon intensity: 0.007 kgCO₂e/m²/day\n\n**Suggested targets for June:**\n1. **Carbon avoided: 560 kgCO₂e** (+15%) — achievable by maximizing night flush and green roof irrigation\n2. **Passive credit: 1,050 kWh** (+18%) — requires consistent auto-dispatch of all 5 passive technologies\n3. **Comfort events: <6/day** (down from 8 today) — requires AI setpoint optimization to be always-on\n\nWould you like me to schedule daily check-ins and alert thresholds for these goals?`,
  ],
}

const OCCUPANT_RESPONSES: Record<string, string[]> = {
  hot: [
    `I can see your area is warmer than comfortable right now. A few things that might help:\n\n• I've logged your comfort feedback — the facility team has been notified.\n• The AI system is already working to cool **East Open Plan** — adjustments were made 8 minutes ago and you should feel improvement within the next 15–20 minutes.\n• In the meantime: blinds on the east-facing windows are set to 15% tint to block direct solar gain.\n\nIf you're still uncomfortable after 20 minutes, tap "Escalate" and the building manager will be alerted directly.`,
    `Thanks for letting me know. Your zone is currently at **78.2°F** with a target of 72°F — so yes, it's warmer than it should be.\n\nI've automatically adjusted the HVAC setpoint for your floor. You should feel a difference in about 15 minutes. The morning solar load is the main culprit today — the shading system is compensating.\n\nIs there anything specific making it worse? (Direct sunlight, computers, large meeting?)`,
  ],
  cold: [
    `Your area is measuring **70.5°F**, which is slightly below the comfort target of 71°F. A small HVAC adjustment has been requested — you should feel it warming up within 10 minutes.\n\nIf you're still cold after that, it may be worth checking if a window or vent is causing a draft. Would you like me to log a maintenance request?`,
  ],
  wearable: [
    `Connecting your wearable device gives ThermalIQ access to your personal comfort data — skin temperature, heart rate variability, and perspiration rate — to fine-tune the zone climate specifically for you.\n\n**Supported devices:**\n• Apple Watch (Series 4+)\n• Fitbit Sense / Versa 3+\n• Garmin Venu series\n\n**How it works:** Your data stays private. Only aggregate anonymised signals are used for zone adjustments — the system never shares individual biometric data.\n\nGo to **My Comfort → Wearable** and tap Connect to pair your device via Bluetooth.`,
  ],
  air: [
    `Your zone's air quality right now:\n\n• **CO₂:** 820 ppm — good (< 1000 ppm is comfortable; < 600 is excellent)\n• **Humidity:** 44% — comfortable range (40–60% is ideal)\n• **Ventilation:** Night flush ran last night, so fresh air supply is above average today\n\nOverall air quality is rated **Good**. No action needed.`,
  ],
}

const MANAGER_DEFAULT = [
  `I've analysed the current building state. Here are the top 3 actions I recommend right now:\n\n1. **Cool East Open Plan** — 31 occupants at 78.2°F. SET_SETPOINT to 70°F, estimated relief in 22 min.\n2. **Irrigate Green Roof** — soil moisture at 28% CRITICAL. A 6-hour pulse would restore 2.4 kW of evaporative cooling.\n3. **Adjust West Executive** — slight overcooling (-0.5°F), reducing energy waste.\n\nCombined carbon saving: ~2.8 kgCO₂e. Shall I generate BMS commands for all three?`,
  `I'm monitoring all systems. Current highlights:\n\n• Grid carbon intensity is **420 gCO₂/kWh** — moderate. Good time to shift HVAC loads if possible.\n• 2 of 4 NBS assets are performing optimally. Green Roof needs attention (28% moisture).\n• Passive technologies: 5/6 active, all performing within expected parameters.\n\nIs there a specific system or zone you'd like me to focus on?`,
]

const OCCUPANT_DEFAULT = [
  `Hi! I'm your personal comfort assistant for Meridian Tower.\n\nRight now, your zone is showing:\n• Temperature: **74.2°F** (target: 72°F — slightly warm)\n• Humidity: **44%** — comfortable\n• Air quality: **Good** (CO₂ at 820 ppm)\n\nThe AI is already making small adjustments to bring the temperature down. You should feel it improve in the next 10–15 minutes.\n\nIs there anything specific bothering you — too hot, too cold, stuffy air?`,
  `I'm here to help with your comfort! You can tell me things like:\n• "It's too warm at my desk"\n• "The air feels stuffy"\n• "How's the air quality today?"\n\nI'll log your feedback, notify the facility team if needed, and let you know what the system is doing to help.`,
]

function matchResponse(text: string, map: Record<string, string[]>): string | null {
  const lower = text.toLowerCase()
  for (const [key, responses] of Object.entries(map)) {
    if (lower.includes(key)) {
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }
  return null
}

export function getMockResponse(message: string, mode: 'MANAGER' | 'OCCUPANT'): string {
  if (mode === 'MANAGER') {
    return (
      matchResponse(message, MANAGER_RESPONSES) ??
      MANAGER_DEFAULT[Math.floor(Math.random() * MANAGER_DEFAULT.length)]
    )
  } else {
    return (
      matchResponse(message, OCCUPANT_RESPONSES) ??
      OCCUPANT_DEFAULT[Math.floor(Math.random() * OCCUPANT_DEFAULT.length)]
    )
  }
}

// Stream mock response word-by-word with realistic delay
export async function streamMockResponse(
  message: string,
  mode: 'MANAGER' | 'OCCUPANT',
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = getMockResponse(message, mode)

  // Stream word by word with slight variation
  const chunks = response.split(/(?<=\s)/)

  for (const chunk of chunks) {
    if (signal?.aborted) return
    onChunk(chunk)
    // Variable delay: 15–55ms per chunk
    await new Promise(r => setTimeout(r, 15 + Math.random() * 40))
  }
}
