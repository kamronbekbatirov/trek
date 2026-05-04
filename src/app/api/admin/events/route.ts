import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";

async function checkAdmin(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  return session.role === "ADMIN" ? session : null;
}

export async function POST(req: NextRequest) {
  const session = await checkAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const event = await prisma.taxEvent.create({
    data: {
      date: new Date(data.date),
      year: data.year,
      month: data.month,
      taxType: data.taxType,
      eventType: data.eventType,
      titleRu: data.titleRu || "",
      titleEn: data.titleEn || data.titleRu || "",
      titleUz: data.titleUz || data.titleRu || "",
      titleUzc: data.titleUzc || data.titleRu || "",
      descRu: data.descRu || "",
      descEn: data.descEn || data.descRu || "",
      descUz: data.descUz || data.descRu || "",
      descUzc: data.descUzc || data.descRu || "",
      articleRef: data.articleRef || null,
      orgTypes: data.orgTypes ?? [],
      taxRegimes: data.taxRegimes ?? [],
      requiresEmployees: data.requiresEmployees ?? null,
      requiresAssets: data.requiresAssets ?? [],
      requiresSpecial: data.requiresSpecial ?? [],
      requiresPension: data.requiresPension ?? [],
      forPeriod: data.forPeriod || null,
      baseDateNK: data.baseDateNK ? new Date(data.baseDateNK) : null,
      isPublished: data.isPublished ?? false,
      isDraft: !data.isPublished,
    },
  });

  return NextResponse.json(event, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await checkAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.taxEvent.findMany({
    orderBy: [{ year: "asc" }, { month: "asc" }, { date: "asc" }],
  });

  return NextResponse.json(events);
}
