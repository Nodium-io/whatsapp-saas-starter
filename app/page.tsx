import Link from 'next/link'
import { nodium } from '@/lib/nodium'
import { AddClientForm, AutoRefresh } from './forms'

export const dynamic = 'force-dynamic'

const LABELS = { connected: 'Connected', link_sent: 'Link sent', not_connected: 'Not connected' } as const

/** Your customers, each a client of your Nodium account, and the state of their WhatsApp. */
export default async function ClientsPage() {
  const { items } = await nodium().tenants.list({ limit: 50 })

  return (
    <>
      <AutoRefresh seconds={15} />
      <section className="card">
        <h1>Your clients</h1>
        {items.length === 0
          ? <p className="muted">No client yet. Add your first one below, then send them the connect link.</p>
          : (
              <table>
                <thead><tr><th>Client</th><th>Your id</th><th>WhatsApp</th><th>Number</th></tr></thead>
                <tbody>
                  {items.map(client => (
                    <tr key={client.id}>
                      <td><Link href={`/clients/${client.id}`}>{client.name}</Link></td>
                      <td className="muted">{client.externalId ?? '—'}</td>
                      <td><span className={`badge ${client.whatsapp.status}`}>{LABELS[client.whatsapp.status]}</span></td>
                      <td>{client.whatsapp.displayPhone ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
      </section>
      <AddClientForm />
    </>
  )
}
