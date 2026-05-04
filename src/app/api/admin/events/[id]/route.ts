import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";

async function checkAdmin(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  return session.role === "ADMIN" ? session : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  const updateData: Record<string, unknown> = {};
  const fields = [
    "taxType", "eventType", "titleRu", "titleEn", "titleUz", "titleUzc",
    "descRu", "descEn", "descUz", "descUzc", "articleRef",
    "orgTypes", "taxRegimes", "requiresEmployees",
    "requiresAssets", "requiresSpecial", "requiresPension",
    "forPeriod", "baseDateNK",
    "isPublished", "isDraft", "year", "month",
  ];

  for (const field of fields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  if (data.date) {
    updateData.date = new Date(data.date);
  }
  if (data.baseDateNK) {
    updateData.baseDateNK = new Date(data.baseDateNK);
  }

  const event = await prisma.taxEvent.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(event);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await checkAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.taxEvent.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
