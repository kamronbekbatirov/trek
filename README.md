# Trek — The Uzbek Tax Calendar

A personalised tax calendar for Uzbek accountants and businesses. Trek figures out exactly which declarations and payments you owe based on your organisation profile, lays them out across a 12-month calendar, and nudges you on Telegram before each deadline — all on top of a structured, machine-readable copy of the Uzbek Tax Code.

[![Live](https://img.shields.io/badge/live-trek.uz-000?style=flat-square)](https://trek.uz)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

## The problem

In Uzbekistan, tax obligations vary wildly by organisation type, tax regime, headcount, asset profile, and special activities. The calendar of declarations and payments runs into dozens of unique deadlines per year, scattered across multiple government portals, all in dense legal Russian. Most small businesses simply miss filings — and pay penalties — because there is no single, personalised view of *what is due, when, by me*.

## What Trek does

1. **AI-guided onboarding.** A 9-step wizard, with [Claude](https://www.anthropic.com/claude) (Anthropic) available as an inline assistant called *Трэки* who answers questions about each step and cites the relevant Tax Code articles. The wizard collects:
   - Organisation type — `LLC`, `JSC`, `IE` (sole proprietor), `SELF_EMPLOYED`, `FARM`, or `ACCOUNTANT` (multi-org mode)
   - Tax regime — `VAT`, `TURNOVER`, or `BOTH`
   - Whether you have employees (drives payroll-tax events)
   - Owned assets (drives property, land, water taxes)
   - Special activities (excise, dividends, KIK, etc.)
   - Pension-fund overrides
   - Reminder days (default `[7, 3, 1]`)
   - Language preference

2. **Generates your personal calendar.** Every `TaxEvent` in the seeded database is tagged with the organisation types and tax regimes it applies to. The matching engine in `src/lib/event-filter.ts` cross-references your profile and produces only the events you owe. Every event has its title and description in **four languages** — Russian, English, Uzbek-Latin, Uzbek-Cyrillic — and a citation to the Tax Code article that mandates it (`НК, ст. 355, ч. 2, п. 1`).

3. **Reminds you on time.** A daily cron endpoint (`/api/cron/notifications`, gated by `CRON_SECRET`) iterates every user, finds events whose deadline matches their `reminderDays`, and dispatches Telegram messages via the configured bot. Notifications are persisted in the `Notification` table for in-app rendering.

4. **Exports to your tools.** Any view can be exported to:
   - `.ics` — drop into Apple/Google/Outlook calendars (`/api/export/ics`)
   - `.xlsx` — for an accountant who works in Excel (`/api/export/excel`)

5. **Pro tier with Payme.** For 79 000 UZS / month, Pro users unlock the AI Q&A chat (`/api/chat/pro`), unlimited Telegram reminders, and accountant multi-org features. The integration with [Payme](https://payme.uz) covers card binding, recurring receipts, and the merchant-side webhook (`/api/payme`) that handles the JSON-RPC protocol.

6. **Accountant mode.** A single user with role `ACCOUNTANT` can manage many `AccountantOrg` records — each with its own org type, tax regime, employees, assets — and switch between calendars from one dashboard.

7. **Adapts as you grow.** Add an employee, change your tax regime, register a new activity — Trek recomputes the visible calendar in seconds.

## The data model

```
User ─┬─< AccountantOrg          (multi-org accountant view)
      ├─< EventStatus            (mark events done / skipped per user)
      ├─< Subscription >─ Payment (Payme card-binding & receipts)
      ├─< Notification           (in-app + Telegram reminder log)
      ├─< AiChatUsage            (Pro chat token accounting)
      └─< TelegramAuthToken      (one-time link tokens for TG login)

TaxEvent  (the canonical Tax Code calendar — seeded from prisma/seed.ts)
```

Highlights of the Prisma schema:

- **`TaxEvent`** — `(year, month, date, taxType, eventType, titleRu/En/Uz/Uzc, descRu/En/Uz/Uzc, articleRef, orgTypes[], taxRegimes[])`. The `orgTypes` and `taxRegimes` arrays are what the matcher pivots on.
- **`TaxType`** enum — 13 categories: `VAT`, `PERSONAL_IT`, `PROFIT`, `PROPERTY`, `LAND`, `WATER`, `EXCISE`, `SOCIAL`, `INPS`, `TURNOVER`, `RENT`, `FEES`, `OTHER`.
- **`EventType`** enum — `REPORT`, `PAYMENT`, `BOTH`.
- **`Plan`** / **`SubStatus`** — `FREE` / `PRO`, `ACTIVE` / `CANCELLED` / `PAST_DUE`.
- **`NotifType`** enum — `DEADLINE`, `PAYMENT`, `SYSTEM`.

## Authentication

Two equivalent flows:

- **Email + password** — `bcryptjs` (cost 10), with `iron-session` cookies. Routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
- **Telegram Login Widget** — the user clicks the official Telegram button, the bot writes a `TelegramAuthToken`, the page polls `/api/auth/telegram` until it sees a `userId`, then issues the same iron-session cookie.

All admin routes (`/api/admin/*`) check `user.role === ADMIN` server-side.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, `output: 'standalone'`) |
| Language | TypeScript 5 |
| UI | React 19, Radix UI primitives, Tailwind CSS 4, sonner toasts |
| Database | PostgreSQL 16 via Prisma 6 |
| Auth | iron-session, bcryptjs, Telegram Login Widget |
| Validation | Zod |
| Internationalisation | next-intl 3 |
| AI | Anthropic SDK (Claude) |
| Payments | Payme.uz JSON-RPC merchant API |
| Calendar | `date-fns` |

## Getting started

Prerequisites: Node.js 20+, PostgreSQL 14+, optional Telegram bot, optional Anthropic key, optional Payme merchant credentials.

```bash
git clone https://github.com/kamronbekbatirov/trek.git
cd trek
cp .env.example .env
# fill in DATABASE_URL, SESSION_SECRET, CRON_SECRET …
npm install
npm run db:generate
npm run db:migrate
npm run db:seed              # loads ~250 tax events into TaxEvent
npm run dev
```

The dev server runs at <http://localhost:3000>, default locale `/ru`. Other locales: `/en`, `/uz`, `/uzc`.

## Configuration

All variables are documented in [`.env.example`](.env.example) and **required** — the app refuses to start with an unset `SESSION_SECRET` or `CRON_SECRET`. Highlights:

- `DATABASE_URL` — PostgreSQL connection string used by Prisma.
- `SESSION_SECRET` — 32+ random characters.
- `CRON_SECRET` — shared secret for `/api/cron/*` endpoints. Set as `x-cron-secret` header or `?secret=` query parameter.
- `TELEGRAM_BOT_TOKEN` + `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — required for Telegram login & reminders.
- `ANTHROPIC_API_KEY` — required for the onboarding chat and Pro Q&A.

Optional, only if you enable paid subscriptions:
- `PAYME_MERCHANT_ID`, `PAYME_SECRET_KEY`, `PAYME_TEST_KEY`, `PAYME_TEST_MODE`

## Internationalisation

Trek ships with full UI translations in **four locales**:

- `ru.json` — Russian (default)
- `uz.json` — Uzbek (Latin)
- `uzc.json` — Uzbek (Cyrillic)
- `en.json` — English

Routing is via `next-intl` middleware with locale-prefixed paths (`/<locale>/...`). Tax events themselves are stored in all four languages directly on the `TaxEvent` row (`titleRu/En/Uz/Uzc`, `descRu/En/Uz/Uzc`) — the matcher picks the right column based on the user's `language` preference.

## API surface (selected)

```
auth/         register, login, logout, me, telegram (Telegram Login flow)
events/       list, preview, [id], status (mark-as-done)
notifications read receipts
subscriptions card binding & status (Payme)
export/       ics, excel
chat/         onboarding (free), pro (Pro tier, AI Q&A on Tax Code)
cron/         notifications  ← daily reminder dispatch (CRON_SECRET-gated)
telegram/     webhook (live updates), poll (long-poll fallback)
accountant/   orgs (multi-org accountant view)
admin/        events (CRUD), users (manage), stats
payme/        merchant JSON-RPC: CheckPerformTransaction, CreateTransaction,
              PerformTransaction, CancelTransaction, GetStatement
user/         profile, account
```

## The Tax Code dataset

Two reference files at the repository root:

- **`tax_code_clean.txt`** — the cleaned full text of the Uzbek Tax Code (Russian).
- **`tax_code_index.jsonl`** — a JSON-Lines index produced from that text. One record per article with `{number, heading, body, regime?, orgType?, deadlinePattern?}`.

The Pro chat (`/api/chat/pro`) uses `src/lib/tax-code-search.ts` to retrieve the most relevant articles for any user question, and feeds them to Claude as grounded context — answers are never hallucinated, they are written *with* the Tax Code in front of the model.

When the Tax Code changes, regenerate the index, then run `npm run db:seed` again — events are recomputed.

## Architecture map

```
src/
├── app/
│   ├── [locale]/            Locale-prefixed routes
│   │   ├── auth/            login, register
│   │   ├── onboarding/      9-step wizard with AI helper
│   │   ├── dashboard/       Today + upcoming view
│   │   ├── calendar/        Full 12-month grid
│   │   ├── events/[id]/     Event detail with Tax Code citation
│   │   ├── chat/            Pro AI Q&A
│   │   ├── billing/         Payme card binding & invoice list
│   │   ├── settings/        Profile, language, reminder days
│   │   ├── admin/           Admin: events CRUD, users, stats
│   │   ├── privacy/, terms/, contact/
│   │   └── page.tsx         Landing
│   ├── api/                 (see "API surface" above)
│   └── globals.css
├── components/
│   ├── auth/                Login forms, Telegram widget
│   ├── billing/             Payme card form
│   ├── calendar/            12-month grid, event cards, demo
│   ├── chat/                AI assistant widget
│   ├── dashboard/           Today, upcoming
│   ├── onboarding/          Each wizard step
│   ├── accountant/          Org switcher, multi-org table
│   ├── admin/               Events table, user management
│   ├── landing/             Hero, calendar-demo
│   ├── layout/              Header, footer
│   └── ui/                  Radix-based primitives
├── i18n/                    next-intl config
├── lib/
│   ├── db.ts                Prisma client singleton
│   ├── session.ts           iron-session config
│   ├── event-filter.ts      Match user profile → TaxEvents
│   ├── tax-code-search.ts   Retrieval over tax_code_index.jsonl
│   ├── payme.ts             Payme JSON-RPC client + merchant validators
│   └── utils.ts
├── messages/                ru, en, uz, uzc dictionaries
└── middleware.ts            next-intl locale routing
prisma/
├── schema.prisma            User, TaxEvent, Subscription, Payment, …
└── seed.ts                  ~250 tax events for the current year
_docs/                       Reference documentation (Payme, internal Claude notes)
tax_code_clean.txt           Full text of the Tax Code
tax_code_index.jsonl         Article-level index
```

## Production

`npm run build` produces `.next/standalone/server.js`. The reference systemd unit binds to `127.0.0.1:3100` and sits behind Caddy:

```caddy
trek.uz {
    reverse_proxy 127.0.0.1:3100 {
        header_up X-Forwarded-Proto https
        header_up X-Forwarded-Host trek.uz
    }
}
```

The cron dispatcher is wired up as a system cron job that hits the gated endpoint once a day:

```cron
0 3 * * * curl -sf -H "x-cron-secret: $CRON_SECRET" https://trek.uz/api/cron/notifications
```

## License

Released under the [MIT License](LICENSE).
