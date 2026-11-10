// Receives Nodium's webhooks: one subscription on your own company receives the
// events of every client of your account. The signature is checked on the raw body.
import { NodiumSignatureError, verifyWebhook } from '@nodium.io/whatsapp/server'

export async function POST(request: Request) {
  const rawBody = await request.text()
  try {
    const event = verifyWebhook(rawBody, request.headers, process.env.NODIUM_WEBHOOK_SECRET!)

    // `workspace_id` is the Nodium client the event comes from; `external_id` is your own id for it.
    switch (event.event) {
      case 'message.received':
        // Your product decides what happens: store it, notify someone, answer through the API.
        console.log(`[${event.external_id ?? event.workspace_id}] message from ${String(event.data.from)}`)
        break
      case 'channel.connected':
        console.log(`[${event.external_id ?? event.workspace_id}] WhatsApp number connected`)
        break
    }
    // Answer fast; an event that is not acknowledged is delivered again, with the same `event.id`.
    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof NodiumSignatureError) return new Response(null, { status: 400 })
    throw error
  }
}
