import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";
import { buildProfileFilter, buildMultiOrgFilter } from "@/lib/event-filter";

function escapeIcs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toIcsDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      orgType: true, taxRegime: true, hasEmployees: true,
      assets: true, specialActivities: true, pensionFund: true,
      onboardingDone: true, role: true,
      subscription: { select: { plan: true, status: true } },
      accountantOrgs: { select: { orgType: true, taxRegime: true, hasEmployees: true, assets: true, specialActivities: true, pensionFund: true } },
    },
  });

  const isPro =
    dbUser?.role === "ADMIN" ||
    (dbUser?.subscription?.plan === "PRO" && dbUser?.subscription?.status === "ACTIVE");
  if (!isPro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const profileFilter = dbUser?.orgType === "ACCOUNTANT"
    ? buildMultiOrgFilter((dbUser.accountantOrgs ?? []).map((o) => ({ ...o, orgType: String(o.orgType), taxRegime: o.taxRegime ? String(o.taxRegime) : null })))
    : buildProfileFilter({
        orgType: dbUser?.orgType,
        taxRegime: dbUser?.taxRegime,
        hasEmployees: dbUser?.hasEmployees,
        assets: dbUser?.assets,
        specialActivities: dbUser?.specialActivities,
        pensionFund: dbUser?.pensionFund,
        onboardingDone: dbUser?.onboardingDone,
      });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isPublished: true, year, ...profileFilter };
  if (month) where.month = month;

  const events = await prisma.taxEvent.findMany({
    where,
    orderBy: { date: "asc" },
  });

  const now = new Date();
  const stamp = toIcsDate(now);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Trek//Tax Calendar UZ//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Trek — Налоговый календарь ${year}`,
    "X-WR-TIMEZONE:Asia/Tashkent",
  ];

  for (const evt of events) {
    const date = new Date(evt.date);
    const dateStr = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:trek-${evt.id}@trek.uz`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
    lines.push(`DTEND;VALUE=DATE:${dateStr}`);
    lines.push(`SUMMARY:${escapeIcs(evt.titleRu)}`);
    if (evt.descRu) {
      lines.push(`DESCRIPTION:${escapeIcs(evt.descRu.slice(0, 500))}`);
    }
    if (evt.articleRef) {
      lines.push(`COMMENT:${escapeIcs(evt.articleRef)}`);
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  const icsContent = lines.join("\r\n");
  const filename = month
    ? `trek-calendar-${year}-${String(month).padStart(2, "0")}.ics`
    : `trek-calendar-${year}.ics`;

  return new Response(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
