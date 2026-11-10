import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WhatsApp SaaS starter — Nodium',
  description: 'Connect your customers\' WhatsApp numbers with Nodium.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header><a href="/">WhatsApp SaaS starter</a> <span className="muted">powered by Nodium</span></header>
        <main>{children}</main>
      </body>
    </html>
  )
}
