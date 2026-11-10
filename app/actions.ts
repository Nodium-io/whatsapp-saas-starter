'use server'

import { revalidatePath } from 'next/cache'
import { nodium, returnUrl } from '@/lib/nodium'

export interface LinkState {
  url?: string
  error?: string
}

/** Add one of your customers as a client, with a hosted connect link to send them. */
export async function addClient(_: LinkState, form: FormData): Promise<LinkState> {
  const name = String(form.get('name') ?? '').trim()
  const externalId = String(form.get('externalId') ?? '').trim()
  if (!name) return { error: 'A name is required.' }
  try {
    const client = await nodium().tenants.create(
      { name, ...(externalId ? { externalId } : {}) },
      { connectLink: { redirectUrl: returnUrl('/') } }
    )
    revalidatePath('/')
    // The link is shown once: send it to your customer now.
    return { url: client.connectLink.url }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The client could not be created.' }
  }
}

/** A new connect link for a client whose number is not connected yet. */
export async function newLink(_: LinkState, form: FormData): Promise<LinkState> {
  const id = String(form.get('tenantId') ?? '')
  try {
    const link = await nodium().tenants.connectLink(id, { redirectUrl: returnUrl(`/clients/${id}`) })
    revalidatePath(`/clients/${id}`)
    return { url: link.url }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The link could not be created.' }
  }
}

export interface ReplyState {
  error?: string
  sent?: boolean
}

/**
 * Answer a conversation. Inside the 24-hour window: free text. Outside it,
 * WhatsApp only accepts an approved template, named here.
 */
export async function reply(_: ReplyState, form: FormData): Promise<ReplyState> {
  const tenantId = String(form.get('tenantId') ?? '')
  const conversationId = String(form.get('conversationId') ?? '')
  const scope = nodium().as(tenantId)
  try {
    const conversation = await scope.conversations.get(conversationId)
    const to = conversation.contact.identityKind === 'phone'
      ? { to: conversation.contact.identity }
      : { recipient: conversation.contact.identity }
    const base = { channelId: conversation.channelId, ...to, idempotencyKey: crypto.randomUUID() }

    const result = conversation.window.open
      ? await scope.messages.send({ ...base, type: 'text', text: String(form.get('text') ?? '') })
      : await scope.messages.send({
          ...base,
          type: 'template',
          templateName: String(form.get('templateName') ?? ''),
          templateLanguage: String(form.get('templateLanguage') ?? 'en')
        })

    // A send refused by WhatsApp is still HTTP 200: test the status.
    if (result.message?.status === 'failed') return { error: result.message.errorInfo?.title ?? result.message.error ?? 'WhatsApp refused the message.' }
    revalidatePath(`/clients/${tenantId}`)
    return { sent: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'The message could not be sent.' }
  }
}
