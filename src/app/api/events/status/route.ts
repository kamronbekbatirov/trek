import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore as never, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, isDone } = await req.json();

    if (!eventId || typeof isDone !== "boolean") {
      return NextResponse.json({ error: "eventId and isDone required" }, { status: 400 });
    }

    await prisma.eventStatus.upsert({
      where: { userId_eventId: { userId: session.userId, eventId } },
      create: { userId: session.userId, eventId, isDone },
      update: { isDone },
    });

    return NextResponse.json({ ok: true, isDone });
  } catch (e) {
    console.error("Event status error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
