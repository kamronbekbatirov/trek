# Trek — The Uzbek Tax Calendar

A visual tax calendar for Uzbek accountants and business owners. Trek tells you exactly which declarations you owe, when each one is due, and nudges you on Telegram before the deadline — all built on top of a structured, machine-readable copy of the Uzbek Tax Code.

[![Live](https://img.shields.io/badge/live-trek.uz-000?style=flat-square)](https://trek.uz)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

## The problem

In Uzbekistan, tax obligations vary wildly by organisation type, tax regime, asset profile, headcount, and special activities. The calendar of declarations and payments runs into dozens of unique deadlines per year, scattered across multiple government portals, all in dense legal Russian. Most small businesses simply miss filings — and pay penalties — because there is no single, personalised view of *what is due, when, by me*.

## What Trek does

1. **Onboards you in plain language.** A guided chat (powered by Claude) walks you through 6–7 questions about your business: legal form, tax regime, employees, assets, activities. The answers populate your profile.
2. **Generates your personal calendar.** Trek matches your profile against a structured copy of the Tax Code (`tax_code_index.jsonl`) and produces every declaration and payment you owe — with deadlines, amounts where deterministic, and direct links to the relevant article.
3. **Reminds you on time.** A daily cron job sends Telegram reminders 7 / 3 / 1 days before each deadline (configurable). For Pro users, it also forwards the filing checklist to a chat.
4. **Exports to your tools.** Any view can be exported as `.ics` (drop into Apple/Google Calendar), `.xlsx` (for your accountant), or browsed on the web.
5. **Adapts as you grow.** Add an employee, change your tax regime, register a new activity — Trek recomputes the calendar in seconds.

## Highlights

- **Trilingual UI** — Russian (default), Uzbek, English via `next-intl`.
- **Two ways to sign in** — email/password (bcrypt-hashed) *or* Telegram Login Widget. Sessions are signed with `iron-session`.
- **Pro tier with Payme** — subscription billing through Uzbekistan's most-used payment provider.
- **Accountant mode** — a single accountant can manage many client orgs from one dashboard.
- **Hardened API** — every cron endpoint is gated by `CRON_SECRET`, all admin routes are role-checked, and inputs are validated with Zod.
- **AI assistance** — onboarding chat and Pro Q&A use Claude (`@anthropic-ai/sdk`) grounded against the indexed Tax Code.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, standalone output) |
| Language | TypeScript 5 |
| UI | React 19, Radix UI primitives, Tailwind CSS 4, sonner toasts |
| Database | PostgreSQL via Prisma 6 |
| Auth | iron-session, bcryptjs, Telegram Login Widget |
| Validation | Zod |
| Internationalisation | next-intl |
| AI | Anthropic SDK (Claude) |
| Payments | Payme.uz |

## Getting started

Prerequisites: Node.js 20+, PostgreSQL 14+, optional Telegram bot for Telegram login, optional Anthropic key for AI features.

```bash
git clone https://github.com/kamronbekbatirov/trek.git
cd trek
cp .env.example .env
# fill in DATABASE_URL, SESSION_SECRET, CRON_SECRET …
npm install
npm run db:generate
npm run db:migrate
npm run db:seed   # loads the indexed Tax Code into the DB
npm run dev
```

The dev server runs at <http://localhost:3000>.

## Configuration

All variables are documented in [`.env.example`](.env.example) and **required** — the app refuses to start with an unset `SESSION_SECRET` or `CRON_SECRET`. Highlights:

- `DATABASE_URL` — PostgreSQL connection string used by Prisma.
- `SESSION_SECRET` — 32+ random characters.
- `CRON_SECRET` — shared secret for `/api/cron/*` endpoints.
- `TELEGRAM_BOT_TOKEN` + `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — required for Telegram login & reminders.
- `ANTHROPIC_API_KEY` — required for the onboarding chat and Pro Q&A.

## Architecture

```
src/
├── app/
│   ├── (public)             # Landing, pricing, legal pages
│   ├── [locale]/            # Locale-prefixed app shell
│   ├── api/
│   │   ├── auth/            # email + Telegram login, register, logout
│   │   ├── onboarding/      # AI-guided setup chat
│   │   ├── events/          # Tax events: list, preview, mark-as-done
│   │   ├── notifications/   # Read receipts
│   │   ├── subscriptions/   # Payme card-binding & status
│   │   ├── export/          # .ics + .xlsx generators
│   │   ├── chat/            # Pro Q&A grounded on the Tax Code
│   │   ├── cron/            # Daily reminder dispatcher (CRON_SECRET-gated)
│   │   ├── telegram/        # Webhook + long-poll fallback
│   │   ├── accountant/      # Multi-org accountant view
│   │   ├── admin/           # Admin dashboard endpoints
│   │   ├── payme/           # Payme merchant API
│   │   └── user/            # Profile + account actions
│   └── globals.css
├── components/              # Radix-based UI primitives
├── i18n/                    # next-intl config
├── lib/                     # auth, db, anthropic, telegram, prisma, …
└── messages/                # ru.json, uz.json, en.json
prisma/
├── schema.prisma            # User, Subscription, Event, Notification, …
└── seed.ts                  # loads tax_code_index.jsonl into the DB
_docs/                       # Reference docs (Payme, internal Claude notes)
tax_code_clean.txt           # Cleaned full text of the Tax Code
tax_code_index.jsonl         # Article index used by the AI grounding step
```

## The Tax Code dataset

`tax_code_clean.txt` is the cleaned full text of the Uzbek Tax Code (Russian). `tax_code_index.jsonl` is a JSON-Lines index produced from that text — one record per article — and includes the article number, heading, body, and any structured metadata (regime, organisation type, deadline pattern). The AI assistants use this index for retrieval-augmented answers; the cron dispatcher uses it to compute upcoming deadlines.

If the Tax Code changes, regenerate the index, then run `npm run db:seed` again — events are recomputed.

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

## License

Released under the [MIT License](LICENSE).
