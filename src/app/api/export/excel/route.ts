import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/db";
import { buildProfileFilter, buildMultiOrgFilter } from "@/lib/event-filter";

const TAX_LABELS: Record<string, string> = {
  VAT: "НДС", PERSONAL_IT: "НДФЛ", PROFIT: "Налог на прибыль",
  PROPERTY: "Налог на имущество", LAND: "Земельный налог",
  WATER: "Водный налог", EXCISE: "Акциз", SOCIAL: "Соцналог",
  INPS: "ИНПС", TURNOVER: "Налог с оборота", RENT: "Аренда",
  FEES: "Сборы", OTHER: "Прочее",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  REPORT: "Отчётность", PAYMENT: "Уплата", BOTH: "Отчётность и уплата",
};

function escapeCsvCell(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
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

  const headers = ["Дата", "Название", "Тип налога", "Тип события", "Описание", "Ссылка на статью"];
  const rows = events.map((evt) => [
    new Date(evt.date).toLocaleDateString("ru-RU"),
    evt.titleRu,
    TAX_LABELS[evt.taxType] ?? evt.taxType,
    EVENT_TYPE_LABELS[evt.eventType] ?? evt.eventType,
    evt.descRu.replace(/\n/g, " "),
    evt.articleRef ?? "",
  ]);

  const csv = [
    "\uFEFF" + headers.map(escapeCsvCell).join(","), // BOM for Excel UTF-8
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\r\n");

  const filename = month
    ? `trek-calendar-${year}-${String(month).padStart(2, "0")}.csv`
    : `trek-calendar-${year}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
