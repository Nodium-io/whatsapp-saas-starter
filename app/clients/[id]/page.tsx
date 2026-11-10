import Link from 'next/link'
import { nodium } from '@/lib/nodium'
import { AutoRefresh, NewLinkForm, ReplyForm } from '../../forms'

export const dynamic = 'force-dynamic'

/**
 * One client: its numbers, its conversations, the messages of one of them, and
 * a reply. Every call acts for this client only (`nodium.as(id)`): another
 * client's data answers 404.
 */
export default async function ClientPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ c?: string }>
}) {
  const { id } = await params
  const { c } = await searchParams
  const scope = nodium().as(id)

  const [client, channels, conversations] = await Promise.all([
    nodium().tenants.get(id),
    scope.channels.list(),
    scope.conversations.list({ limit: 30 })
  ])
  const current = conversations.items.find(item => item.id === c) ?? conversations.items[0] ?? null
  const messages = current ? (await scope.messages.list(current.id, { limit: 50 })).items : []

  return (
    <>
      <AutoRefresh />
      <p><Link href="/">← All clients</Link></p>
      <section className="card">
        <h1>{client.name}</h1>
        {channels.length === 0
          ? (
              <>
                <p className="muted">No WhatsApp number connected yet. Send this client a connect link: they connect their own number through Meta, in a few minutes.</p>
                <NewLinkForm tenantId={id} />
              </>
            )
          : <p>Numbers: {channels.map(channel => `${channel.identity} (${channel.name})`).join(' · ')}</p>}
      </section>

      {current && (
        <section className="card split">
          <ul className="threads">
            {conversations.items.map(item => (
              <li key={item.id}>
                <Link href={`/clients/${id}?c=${item.id}`} className={item.id === current.id ? 'on' : ''}>
                  {item.contact.displayName ?? item.contact.identity}
                  <br /><span className="muted">{item.window.open ? `Window open, ${item.window.minutesLeft} min left` : 'Window closed'}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="reply">
            <ul className="messages">
              {messages.map(message => (
                <li key={message.id} className={message.direction}>
                  {message.textContent ?? `[${message.type}]`}
                  <br /><span className="muted">{new Date(message.createdAt).toLocaleString()} · {message.status}</span>
                </li>
              ))}
            </ul>
            <ReplyForm tenantId={id} conversationId={current.id} windowOpen={current.window.open} />
          </div>
        </section>
      )}
    </>
  )
}
