import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST() {
  const token = randomBytes(16).toString("hex"); // 32 chars + "auth_" = 37 chars, within Telegram's 64-char limit
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.telegramAuthToken.create({ data: { token, expiresAt } });

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "trekcalendar_bot";
  const url = `https://t.me/${botUsername}?start=auth_${token}`;

  return NextResponse.json({ token, url });
}
