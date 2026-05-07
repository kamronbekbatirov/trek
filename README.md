# Trek — The Uzbek Tax Calendar

> **Never miss a tax deadline in Uzbekistan again.**

Trek is a personal tax calendar for Uzbek accountants and businesses. Tell it what kind of company you are — LLC, sole proprietor, farm, accountant managing many clients — and Trek figures out *exactly* which declarations and payments you owe, lays them out across the year, and nudges you on Telegram before each one. Behind the scenes it's running on a structured, machine-readable copy of the Uzbek Tax Code, with Claude available as an inline assistant to answer "why do I owe this?" and cite the article number.

[![Live](https://img.shields.io/badge/live-trek.uz-000?style=flat-square)](https://trek.uz)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Claude](https://img.shields.io/badge/Powered%20by-Claude-D97757?style=flat-square&logo=anthropic&logoColor=white)](https://www.anthropic.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

---

## The problem

In Uzbekistan, your tax obligations vary wildly based on what kind of company you run, your tax regime, your headcount, what assets you own, and which special activities you do. The result: dozens of unique deadlines per year, scattered across multiple government portals, all in dense legal Russian. Most small businesses miss filings — and pay penalties — because no one ever shows them a single, personal answer to *what is due, when, by me*.

Trek is that single personal answer.

## What Trek does

### 1. 🧙 AI-guided onboarding
A 9-step wizard with **Трэки**, an inline assistant powered by Claude, who answers your questions at each step and cites the Tax Code article that applies. The wizard collects:

- Org type — `LLC`, `JSC`, `IE` (sole proprietor), `SELF_EMPLOYED`, `FARM`, or `ACCOUNTANT`
- Tax regime — `VAT`, `TURNOVER`, or `BOTH`
- Employees — drives all payroll-tax events
- Owned assets — drives property, land, water taxes
- Special activities — excise, dividends, KIK, etc.
- Reminder days (default `[7, 3, 1]`) and language

### 2. 📅 Generates your personal calendar
Every tax event in Trek's seeded database is tagged with the org types and regimes it applies to. The matcher cross-references your profile and produces *only* the events you actually owe. Each event has its title in **four languages** (Russian, English, Uzbek-Latin, Uzbek-Cyrillic) and a citation back to the Tax Code (e.g. `НК, ст. 355, ч. 2, п. 1`).

### 3. 🔔 Reminds you on time
A daily cron walks every user, finds events whose deadlines match their `reminderDays`, and dispatches Telegram messages. Notifications also persist in the app for in-page rendering.

### 4. 📤 Exports to your tools
- 📆 `.ics` — drop into Apple / Google / Outlook calendars
- 📊 `.xlsx` — for the accountant who lives in Excel

### 5. 💎 Pro tier with Payme
**79 000 UZS / month** unlocks:
- AI Q&A chat over the full Tax Code (grounded answers, no hallucinations)
- Unlimited Telegram reminders
- Accountant multi-org features

Card binding, recurring receipts, and the merchant webhook all integrate with [Payme.uz](https://payme.uz).

### 6. 👨‍💼 Accountant mode
A single user with role `ACCOUNTANT` can manage many client orgs — each with its own type, regime, employees, assets — and switch between calendars from one dashboard.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, standalone) |
| Language | TypeScript 5 |
| UI | React 19, Radix UI, Tailwind CSS 4, sonner |
| Database | PostgreSQL 16 via Prisma 6 |
| Auth | iron-session + bcryptjs · Telegram Login Widget |
| Validation | Zod |
| i18n | next-intl 3 (RU / EN / UZ-Latin / UZ-Cyrillic) |
| AI | Anthropic SDK (Claude) with Tax Code retrieval |
| Payments | Payme.uz JSON-RPC merchant API |

## Run it locally

Prerequisites: Node 20+, Postgres 14+, optional Telegram bot, optional Anthropic key, optional Payme merchant credentials.

```bash
git clone https://github.com/kamronbekbatirov/trek.git
cd trek
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed              # loads ~250 tax events into TaxEvent
npm run dev
```

Dev server at <http://localhost:3000>. Default locale is `/ru`; the rest live at `/en`, `/uz`, `/uzc`.

## Configuration highlights

The full list lives in [`.env.example`](.env.example). The app refuses to start without:

- `DATABASE_URL`
- `SESSION_SECRET` (32+ random chars)
- `CRON_SECRET` (gates `/api/cron/*`)

Optional but recommended: `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`, `ANTHROPIC_API_KEY`. For paid plans: `PAYME_MERCHANT_ID`, `PAYME_SECRET_KEY`, `PAYME_TEST_KEY`.

## The Tax Code dataset

Two reference files at the repo root:

- **`tax_code_clean.txt`** — cleaned full text of the Uzbek Tax Code (Russian)
- **`tax_code_index.jsonl`** — article-level JSON-Lines index (`{number, heading, body, regime?, orgType?, deadlinePattern?}`)

The Pro chat retrieves the most relevant articles for any user question and feeds them to Claude as grounded context — answers are never hallucinated, they're written *with* the Tax Code in front of the model.

When the Tax Code changes: regenerate the index, run `npm run db:seed` again, and events update.

## Production

`npm run build` produces `.next/standalone/server.js`. Reference deployment binds to `127.0.0.1:3100` behind Caddy:

```caddy
trek.uz {
    reverse_proxy 127.0.0.1:3100
}
```

Cron dispatch:

```cron
0 3 * * * curl -sf -H "x-cron-secret: $CRON_SECRET" https://trek.uz/api/cron/notifications
```

---

## For contributors / AI agents

> A short technical orientation for anyone (human or AI) being handed this repo for the first time.

### Mental model
A **multi-tenant calendar** that maps an org's profile (type, regime, employees, assets, activities) onto a curated set of Tax Code events, then nudges them via Telegram before each deadline. The data flow:

```
Onboarding wizard           →  User profile (orgType, taxRegime, …)
                                    │
TaxEvent table              →  event-filter.ts cross-references profile
(seeded from prisma/seed.ts)        │
                                    ▼
                            Personal calendar (per user)
                                    │
                Daily cron → match deadline vs reminderDays → Telegram + DB notif
```

Two AI surfaces ride alongside:
- **Onboarding chat** — *Трэки* answers wizard questions (free).
- **Pro Q&A** — full-Tax-Code search via `tax-code-search.ts`, fed to Claude as grounded context.

### Project tree

```
src/
├── app/
│   ├── [locale]/                   Locale-prefixed user routes
│   │   ├── auth/                   login, register
│   │   ├── onboarding/              9-step wizard with AI helper (Трэки)
│   │   ├── dashboard/               Today + upcoming view
│   │   ├── calendar/                Full 12-month grid
│   │   ├── events/[id]/             Event detail with Tax Code citation
│   │   ├── chat/                    Pro AI Q&A
│   │   ├── billing/                 Payme card binding & invoice list
│   │   ├── settings/                Profile, language, reminder days
│   │   ├── admin/                   Events CRUD, users, stats
│   │   ├── privacy/ · terms/ · contact/
│   │   └── page.tsx                 Landing
│   ├── api/
│   │   ├── auth/                    register · login · logout · me · telegram
│   │   ├── events/                  list · preview · [id] · status (mark-as-done)
│   │   ├── notifications/           in-app read receipts
│   │   ├── subscriptions/           card binding & status (Payme)
│   │   ├── export/                  ics, excel
│   │   ├── chat/                    onboarding (free), pro (AI Q&A)
│   │   ├── cron/                    notifications  ← daily reminder dispatch
│   │   ├── telegram/                webhook (live), poll (long-poll fallback)
│   │   ├── accountant/              orgs (multi-org accountant view)
│   │   ├── admin/                   events (CRUD), users, stats
│   │   ├── payme/                   merchant JSON-RPC (7 methods)
│   │   ├── onboarding/              wizard-state persistence
│   │   └── user/                    profile, account
│   └── globals.css
├── components/
│   ├── auth/                        Login forms, Telegram widget
│   ├── billing/                     Payme card form
│   ├── calendar/                    12-month grid, event cards, demo
│   ├── chat/                        AI assistant widget
│   ├── dashboard/                   Today, upcoming
│   ├── onboarding/                  Each wizard step
│   ├── accountant/                  Org switcher, multi-org table
│   ├── admin/                       Events table, user management
│   ├── landing/                     Hero, calendar-demo
│   ├── layout/                      Header, footer
│   └── ui/                          Radix-based primitives
├── i18n/                            next-intl config
├── lib/
│   ├── db.ts                        Prisma client singleton
│   ├── session.ts                   iron-session config
│   ├── event-filter.ts              ★ Match user profile → relevant TaxEvents
│   ├── tax-code-search.ts           ★ Retrieval over tax_code_index.jsonl
│   ├── payme.ts                     Payme JSON-RPC client + merchant validators
│   └── utils.ts
├── messages/                        ru, en, uz, uzc dictionaries (next-intl)
└── middleware.ts                    next-intl locale routing

prisma/
├── schema.prisma                    User · TaxEvent · Subscription · Payment · …
├── seed.ts                          ~250 tax events for the current year
├── seed-march-2026.ts               Period-specific seeders (one per quarter)
├── seed-april-2026.ts
└── migrate-*.ts                     One-off data migrations (orgTypes, water-farm-IE, …)

_docs/                               Reference docs (Payme, internal Claude notes)
tax_code_clean.txt                   Full text of the Tax Code (RU)
tax_code_index.jsonl                 Article-level retrieval index
```

### Where things live

| You want to … | Open … |
| --- | --- |
| Change which events apply to whom | `src/lib/event-filter.ts` — the matcher |
| Add a tax event to the calendar | A row in `prisma/seed.ts` (or a new `seed-*.ts` for a period), then `npm run db:seed` |
| Add a new org type / tax regime | Extend the enum in `prisma/schema.prisma`, add UI step in onboarding, update `event-filter.ts`, reseed |
| Localise an event title | The `titleRu/En/Uz/Uzc` columns on the row itself — *not* `messages/` (those are UI strings) |
| Add a UI string | `src/messages/<locale>.json` — keep keys in sync across all four files |
| Adjust reminder cadence | `reminderDays` on the `User` row + the cron at `src/app/api/cron/notifications/route.ts` |
| Touch payments | `src/lib/payme.ts` (client) + `src/app/api/payme/route.ts` (merchant webhook handling all 7 JSON-RPC methods) |
| Wire a new Pro feature | Gate it on `user.plan === 'PRO' && subscription.status === 'ACTIVE'` |
| Modify Trek's onboarding chat (Трэки) | `src/app/api/chat/onboarding/route.ts` and the prompt files near it |
| Modify the Pro Q&A grounding | `src/lib/tax-code-search.ts` (retrieval) + `src/app/api/chat/pro/route.ts` (composition) |

### Database schema (high level)

```
User ─┬─< AccountantOrg          multi-org accountant view
      ├─< EventStatus            mark events done / skipped per user
      ├─< Subscription >─ Payment  Payme card-binding & receipts
      ├─< Notification           in-app + Telegram reminder log
      ├─< AiChatUsage            Pro chat token accounting
      └─< TelegramAuthToken      one-time link tokens for TG login

TaxEvent  (canonical Tax Code calendar — seeded from prisma/seed.ts)
         (year, month, date, taxType, eventType,
          titleRu/En/Uz/Uzc, descRu/En/Uz/Uzc,
          articleRef, orgTypes[], taxRegimes[])
```

Important enums:
- `OrgType` — `LLC`, `JSC`, `IE`, `SELF_EMPLOYED`, `FARM`, `ACCOUNTANT`
- `TaxRegime` — `VAT`, `TURNOVER`, `BOTH`
- `TaxType` — 13 categories (`VAT`, `PERSONAL_IT`, `PROFIT`, `PROPERTY`, `LAND`, `WATER`, `EXCISE`, `SOCIAL`, `INPS`, `TURNOVER`, `RENT`, `FEES`, `OTHER`)
- `EventType` — `REPORT`, `PAYMENT`, `BOTH`
- `Plan` / `SubStatus` — `FREE`/`PRO`, `ACTIVE`/`CANCELLED`/`PAST_DUE`
- `NotifType` — `DEADLINE`, `PAYMENT`, `SYSTEM`

### Conventions and gotchas

- ⚠️ **Four locales — always.** `ru`, `en`, `uz` (Latin), `uzc` (Cyrillic). When you add a new TaxEvent or UI string, all four columns / files must be populated. A missing locale renders the raw key and looks broken.
- ⚠️ **Tax Code citations are mandatory.** Every `TaxEvent` row must carry an `articleRef` pointing at the Tax Code (e.g. `НК, ст. 355, ч. 2, п. 1`). Users trust the calendar because of this — don't add events without a citation.
- ⚠️ **Pro AI Q&A must stay grounded.** Always pull articles via `tax-code-search.ts` and feed them to Claude as context. Never let the model answer from training data alone.
- ⚠️ **Auth is single-cookie, dual-source.** Email/password login *and* Telegram Login Widget both produce the same iron-session cookie. Don't introduce a parallel session.
- ⚠️ **Cron is gated by `CRON_SECRET`.** `/api/cron/*` checks `x-cron-secret` header or `?secret=` query. Without the secret the endpoint should 401. Never log the secret.
- ⚠️ **Payme requires raw JSON-RPC handling.** All 7 methods (CheckPerformTransaction, CreateTransaction, CheckTransaction, PerformTransaction, CancelTransaction, GetStatement, ChangePassword) live in `src/app/api/payme/route.ts`. Read `_docs/` before changing anything here — wrong response shapes get the merchant account suspended.
- ⚠️ **Standalone build copies static + public.** The `build` script ends with `cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public`. If you change to `output: 'export'` or stop using standalone, drop the cp.
- **Accountant mode is a single user, many orgs.** A `User` with `role === 'ACCOUNTANT'` owns N `AccountantOrg` rows; each has its own profile and produces its own calendar. Don't accidentally union events across orgs.
- **Migrations come from Prisma.** `npm run db:migrate` (Prisma migrate). Data migrations (`prisma/migrate-*.ts`) are one-off TS scripts — read them before touching the schema.
- **Telegram bot has two modes.** `webhook` for production, `poll` for environments where the webhook can't be exposed. They share handlers — don't duplicate logic.

### Run / build / deploy

```bash
cp .env.example .env                  # DATABASE_URL, SESSION_SECRET,
                                      # CRON_SECRET, TELEGRAM_*, ANTHROPIC_*,
                                      # PAYME_* (Pro tier only)
npm install
npm run db:generate
npm run db:migrate
npm run db:seed                       # ~250 events into TaxEvent
npm run dev                           # :3000 · default locale /ru
npm run build && npm start            # production: standalone server.js → :3100
```

Production reverse-proxy is Caddy (snippet above). Reminders rely on a system cron hitting the gated endpoint daily at 03:00.

## License

[MIT](LICENSE)
