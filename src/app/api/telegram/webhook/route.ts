import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

async function sendMessage(chatId: number | string, text: string, replyMarkup?: unknown) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup }),
  });
}

async function removeKeyboard(chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: { remove_keyboard: true },
    }),
  });
}

export async function POST(req: NextRequest) {
  if (WEBHOOK_SECRET) {
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = body?.message as Record<string, unknown> | undefined;
  if (!message) return NextResponse.json({ ok: true });

  const from = message.from as Record<string, unknown>;
  const chatId = (message.chat as Record<string, unknown>)?.id as number;
  const text = (message.text as string) ?? "";

  // ── Step 1: /start auth_TOKEN — validate token, ask for phone ──────────────
  if (text.startsWith("/start auth_")) {
    const token = text.slice("/start auth_".length).trim();

    const record = await prisma.telegramAuthToken.findUnique({ where: { token } });

    if (!record || record.expiresAt < new Date()) {
      await sendMessage(chatId, "❌ Ссылка устарела. Запросите новую на сайте trek.uz.");
      return NextResponse.json({ ok: true });
    }

    if (record.userId) {
      await sendMessage(chatId, "✅ Вы уже вошли! Вернитесь на сайт trek.uz.");
      return NextResponse.json({ ok: true });
    }

    const name = [from.first_name, from.last_name].filter(Boolean).join(" ") || null;
    const username = (from.username as string) ?? null;

    const telegramId = String(from.id);

    // Check if user already exists with this telegramId (returning user)
    const existingUser = await prisma.user.findFirst({ where: { telegramId } });

    if (existingUser) {
      // User already registered — skip phone request, complete auth immediately
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { telegramChatId: String(chatId) },
      });
      await prisma.telegramAuthToken.update({
        where: { token },
        data: { userId: existingUser.id },
      });
      await removeKeyboard(chatId, "✅ Вы вошли в Trek! Вернитесь на сайт — страница обновится автоматически.");
      return NextResponse.json({ ok: true });
    }

    // New user — save pending state and ask for phone
    await prisma.telegramAuthToken.update({
      where: { token },
      data: {
        pendingChatId: String(chatId),
        pendingTelegramId: telegramId,
        pendingUsername: username,
        pendingName: name,
      },
    });

    await sendMessage(
      chatId,
      "👋 Добро пожаловать в Trek!\n\nДля завершения входа поделитесь своим номером телефона — нажмите кнопку ниже.",
      {
        keyboard: [[{ text: "📱 Поделиться номером телефона", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      }
    );

    return NextResponse.json({ ok: true });
  }

  // ── Step 2: Contact shared — complete authentication ────────────────────────
  const contact = message.contact as Record<string, unknown> | undefined;
  if (contact) {
    const phone = contact.phone_number as string;

    // Find the pending token for this chat
    const record = await prisma.telegramAuthToken.findFirst({
      where: {
        pendingChatId: String(chatId),
        userId: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      await removeKeyboard(
        chatId,
        "❌ Нет ожидающего входа. Запросите новую ссылку на сайте trek.uz."
      );
      return NextResponse.json({ ok: true });
    }

    const telegramId = record.pendingTelegramId!;

    let user = await prisma.user.findFirst({ where: { telegramId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `tg_${telegramId}@trek.internal`,
          telegramId,
          telegramChatId: String(chatId),
          telegramUsername: record.pendingUsername,
          name: record.pendingName,
          phone,
          subscription: { create: { plan: "FREE", status: "ACTIVE" } },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          telegramChatId: String(chatId),
          telegramUsername: record.pendingUsername,
          phone,
        },
      });
    }

    await prisma.telegramAuthToken.update({
      where: { id: record.id },
      data: { userId: user.id },
    });

    await removeKeyboard(
      chatId,
      "✅ Вы вошли в Trek! Вернитесь на сайт — страница обновится автоматически."
    );

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
