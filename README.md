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

## License

[MIT](LICENSE)
