import { getTranslations, setRequestLocale } from "next-intl/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { buildProfileFilter, buildMultiOrgFilter } from "@/lib/event-filter";
import { Header } from "@/components/layout/header";
import { CalendarView } from "@/components/calendar/calendar-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Налоговый календарь",
};

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export interface UserProfile {
  orgType: string | null;
  taxRegime: string | null;
  hasEmployees?: boolean | null;
  assets?: string[];
  specialActivities?: string[];
  pensionFund?: string[];
  onboardingDone: boolean;
  isPro?: boolean;
}

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string; month?: string; taxType?: string; orgId?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations("calendar");
  const sp = await searchParams;

  const now = new Date();
  const year = parseInt(sp.year ?? String(now.getFullYear()));
  const month = parseInt(sp.month ?? String(now.getMonth() + 1));
  const taxType = sp.taxType ?? "ALL";
  const orgId = sp.orgId ?? null;

  const session = await getSession();

  let user = null;
  let userProfile: UserProfile = { orgType: null, taxRegime: null, onboardingDone: false };
  let accountantOrgs: { id: string; name: string; orgType: string; taxRegime: string | null; hasEmployees: boolean | null; assets: string[]; specialActivities: string[]; pensionFund: string[] }[] = [];

  if (session.userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        orgType: true,
        taxRegime: true,
        hasEmployees: true,
        assets: true,
        specialActivities: true,
        pensionFund: true,
        onboardingDone: true,
        subscription: { select: { plan: true, status: true } },
        accountantOrgs: { select: { id: true, name: true, orgType: true, taxRegime: true, hasEmployees: true, assets: true, specialActivities: true, pensionFund: true } },
      },
    });
    if (dbUser) {
      // Onboarding gate — check DB directly
      if (!dbUser.onboardingDone) {
        const { redirect } = await import("@/i18n/navigation");
        redirect({ href: "/onboarding", locale });
        return null;
      }
      const isPro = dbUser.subscription?.plan === "PRO" && dbUser.subscription?.status === "ACTIVE";
      user = { email: dbUser.email, name: dbUser.name, role: String(dbUser.role) };
      userProfile = {
        orgType: dbUser.orgType,
        taxRegime: dbUser.taxRegime,
        hasEmployees: dbUser.hasEmployees,
        assets: dbUser.assets,
        specialActivities: dbUser.specialActivities,
        pensionFund: dbUser.pensionFund,
        onboardingDone: dbUser.onboardingDone,
        isPro,
      };
      accountantOrgs = dbUser.accountantOrgs.map((o) => ({ ...o, orgType: String(o.orgType), taxRegime: o.taxRegime ? String(o.taxRegime) : null }));
    }
  }

  // Build WHERE clause
  const isAccountant = userProfile.orgType === "ACCOUNTANT";
  let eventFilter;
  if (isAccountant) {
    if (orgId) {
      // Filter by specific org
      const selectedOrg = accountantOrgs.find((o) => o.id === orgId);
      eventFilter = selectedOrg
        ? buildProfileFilter({ ...selectedOrg, onboardingDone: true })
        : { id: "never-match" };
    } else {
      eventFilter = buildMultiOrgFilter(accountantOrgs);
    }
  } else {
    eventFilter = buildProfileFilter(userProfile);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { isPublished: true, year, month, ...eventFilter };

  if (taxType !== "ALL") {
    where.taxType = taxType;
  }

  const events = await prisma.taxEvent.findMany({
    where,
    orderBy: { date: "asc" },
  });

  // Fetch event statuses for the current user
  let eventStatuses: Record<string, boolean> = {};
  if (session.userId && events.length > 0) {
    const statuses = await prisma.eventStatus.findMany({
      where: {
        userId: session.userId,
        eventId: { in: events.map((e) => e.id) },
      },
      select: { eventId: true, isDone: true },
    });
    eventStatuses = Object.fromEntries(statuses.map((s) => [s.eventId, s.isDone]));
  }

  // For accountant mode: compute which orgs each event belongs to
  const eventOrgMap: Record<string, string[]> = {};
  if (isAccountant && events.length > 0) {
    if (orgId) {
      // All shown events belong to the selected org
      for (const evt of events) eventOrgMap[evt.id] = [orgId];
    } else if (accountantOrgs.length > 0) {
      const eventIds = events.map((e) => e.id);
      for (const org of accountantOrgs) {
        const orgFilter = buildProfileFilter({ ...org, onboardingDone: true });
        const matched = await prisma.taxEvent.findMany({
          where: { id: { in: eventIds }, ...orgFilter },
          select: { id: true },
        });
        for (const { id } of matched) {
          if (!eventOrgMap[id]) eventOrgMap[id] = [];
          eventOrgMap[id].push(org.id);
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user ? { ...user, isPro: userProfile.isPro } : null} />
      <main className="container mx-auto px-4 max-w-5xl py-8">
        <CalendarView
          events={events}
          locale={locale}
          year={year}
          month={month}
          taxType={taxType}
          userProfile={userProfile}
          eventStatuses={eventStatuses}
          isLoggedIn={!!session.userId}
          isPro={userProfile.isPro}
          accountantOrgs={isAccountant ? accountantOrgs : undefined}
          selectedOrgId={orgId}
          eventOrgMap={isAccountant ? eventOrgMap : undefined}
        />
      </main>
    </div>
  );
}
