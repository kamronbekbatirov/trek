import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Use req/res pattern so session cookie is properly written to the response
    const res = NextResponse.json({ ok: true });
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      orgType,
      taxRegime,
      hasEmployees,
      assets,
      specialActivities,
      pensionFund,
      reminderDays,
      language,
      name,
    } = body;

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        orgType: orgType || undefined,
        taxRegime: taxRegime || undefined,
        hasEmployees: hasEmployees ?? undefined,
        assets: assets ?? [],
        specialActivities: specialActivities ?? [],
        pensionFund: pensionFund ?? [],
        reminderDays: reminderDays?.length ? reminderDays : [7, 3, 1],
        language: language || "ru",
        name: name || undefined,
        onboardingDone: true,
      },
    });

    // Mark onboarding done in session (writes Set-Cookie header on the response)
    session.onboardingDone = true;
    await session.save();

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
