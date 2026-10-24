# Petrol Pal — petrolpal.in

Map of petrol pumps across India with community fuel test results from Petrol Pal testers.

**Stack:** Next.js 14 (App Router, JavaScript) · Tailwind CSS · Supabase (database + sign-in) · MapLibre GL with OpenFreeMap tiles · hosted on Vercel.

## Pages

| URL | What it is |
|---|---|
| `/` | Map of all pumps — search, “near me”, filter by state and brand |
| `/pump/[id]` | Pump page — details, test result, reviews, directions, report |
| `/test` | Upload a test: scan QR → confirm pump → done (no account needed) |
| `/top` | Top pumps (empty state until the map is switched to test results) |
| `/get` | Petrol Pal Go vs Pro + waitlist |
| `/how` | How it works, what results mean, FAQ |
| `/signin`, `/account` | Google or email-link sign-in; my tests, reviews, testers |
| `/pump/[id]/review` | Write a review (signed in; checked by admin before it shows) |
| `/report` | Report wrong info, pump-owner response, missing pump, private fuel concern |
| `/admin` | Admin only — map switch, review queue, reports, new pumps, waitlist (CSV), private test data |
| `/terms`, `/privacy`, `/grievance` | **Drafts** — fill in the `[BRACKETED]` items and have a lawyer review |

## Brand colours ↔ test results switch

Admin → **“What should map pins show?”** flips `site_settings.map_color_mode` between `brand` and `quality`. The map, pump pages and Top pumps all follow it immediately — no deploy needed.

Result rules live in `site_settings` (defaults: ≥ 5 GPS-verified tests from ≥ 3 different testers in the last 180 days; “consistent” = median within ±3 points of 20 % and ≥ 80 % of tests within range). Edit them in Supabase → Table editor → `site_settings`.

## Legal-risk design (deliberate — please keep)

- Public statuses are only **Consistent with E20**, **Readings vary — no rating yet**, **Not enough tests**. No “adulterated”, no worst-pumps list, no brand comparisons.
- Raw readings and scores are **not** readable through the public API. The site only calls safe functions (`pumps_map`, `pump_detail`, `top_pumps`, `site_stats`).
- Numbers for pumps that don’t match E20 are visible only to admins (`admin_pump_quality`) for private escalation.
- Reviews are pre-moderated and must not make fuel claims or name staff.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

## Deploy (Vercel + petrolpal.in)

1. vercel.com → **Add New → Project** → import `Devansh1234/PetrolPal`. Framework: Next.js (auto).
2. **Environment variables** (Production + Preview): copy the three from `.env.example`.
3. Deploy. Then **Settings → Domains** → add `petrolpal.in` and `www.petrolpal.in`; at your domain registrar set the DNS records Vercel shows (an `A` record for the apex and a `CNAME` for `www`).
4. **Supabase → Authentication → URL Configuration**
   - Site URL: `https://petrolpal.in`
   - Redirect URLs: `https://petrolpal.in/auth/callback`, `https://*.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
5. **Google sign-in:** Supabase → Authentication → Providers → Google → enable, and paste a Google Cloud OAuth client ID/secret (authorised redirect URI: `https://vrauqwdhkswgiylfrkrd.supabase.co/auth/v1/callback`). Email-link sign-in works without this.
6. **Email links:** Supabase’s built-in email sender is rate-limited; before launch, set up custom SMTP (Authentication → Emails → SMTP settings).
7. Sign in once at `/signin` with `devanshbarman6@gmail.com` — that account becomes admin automatically. Then open `/admin`.

## Database

The Supabase project is **BlendCheck** (`vrauqwdhkswgiylfrkrd`). Migrations added for the website are in `supabase/migrations/`. Pump data came from OpenStreetMap (© OpenStreetMap contributors, ODbL) — keep the attribution in the footer.

Tester QR format and how to register testers: [`docs/QR_FORMAT.md`](docs/QR_FORMAT.md).
