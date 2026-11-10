'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { addClient, newLink, reply, type LinkState, type ReplyState } from './actions'

/** The link to send to a customer: shown once, with a copy button. */
function LinkResult({ state }: { state: LinkState }) {
  if (state.error) return <p className="error">{state.error}</p>
  if (!state.url) return null
  return (
    <div className="link">
      <p>Send this link to your customer. It is shown only once.</p>
      <code>{state.url}</code>
      <button type="button" onClick={() => navigator.clipboard.writeText(state.url!)}>Copy</button>
    </div>
  )
}

export function AddClientForm() {
  const [state, action, pending] = useActionState(addClient, {})
  return (
    <form action={action} className="card">
      <h2>Add a client</h2>
      <label>Name <input name="name" required placeholder="Optique Martin" /></label>
      <label>Your id for it (optional) <input name="externalId" placeholder="cust_1042" /></label>
      <button disabled={pending}>{pending ? 'Creating…' : 'Create and get a connect link'}</button>
      <LinkResult state={state} />
    </form>
  )
}

export function NewLinkForm({ tenantId }: { tenantId: string }) {
  const [state, action, pending] = useActionState(newLink, {})
  return (
    <form action={action}>
      <input type="hidden" name="tenantId" value={tenantId} />
      <button disabled={pending}>{pending ? 'Creating…' : 'New connect link'}</button>
      <LinkResult state={state} />
    </form>
  )
}

export function ReplyForm({ tenantId, conversationId, windowOpen }: { tenantId: string, conversationId: string, windowOpen: boolean }) {
  const [state, action, pending] = useActionState<ReplyState, FormData>(reply, {})
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => { if (state.sent) form.current?.reset() }, [state])
  return (
    <form action={action} ref={form} className="reply">
      <input type="hidden" name="tenantId" value={tenantId} />
      <input type="hidden" name="conversationId" value={conversationId} />
      {windowOpen
        ? <textarea name="text" required rows={3} placeholder="Your reply" />
        : (
            <>
              <p className="muted">The 24-hour window is closed: WhatsApp only accepts an approved template.</p>
              <label>Template name <input name="templateName" required placeholder="order_ready" /></label>
              <label>Language <input name="templateLanguage" defaultValue="en" /></label>
            </>
          )}
      <button disabled={pending}>{pending ? 'Sending…' : 'Send'}</button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  )
}

/** Reloads the page every few seconds, so a message received by webhook shows up. */
export function AutoRefresh({ seconds = 10 }: { seconds?: number }) {
  const router = useRouter()
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), seconds * 1000)
    return () => clearInterval(timer)
  }, [router, seconds])
  return null
}
