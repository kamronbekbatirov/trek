import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionOptions, SessionData } from "@/lib/session";
import { getIronSession } from "iron-session";

export async function PATCH(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    orgType,
    taxRegime,
    language,
    hasEmployees,
    assets,
    specialActivities,
    pensionFund,
    reminderDays,
  } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};

  if (name !== undefined) data.name = name || null;
  if (orgType !== undefined) data.orgType = orgType || null;
  if (taxRegime !== undefined) data.taxRegime = taxRegime || null;
  if (language !== undefined) data.language = language || "ru";
  if (hasEmployees !== undefined) data.hasEmployees = hasEmployees;
  if (assets !== undefined) data.assets = Array.isArray(assets) ? assets : [];
  if (specialActivities !== undefined) data.specialActivities = Array.isArray(specialActivities) ? specialActivities : [];
  if (pensionFund !== undefined) data.pensionFund = Array.isArray(pensionFund) ? pensionFund : [];
  if (reminderDays !== undefined) data.reminderDays = Array.isArray(reminderDays) ? reminderDays : [7, 3, 1];

  await prisma.user.update({
    where: { id: session.userId },
    data,
  });

  return NextResponse.json({ success: true });
}
