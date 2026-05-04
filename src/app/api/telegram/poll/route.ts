import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// This endpoint fetches updates from Telegram via long-polling
// and processes them the same way the webhook would.
// Call it via cron: GET /api/telegram/poll?secret=$CRON_SECRET
// It uses Telegram's getUpdates API with offset tracking.

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CRON_SECRET = process.env.CRON_SECRET;
if (!CRON_SECRET) {
  throw new Error("CRON_SECRET environment variable is required (see .env.example)");
}

async function sendMessage(chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function processMessage(message: Record<string, unknown>) {
  const from = message.from as Record<string, unknown>;
  const chatId = (message.chat as Record<string, unknown>)?.id as number;
  const text = (message.text as string) ?? "";

  if (!text.startsWith("/start auth_")) return;

  const token = text.slice("/start auth_".length).trim();
  const record = await prisma.telegramAuthToken.findUnique({ where: { token } });

  if (!record || record.expiresAt < new Date()) {
    await sendMessage(chatId, "❌ Ссылка устарела. Запросите новую на сайте trek.uz.");
    return;
  }

  if (record.userId) {
    await sendMessage(chatId, "✅ Вы уже вошли! Вернитесь на сайт trek.uz.");
    return;
  }

  const telegramId = String(from.id);
  let user = await prisma.user.findFirst({ where: { telegramId } });

  if (!user) {
    const name = [from.first_name, from.last_name].filter(Boolean).join(" ") || null;
    user = await prisma.user.create({
      data: {
        email: `tg_${telegramId}@trek.internal`,
        telegramId,
        telegramChatId: String(chatId),
        name: name as string | null,
        subscription: { create: { plan: "FREE", status: "ACTIVE" } },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: String(chatId) },
    });
  }

  await prisma.telegramAuthToken.update({
    where: { token },
    data: { userId: user.id },
  });

  await sendMessage(chatId, "✅ Вы вошли в Trek! Вернитесь на сайт — страница обновится автоматически.");
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get last processed update_id from DB (stored as a simple key-value in a temp token with id="tg_offset")
  // We use a workaround: store the offset in a special TelegramAuthToken with token = "__offset__"
  let offset = 0;
  const offsetRecord = await prisma.telegramAuthToken.findUnique({ where: { token: "__offset__" } });
  if (offsetRecord?.userId) {
    offset = parseInt(offsetRecord.userId, 10) || 0;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&limit=100&timeout=0&allowed_updates=["message"]`;
  const res = await fetch(url);
  const data = await res.json() as { ok: boolean; result: Array<{ update_id: number; message?: Record<string, unknown> }> };

  if (!data.ok || !data.result.length) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  let processed = 0;
  for (const update of data.result) {
    if (update.message) {
      await processMessage(update.message);
      processed++;
    }
    offset = update.update_id + 1;
  }

  // Save new offset
  await prisma.telegramAuthToken.upsert({
    where: { token: "__offset__" },
    create: { token: "__offset__", userId: String(offset), expiresAt: new Date("2099-01-01") },
    update: { userId: String(offset) },
  });

  return NextResponse.json({ ok: true, processed });
}
