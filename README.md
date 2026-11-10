# WhatsApp SaaS starter

A minimal Next.js app that shows how a SaaS connects **its customers' own WhatsApp numbers** with [Nodium](https://nodium.io), the WhatsApp API gateway for developers.

Clone it, add your API key, and in an hour you see the whole loop: add a customer, send them a connect link, read their conversations, reply.

| Screen | What it shows |
|---|---|
| **Your clients** (`app/page.tsx`) | Each customer is a client of your Nodium account, with the state of its WhatsApp. "Add a client" creates one and gives you its hosted connect link. |
| **One client** (`app/clients/[id]/page.tsx`) | Its numbers, its conversations and their messages, and a reply. Inside the 24-hour window you write free text; outside it, WhatsApp only accepts an approved template. |
| **The webhook** (`app/api/webhooks/nodium/route.ts`) | One subscription receives the events of every client, signature checked on the raw body. |

What it demonstrates:

- **One API key for all your customers**: `nodium.as(clientId)` acts for one of them, and another client's data answers 404.
- **The hosted connect link**: your customer connects their own number through Meta's Embedded Signup, without a Nodium account and without a Meta app of yours.
- **The 24-hour window**: every conversation carries `window.open`; the reply form switches to a template when it is closed.
- **Signed webhooks**: `verifyWebhook` from `@nodium.io/whatsapp/server`.

## Run it

```bash
git clone https://github.com/Nodium-io/whatsapp-saas-starter
cd whatsapp-saas-starter
npm install
cp .env.example .env.local   # add your NODIUM_KEY
npm run dev                   # http://localhost:3000
```

No account yet? [Create one for free](https://nodium.io): 3,000 messages a month and one number, no card. The free plan limits how many clients you can add: see [pricing](https://nodium.io/en/pricing).

### Receive webhooks locally

Create a webhook subscription that points to your deployed app, or replay your real events to your machine:

```bash
npx @nodium.io/cli listen --forward http://localhost:3000/api/webhooks/nodium --secret "$NODIUM_WEBHOOK_SECRET"
```

The pages also refresh every few seconds, so a new message shows up without a webhook.

## Before you ship it

This is a starter, not a product. On purpose, it has:

- **No sign-in.** Anyone who reaches the app sees every client. Put your own authentication in front of it.
- **No database.** Everything is read from the Nodium API. Store what your product needs (who each client is in your system, messages you want to search) in your own database, from the webhook.
- **No styling to speak of.** One small stylesheet, easy to throw away.

`APP_URL` must be your public `https://` address in production: it is where your customers land after connecting their number.

## Learn more

- [How to add WhatsApp to your SaaS](https://nodium.io/en/guides/add-whatsapp-to-your-saas)
- [Your clients, in the API guide](https://nodium.io/en/docs/api/guide/partners)
- [The connect link](https://nodium.io/en/features/embedded-signup) · [Multi-tenant WhatsApp API](https://nodium.io/en/features/multi-tenant)
- SDK and more examples: [Nodium-io/sdk](https://github.com/Nodium-io/sdk)

MIT © By-Tech.io
