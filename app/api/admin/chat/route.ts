import { NextRequest } from 'next/server'
import { streamAdminChat } from '@/lib/gemini'
import { streamMockResponse } from '@/lib/mock-ai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { messages, mode } = await req.json()

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'messages array required' }), { status: 400 })
  }

  const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'USER')?.content ?? ''
  const aiMode: 'MANAGER' | 'OCCUPANT' = mode === 'OCCUPANT' ? 'OCCUPANT' : 'MANAGER'
  const hasApiKey = !!process.env.GEMINI_API_KEY

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (hasApiKey) {
          await streamAdminChat(
            messages,
            (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
            },
            req.signal
          )
        } else {
          // Use mock presets — no API key needed
          await streamMockResponse(
            lastUserMsg,
            aiMode,
            (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
            },
            req.signal
          )
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
