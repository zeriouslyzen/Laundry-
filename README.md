# North Coast Laundry

Owner-operated laundry pickup, wash, fold, and delivery — launch cities: **Arcata, Eureka, Loleta, Fields Landing**.

## Stack

- **Next.js 15** (App Router) — marketing, booking, ops, and admin
- **Supabase** — Postgres, auth, RLS (optional at dev — preview mode works without it)
- **Tailwind CSS 4** — North Coast blue coastal design system
- **Twilio** — SMS notifications (optional at dev)
- **Stripe** — payments (Phase 1.5, optional at dev)
- **Mapbox** — geocoding and static maps (optional at dev)

## Project structure

```
apps/web/           Next.js application
packages/ui/        Shared UI components
packages/db/        Pricing logic, types, launch city config
supabase/migrations SQL schema, RLS, seed data
docs/               Pricing matrix, TOS (drafts)
```

## Getting started

### 1. Install dependencies

```bash
cd "/Users/deshonjackson/Laundry "
npm install
```

### 2. Environment (preview mode — no Supabase required)

```bash
cp apps/web/.env.example apps/web/.env.local
```

Defaults work for local preview:
- `OWNER_OPERATED=true` — skips driver matching; orders go straight to your team
- Without real Supabase keys, bookings save to **localStorage** and appear on `/ops`

### 3. Set up Supabase (when ready for production)

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations: `supabase/migrations/001_initial_schema.sql` and `002_launch_pricing.sql`
3. Enable phone auth in Supabase Dashboard → Authentication → Providers
4. Copy `.env.example` to `apps/web/.env.local` and fill in keys

### 4. Create first admin

After signing up, run in Supabase SQL editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing |
| `/book/new` | Public booking form (no login in preview mode) |
| `/book/orders/local/[id]` | Preview order tracking (localStorage) |
| `/ops` | Owner team dashboard — daily pickups, status updates |
| `/auth/login` | Email or phone login |
| `/book` | Customer dashboard |
| `/book/orders/[id]` | Order tracking (requires Supabase) |
| `/admin` | Admin panel (requires Supabase + admin role) |
| `/driver/*` | Driver flows (future expansion) |

## Launch pricing

See `docs/pricing-matrix.md`. Full service from **$26/load** in Arcata & Eureka. Recurring weekly: **10% off**.

## Matching cron

Only used when `OWNER_OPERATED=false` and Supabase is configured:

```
GET /api/cron/match
Authorization: Bearer $CRON_SECRET
```

## PWA

`public/manifest.json` is included. Add `icon-192.png` and `icon-512.png` for install prompts.

## Legal docs

Draft documents in `/docs` require review by a California attorney before production launch.

## Deploy on Vercel

1. Push this repo to GitHub: [zeriouslyzen/Laundry-](https://github.com/zeriouslyzen/Laundry-.git)
2. Import the project in [Vercel](https://vercel.com/new)
3. Set **Root Directory** to `apps/web` (Vercel will use `vercel.json` install/build from monorepo root)
4. Add environment variables from `apps/web/.env.example` (at minimum `NEXT_PUBLIC_SITE_URL` with your Vercel URL)
5. Deploy — preview mode works without Supabase; add Supabase keys when ready for live bookings

**Note:** Hero videos in `apps/web/public/videos/` are compressed 720p H.264 (~7MB total) for fast mobile loads.

## License

Private — North Coast Laundry
