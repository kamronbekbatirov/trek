import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildProfileFilter, buildMultiOrgFilter } from "@/lib/event-filter";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegram(chatId: string, text: string) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // Non-fatal: log and continue
    console.error(`Telegram send failed for chat ${chatId}`);
  }
}

// GET /api/cron/notifications
// Should be called daily by a cron job.
// Creates notification records for users whose reminderDays match upcoming event deadlines.
// For Pro users with telegramChatId, also sends Telegram messages.
export async function GET(req: NextRequest) {
  // Simple secret check to prevent public access
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (secret !== expected) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all users who have completed onboarding
  const users = await prisma.user.findMany({
    where: { onboardingDone: true },
    select: {
      id: true,
      orgType: true,
      taxRegime: true,
      hasEmployees: true,
      assets: true,
      specialActivities: true,
      pensionFund: true,
      reminderDays: true,
      telegramChatId: true,
      language: true,
      subscription: { select: { plan: true, status: true } },
      accountantOrgs: { select: { orgType: true, taxRegime: true, hasEmployees: true, assets: true, specialActivities: true, pensionFund: true } },
    },
  });

  let created = 0;

  for (const user of users) {
    if (!user.reminderDays || user.reminderDays.length === 0) continue;

    // Find target dates: today + each reminderDay offset
    for (const days of user.reminderDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Find events on targetDate that match user profile
      const profileFilter = user.orgType === "ACCOUNTANT"
        ? buildMultiOrgFilter(user.accountantOrgs.map((o) => ({ ...o, orgType: String(o.orgType), taxRegime: o.taxRegime ? String(o.taxRegime) : null })))
        : buildProfileFilter({
            orgType: user.orgType,
            taxRegime: user.taxRegime,
            hasEmployees: user.hasEmployees,
            assets: user.assets,
            specialActivities: user.specialActivities,
            pensionFund: user.pensionFund,
            onboardingDone: true,
          });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {
        isPublished: true,
        date: { gte: targetDate, lt: nextDay },
        ...profileFilter,
      };

      const events = await prisma.taxEvent.findMany({ where, select: { id: true, titleRu: true, titleEn: true, titleUz: true, titleUzc: true, date: true } });

      for (const event of events) {
        // Check if notification already exists for this user+event+day combination
        const existing = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            eventId: event.id,
            type: "DEADLINE",
            createdAt: { gte: today },
          },
        });
        if (existing) continue;

        const dateStr = targetDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
        const daysText = days === 0 ? "сегодня" : days === 1 ? "завтра" : `через ${days} дн.`;
        const daysTextEn = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
        const daysTextUz = days === 0 ? "bugun" : days === 1 ? "ertaga" : `${days} kunda`;
        const daysTextUzc = days === 0 ? "бугун" : days === 1 ? "эртага" : `${days} кунда`;

        // Plain text for web notifications (no HTML tags)
        const msgRu = `📅 Trek — Срок ${daysText}: ${event.titleRu}. Дедлайн: ${dateStr}`;
        const msgEn = `📅 Trek — Deadline ${daysTextEn}: ${event.titleEn}. Date: ${dateStr}`;
        const msgUz = `📅 Trek — Muddat ${daysTextUz}: ${event.titleUz}. Sana: ${dateStr}`;
        const msgUzc = `📅 Trek — Муддат ${daysTextUzc}: ${event.titleUzc}. Сана: ${dateStr}`;

        await prisma.notification.create({
          data: {
            userId: user.id,
            eventId: event.id,
            type: "DEADLINE",
            messageRu: msgRu,
            messageEn: msgEn,
            messageUz: msgUz,
            messageUzc: msgUzc,
          },
        });

        // Send Telegram message to Pro users with linked Telegram (HTML format for Telegram)
        const isPro = user.subscription?.plan === "PRO" && user.subscription?.status === "ACTIVE";
        if (isPro && user.telegramChatId) {
          const lang = user.language ?? "ru";
          const tgMsg =
            lang === "en" ? `📅 <b>Trek</b>\nDeadline ${daysTextEn}: <b>${event.titleEn}</b>\nDate: ${dateStr}\n\n🔗 trek.uz/calendar` :
            lang === "uz" ? `📅 <b>Trek</b>\nMuddat ${daysTextUz}: <b>${event.titleUz}</b>\nSana: ${dateStr}\n\n🔗 trek.uz/calendar` :
            lang === "uzc" ? `📅 <b>Trek</b>\nМуддат ${daysTextUzc}: <b>${event.titleUzc}</b>\nСана: ${dateStr}\n\n🔗 trek.uz/calendar` :
            `📅 <b>Trek</b>\nСрок ${daysText}: <b>${event.titleRu}</b>\nДедлайн: ${dateStr}\n\n🔗 trek.uz/calendar`;
          await sendTelegram(user.telegramChatId, tgMsg);
        }

        created++;
      }
    }
  }

  return NextResponse.json({ ok: true, created });
}
