import { NextRequest, NextResponse } from "next/server";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.userId) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      orgType: true,
      taxRegime: true,
      language: true,
      hasEmployees: true,
      assets: true,
      specialActivities: true,
      pensionFund: true,
      reminderDays: true,
      onboardingDone: true,
      telegramId: true,
      telegramUsername: true,
      phone: true,
      subscription: { select: { plan: true, status: true } },
    },
  });

  return NextResponse.json({ user });
}
