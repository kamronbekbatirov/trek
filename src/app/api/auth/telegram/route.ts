import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";
import crypto from "crypto";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function verifyTelegramAuth(data: TelegramUser, botToken: string): boolean {
  const { hash, ...rest } = data;

  // Build the data check string: sorted key=value pairs joined by \n
  const checkString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key as keyof typeof rest]}`)
    .join("\n");

  // Secret key = SHA256 of the bot token
  const secretKey = crypto.createHash("sha256").update(botToken).digest();

  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  // Also verify auth_date is not older than 24 hours
  const age = Math.floor(Date.now() / 1000) - data.auth_date;
  if (age > 86400) return false;

  return expectedHash === hash;
}

export async function POST(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: "Telegram not configured" }, { status: 500 });
    }

    const tgUser: TelegramUser = await req.json();

    if (!verifyTelegramAuth(tgUser, botToken)) {
      return NextResponse.json({ error: "Invalid Telegram auth data" }, { status: 401 });
    }

    // Use a synthetic email for Telegram users
    const syntheticEmail = `tg_${tgUser.id}@trek.telegram`;
    const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ");

    // Upsert user
    let user = await prisma.user.findUnique({ where: { email: syntheticEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: syntheticEmail,
          name: name || tgUser.username || "Telegram User",
          password: null,
          onboardingDone: false,
        },
      });
      // Create free subscription for new Telegram users
      await prisma.subscription.create({
        data: { userId: user.id, plan: "FREE", status: "ACTIVE" },
      });
    }

    // Save session using req/res pattern so Set-Cookie header is properly set
    const res = NextResponse.json({
      success: true,
      onboardingDone: user.onboardingDone,
      role: user.role,
    });
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.userId = user.id;
    session.email = user.email;
    session.name = user.name ?? undefined;
    session.role = user.role;
    session.onboardingDone = user.onboardingDone;
    await session.save();

    return res;
  } catch (e) {
    console.error("Telegram auth error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
