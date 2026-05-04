import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const taxType = searchParams.get("taxType");
  const upcoming = searchParams.get("upcoming");

  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const where: Record<string, unknown> = {
    isPublished: true,
  };

  if (year) where.year = parseInt(year);
  if (month) where.month = parseInt(month);
  if (taxType && taxType !== "ALL") where.taxType = taxType;

  if (upcoming) {
    const now = new Date();
    where.date = { gte: now };
    const events = await prisma.taxEvent.findMany({
      where,
      orderBy: { date: "asc" },
      take: parseInt(upcoming) || 5,
    });
    return NextResponse.json(events);
  }

  const events = await prisma.taxEvent.findMany({
    where,
    orderBy: [{ month: "asc" }, { date: "asc" }],
  });

  return NextResponse.json(events);
}
