# Enestu — marketing web

Statický web + Cloudflare Pages Functions (formuláře, Stripe, mapa krajů).

Homepage vizuálně sedí na `design/homepage.png` (sekcie ako rezy z predlohy + live hero/nav/stats/formulár).

## Prototyp online

**Live:** https://cmelko.github.io/enestu/  
**Repo:** https://github.com/Cmelko/enestu  

Lokálne: `npm run dev` → http://127.0.0.1:8788

## Lokální vývoj

```bash
npm install
copy .env.example .dev.vars   # Windows: copy
npm run db:migrate:local
npm run dev
```

Otevři http://127.0.0.1:8788

Bez `RESEND_API_KEY` / `STRIPE_SECRET_KEY` API funguje v demo režimu (lead se uloží do D1, e-maily se logují, Checkout přesměruje na `/dekujeme.html?demo=1`).

## API

| Endpoint | Účel |
|----------|------|
| `POST /api/contact` | Kontaktní formulář |
| `POST /api/waitlist` | CTA „Založit domov“ |
| `POST /api/partner` | Partnerská žádost |
| `POST /api/checkout` | Stripe Checkout Session |
| `POST /api/portal` | Stripe Customer Portal |
| `POST /api/stripe-webhook` | Stripe webhooks |

## Produkce

1. `wrangler d1 create enestu-leads` → dosaď `database_id` do `wrangler.toml`
2. `wrangler kv namespace create RATE_LIMIT` → dosaď KV `id`
3. Secrets: `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
4. Vars: price IDs (`STRIPE_PRICE_*`), `PUBLIC_SITE_URL`, `FROM_EMAIL`, `ALLOWED_ORIGIN`
5. Stripe webhook URL: `https://<domain>/api/stripe-webhook`
6. `npm run db:migrate` + `npm run deploy`

## Materiály od klienta

Viz plán / `assets/IMAGES.md` — firma (IČO, adresa), DNS, Stripe účet, Resend doména, Figma exporty.
