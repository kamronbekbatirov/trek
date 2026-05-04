import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  try {
    const res = NextResponse.json({ ok: true });
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    // Delete user — all related records cascade automatically
    await prisma.user.delete({ where: { id: userId } });

    // Clear session
    session.destroy();
    await session.save();

    return res;
  } catch (e) {
    console.error("Delete account error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
