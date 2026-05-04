/**
 * POST /api/subscriptions/card/verify
 * Step 3: Verify card with SMS code and save token
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cardsVerify } from "@/lib/payme";

async function getSession(req: NextRequest) {
  const res = NextResponse.next();
  return getIronSession<SessionData>(req, res, sessionOptions);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token, code } = await req.json();
  if (!token || !code) {
    return NextResponse.json({ error: "Token and code required" }, { status: 400 });
  }

  const result = await cardsVerify(token, code);
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const card = result.result?.card as Record<string, unknown>;
  if (!card?.verify) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  // Save card token and mask to subscription
  const subscription = await prisma.subscription.upsert({
    where: { userId: session.userId },
    update: {
      paymeCardToken: token,
      paymeCardMask: card.number as string,
    },
    create: {
      userId: session.userId,
      paymeCardToken: token,
      paymeCardMask: card.number as string,
    },
  });

  return NextResponse.json({
    success: true,
    cardMask: subscription.paymeCardMask,
  });
}
