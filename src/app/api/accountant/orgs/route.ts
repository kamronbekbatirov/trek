import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";

const FREE_LIMIT = 3;

async function getSession(req: NextRequest) {
  const res = NextResponse.next();
  return getIronSession<SessionData>(req, res, sessionOptions);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgs = await prisma.accountantOrg.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ orgs });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      orgType: true,
      subscription: { select: { plan: true, status: true } },
    },
  });

  if (!user || user.orgType !== "ACCOUNTANT") {
    return NextResponse.json({ error: "Only accountant accounts can manage organizations" }, { status: 403 });
  }

  const isPro = user.subscription?.plan === "PRO" && user.subscription?.status === "ACTIVE";

  const existingCount = await prisma.accountantOrg.count({
    where: { userId: session.userId },
  });

  if (!isPro && existingCount >= FREE_LIMIT) {
    return NextResponse.json({ error: "limit_reached" }, { status: 403 });
  }

  const body = await req.json();
  const { name, orgType, taxRegime, hasEmployees, assets, specialActivities, pensionFund } = body;

  if (!name || !orgType || orgType === "ACCOUNTANT") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const org = await prisma.accountantOrg.create({
    data: {
      userId: session.userId,
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
