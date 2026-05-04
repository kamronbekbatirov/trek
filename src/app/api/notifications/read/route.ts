import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";

// POST /api/notifications/read — mark all (or specific) notifications as read
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore as never, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { ids } = body as { ids?: string[] };

    const now = new Date();

    if (ids && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { userId: session.userId, id: { in: ids }, readAt: null },
        data: { readAt: now },
      });
    } else {
      // Mark all unread as read
      await prisma.notification.updateMany({
        where: { userId: session.userId, readAt: null },
        data: { readAt: now },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
