# Developer storefront & platform roadmap

MCMerchant is oriented around **developers marketing themselves**: a public storefront per seller, shared licensing, and MCMerchantLoader for updates. This document describes the **Supabase fields** that power storefronts and the plan for **custom domains** and **build-time tooling** (e.g. obfuscation).

## 1. Database: optional `profiles` columns

Run in the Supabase SQL editor when you are ready for branded storefronts and vanity URLs.

```sql
-- Public branding (all nullable)
alter table public.profiles
  add column if not exists store_title text,
  add column if not exists store_tagline text,
  add column if not exists store_bio text,
  add column if not exists store_website_url text;

-- Vanity URL: /store/{store_slug} when set; otherwise /store/{username}
alter table public.profiles
  add column if not exists store_slug text;

-- Optional: one vanity slug per seller
create unique index if not exists profiles_store_slug_unique
  on public.profiles (store_slug)
  where store_slug is not null and length(trim(store_slug)) > 0;

-- Custom domain (manual verification for now)
alter table public.profiles
  add column if not exists custom_domain text,
  add column if not exists custom_domain_status text;

-- Suggested status values: 'pending' | 'verified' | 'disabled'
comment on column public.profiles.custom_domain_status is
  'pending until DNS/TLS verified; app does not automate verification yet.';

-- Visual theme + hero banner (HTTPS URL to any host; rendered as a plain img in Next.js)
alter table public.profiles
  add column if not exists store_theme text,
  add column if not exists store_banner_url text,
  add column if not exists store_icon_url text;

-- store_icon_url is your storefront avatar (PFP); rendered as a circle in the hero.

-- Social / presence (HTTPS URLs)
alter table public.profiles
  add column if not exists store_github_url text,
  add column if not exists store_discord_url text,
  add column if not exists store_twitter_url text;

-- store_theme: optional accent preset — 'brand' | 'violet' | 'cyan' | 'amber' | 'rose'
comment on column public.profiles.store_theme is 'Public storefront accent; see MCMerchant storefront-theme presets.';
```

If your project already has conflicting constraints, adjust index names or uniqueness rules.

### RLS

Storefront fields are written only through your **Next.js API** (service role) or trusted server actions. If sellers update `profiles` from the browser, ensure RLS allows updates only for `id = auth.uid()` on these columns.

---

## 2. URLs

| URL | Purpose |
|-----|---------|
| `/store/{username}` | Default public storefront when `store_slug` is empty |
| `/store/{store_slug}` | When `store_slug` is set and unique |
| `/dashboard/storefront` | Seller settings |

Set `NEXT_PUBLIC_APP_URL` (and optionally `NEXT_PUBLIC_SITE_URL`) so “share this storefront” shows an absolute URL.

---

## 3. Custom domains (roadmap)

**Current state:** sellers can **record** a desired hostname (`custom_domain`) and a status flag. The app does **not** yet:

- Create DNS records
- Issue TLS certificates
- Route hostnames in Next.js / edge middleware to a seller

**Intended architecture (high level):**

1. Seller enters `plugins.example.com` in **Dashboard → Storefront**.
2. Hosted on Vercel (or similar): project adds the domain to the deployment; seller adds `CNAME`/`ALIAS` as instructed.
3. Middleware resolves `Host` → `profiles.custom_domain` → render the same UI as `/store/[handle]` (or 307 redirect to canonical path).
4. Set `custom_domain_status = 'verified'` after automated checks (or manually for MVP).

Until that works end-to-end, treat custom domains as **documentation + data capture** only.

---

## 4. Licensing, updates, and future obfuscation

| Capability | Status |
|------------|--------|
| License keys + verification API | Implemented |
| Signed / authenticated downloads | Implemented |
| MCMerchantLoader auto-update | Implemented |
| **Bytecode obfuscation** | Not built; consider integrations (e.g. external CI tasks or partner tools) |

**Obfuscation note:** MCMerchant should not replace your build pipeline. A realistic roadmap is: **webhooks or CLI upload from CI**, optional “artifacts” table, and links to third-party obfuscators—never promise illegal reverse-engineering protection.

---

## 5. Product positioning

- **Buyers** use the marketplace and loader.
- **Sellers** get a **brand surface** (storefront), payouts, version management, and a single place to point customers.

For operator playbooks, see the main [Supabase setup](./SUPABASE_SETUP.md) and in-app `/docs#developer-platform`.
