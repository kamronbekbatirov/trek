/**
 * GET  /api/subscriptions  – get current user's subscription + payment history
 * POST /api/subscriptions  – get Payme checkout URL for Pro upgrade
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";
import { getCheckoutUrl, PRO_PLAN_AMOUNT } from "@/lib/payme";

async function getSession(req: NextRequest) {
  const res = NextResponse.next();
  return getIronSession<SessionData>(req, res, sessionOptions);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.userId },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return NextResponse.json({
    subscription: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          nextBillingDate: subscription.nextBillingDate,
          cancelledAt: subscription.cancelledAt,
          cardMask: subscription.paymeCardMask,
          payments: subscription.payments.map((p) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            description: p.description,
            createdAt: p.createdAt,
          })),
        }
      : {
          plan: "FREE",
          status: "ACTIVE",
          nextBillingDate: null,
          cancelledAt: null,
          cardMask: null,
          payments: [],
        },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { locale = "ru" } = await req.json().catch(() => ({}));

  const checkoutUrl = getCheckoutUrl(session.userId, PRO_PLAN_AMOUNT, locale);

  return NextResponse.json({ checkoutUrl });
}
