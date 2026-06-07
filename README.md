# Novora

AI-powered content SaaS — social media posts, product descriptions, and resume builder.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4 + Shadcn UI
- **Supabase** — Auth, PostgreSQL, Edge Functions
- **Groq** — AI via Supabase Edge Function (`generate`)
- **NexaPay** — Payments (card/Apple Pay → USDT TRC20; manual renewal every 30 days)
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
| `PAYMENT_PROVIDER` | Prod | Use `nexapay` in production |
| `NEXAPAY_API_URL` | Prod | Wallet POST endpoint from NexaPay support |
| `NEXAPAY_WALLET_ADDRESS` | Prod | Your Binance USDT TRC20 wallet address |
| `NEXAPAY_NETWORK` | Prod | `TRC20` (default) |
| `NEXAPAY_WEBHOOK_SECRET` | Optional | Webhook signature verification |
| `LEMONSQUEEZY_*` | Legacy | Optional fallback provider |
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

### NexaPay setup (production)

NexaPay is a good fit for regions with limited banking access (e.g. Syria): customers pay by card, you receive USDT on a Binance TRC20 wallet.

1. Get your **NexaPay API URL** from NexaPay support (not the placeholder `pythonanywhere.com` example).
2. Set up a **Binance USDT TRC20** wallet and copy the address into `NEXAPAY_WALLET_ADDRESS`.
3. In `.env.local` / Vercel env:
   ```env
   PAYMENT_PROVIDER=nexapay
   NEXT_PUBLIC_PAYMENT_PROVIDER=nexapay
   NEXAPAY_API_URL=https://your-real-nexapay-endpoint
   NEXAPAY_WALLET_ADDRESS=your-trc20-address
   NEXAPAY_NETWORK=TRC20
   ```
4. Register the webhook with NexaPay:
   `https://your-domain.com/api/webhooks/payments/nexapay`
5. Test a **$15 Pro** upgrade: user is redirected to NexaPay → pays → webhook activates Pro for 30 days.

**Billing model:** NexaPay handles one-time payments, not auto-recurring billing. Users renew manually from Pricing or Settings when their plan expires.

## Deploy to Vercel

1. Push repo to GitHub
2. Import project in Vercel
3. Add all env vars from `.env.local.example`
4. Set `PAYMENT_PROVIDER=nexapay` and NexaPay vars for production
5. Configure NexaPay webhook: `https://your-domain.com/api/webhooks/payments/nexapay`
6. Add production redirect URL in Supabase Auth: `https://your-domain.com/auth/callback`

## Project structure

```
src/
  app/           # Routes (marketing, auth, dashboard, tools)
  actions/       # Server actions
  components/    # UI components
  lib/           # AI, auth, payments, quota, SEO
supabase/
  migrations/    # Database schema
  functions/     # Edge Functions (generate)
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## License

Private — All rights reserved.
