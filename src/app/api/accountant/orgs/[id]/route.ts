import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";

async function getSession(req: NextRequest) {
  const res = NextResponse.next();
  return getIronSession<SessionData>(req, res, sessionOptions);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.accountantOrg.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { name, orgType, taxRegime, hasEmployees, assets, specialActivities, pensionFund } = body;

  if (!name || !orgType || orgType === "ACCOUNTANT") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const org = await prisma.accountantOrg.update({
    where: { id },
    data: {
      name,
      orgType,
      taxRegime: taxRegime || null,
      hasEmployees: hasEmployees ?? null,
      assets: assets ?? [],
      specialActivities: specialActivities ?? [],
      pensionFund: pensionFund ?? [],
    },
  });

  return NextResponse.json({ org });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.accountantOrg.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.accountantOrg.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
