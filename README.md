# Novora

AI-powered content SaaS — social media posts, product descriptions, and resume builder.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4 + Shadcn UI
- **Supabase** — Auth, PostgreSQL, Edge Functions
- **Groq** — AI via Supabase Edge Function (`generate`)
- **BTCPay Server** — Bitcoin payments (webhook auto-activation, 30-day manual renewal)
- **Vercel** — Recommended hosting

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Fill in Supabase keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in **SQL Editor** (in order):
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_fix_auth_trigger.sql`
   - `supabase/migrations/003_usage_quota_fix.sql`
3. Optional: run `supabase/seed.sql` for blog posts
4. Enable **Google** auth provider (paste OAuth Client ID + Secret from Google Cloud Console)
5. Add redirect URL: `http://localhost:3000/auth/callback`
6. Set Edge Function secret:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase secrets set GROQ_API_KEY=gsk_your_key
   npx supabase functions deploy generate
   ```

## Environment variables

See `.env.local.example` for the full list.

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only, never expose |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` in dev |
| `GROQ_API_KEY` | Yes | Set in **Supabase secrets**, not `.env.local` |
| `PAYMENT_PROVIDER` | Prod | Use `btcpay` in production |
| `BTCPAY_URL` | Prod | Your BTCPay Server base URL |
| `BTCPAY_API_KEY` | Prod | Greenfield API key |
| `BTCPAY_STORE_ID` | Prod | Store ID from BTCPay |
| `BTCPAY_WEBHOOK_SECRET` | Prod | Webhook signing secret |
| `UPSTASH_REDIS_*` | Prod | Rate limiting |
| `RESEND_API_KEY` | Optional | Contact form emails |

### Local dev without Groq

Set `ALLOW_MOCK_AI=true` in `.env.local` to use mock AI responses (development only).

### Local dev payments

`PAYMENT_PROVIDER=manual` simulates upgrades in development. This is **disabled in production**.

### Languages (i18n)

Supported UI languages: **English**, **Arabic** (RTL), **French**, **Russian**, **German**.

Use the globe icon in the header to switch language. The choice is saved in a cookie.

AI generation outputs in the **same language as your input** (e.g. Arabic inputs → Arabic captions/resume). PDF resume section titles follow the detected input language.

### Ad rewards (free plan)

When free users hit the 3 daily generations, they can watch a short Google ad for +1 extra generation (up to 3 ad rewards per day). Apply migration `004_ad_reward_bonus.sql` and set:

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx
NEXT_PUBLIC_ADSENSE_REWARDED_SLOT=your-video-ad-unit-id
```

### BTCPay Server setup (production)

1. Deploy or use a **BTCPay Server** instance (self-hosted VPS recommended).
2. Create a **Store** and connect a Bitcoin wallet.
3. Generate a **Greenfield API key** with invoice creation permissions.
4. Register webhook: `https://your-domain.com/api/webhooks/btcpay`
   - Events: `InvoiceSettled`, `InvoicePaymentSettled`, `InvoiceExpired`
5. In `.env.local` / Vercel:
   ```env
   PAYMENT_PROVIDER=btcpay
   NEXT_PUBLIC_PAYMENT_PROVIDER=btcpay
   BTCPAY_URL=https://your-btcpay-server.com
   BTCPAY_API_KEY=your-api-key
   BTCPAY_STORE_ID=your-store-id
   BTCPAY_WEBHOOK_SECRET=your-webhook-secret
   ```
6. Test a **$15 Pro** upgrade: user → BTCPay checkout → pays Bitcoin → webhook activates Pro for 30 days.

**Billing model:** One-time invoices, not auto-recurring. Users renew manually from Pricing or Settings.

## Deploy to Vercel

1. Push repo to GitHub
2. Import project in Vercel
3. Add all env vars from `.env.local.example`
4. Set `PAYMENT_PROVIDER=btcpay` and BTCPay vars for production
5. Configure BTCPay webhook: `https://your-domain.com/api/webhooks/btcpay`
6. Add production redirect URL in Supabase Auth: `https://your-domain.com/auth/callback`

## Project structure

```
src/
  app/           # Routes (marketing, auth, dashboard, tools)
  actions/       # Server actions
  components/    # UI components
  lib/           # Business logic, AI, payments, auth
  types/         # Shared TypeScript types
supabase/
  migrations/    # Database schema
  functions/     # Edge functions (generate)
```
