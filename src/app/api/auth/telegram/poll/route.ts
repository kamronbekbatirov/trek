import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });

  const record = await prisma.telegramAuthToken.findUnique({ where: { token } });
  if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  if (record.expiresAt < new Date()) {
    await prisma.telegramAuthToken.delete({ where: { token } }).catch(() => {});
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  if (!record.userId) {
    return NextResponse.json({ waiting: true });
  }

  // Token redeemed — create session
  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const res = NextResponse.json({ ok: true, onboardingDone: user.onboardingDone });
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.userId = user.id;
  session.role = user.role;
  session.onboardingDone = user.onboardingDone;
  await session.save();

  // Clean up token
  await prisma.telegramAuthToken.delete({ where: { token } }).catch(() => {});

  return res;
}
