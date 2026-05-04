/**
 * Card binding via Payme Subscribe API
 *
 * POST /api/subscriptions/card         – create card token (step 1)
 * POST /api/subscriptions/card/verify  – verify with SMS (step 3)
 * DELETE /api/subscriptions/card       – remove saved card
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import { cardsCreate, cardsGetVerifyCode, cardsRemove } from "@/lib/payme";

async function getSession(req: NextRequest) {
  const res = NextResponse.next();
  return getIronSession<SessionData>(req, res, sessionOptions);
}

// Step 1: Create card token + request SMS
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { number, expire } = await req.json();
  if (!number || !expire) {
    return NextResponse.json({ error: "Card number and expiry required" }, { status: 400 });
  }

  const result = await cardsCreate(number, expire);
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const card = result.result?.card as Record<string, unknown>;
  const token = card._id as string;

  // Request SMS verification
  const verifyResult = await cardsGetVerifyCode(token);
  if (verifyResult.error) {
    return NextResponse.json({ error: verifyResult.error.message }, { status: 400 });
  }

  return NextResponse.json({
    token,
    phone: (verifyResult.result?.phone as string) ?? "",
    sent: true,
  });
}

// Remove saved card
export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.userId },
  });

  if (subscription?.paymeCardToken) {
    await cardsRemove(subscription.paymeCardToken);
    await prisma.subscription.update({
      where: { userId: session.userId },
      data: { paymeCardToken: null, paymeCardMask: null },
    });
  }

  return NextResponse.json({ success: true });
}
