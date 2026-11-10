// The Nodium client, for server code only: the API key never reaches the browser.
import { Nodium } from '@nodium.io/whatsapp'

let client: Nodium | null = null

export function nodium(): Nodium {
  const key = process.env.NODIUM_KEY
  if (!key) throw new Error('NODIUM_KEY is missing: copy .env.example to .env.local and add your API key.')
  client ??= new Nodium(key)
  return client
}

/** The return address for a connect link: https only, so none in local development. */
export function returnUrl(path: string): string | undefined {
  const base = process.env.APP_URL?.replace(/\/+$/, '')
  return base?.startsWith('https://') ? `${base}${path}` : undefined
}
