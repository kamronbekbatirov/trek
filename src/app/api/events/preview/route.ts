import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint — returns all published events for a given month
// Client-side filtering by orgType/taxRegime is done in the component
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const events = await prisma.taxEvent.findMany({
    where: { isPublished: true, year, month },
    select: {
      id: true,
      date: true,
      taxType: true,
      eventType: true,
      titleRu: true,
      titleEn: true,
      titleUz: true,
      titleUzc: true,
      orgTypes: true,
      taxRegimes: true,
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(
    events.map((e) => ({ ...e, date: e.date.toISOString() }))
  );
}
