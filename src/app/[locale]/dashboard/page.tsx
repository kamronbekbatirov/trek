import { getTranslations, setRequestLocale } from "next-intl/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { redirect as nextRedirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Bot, Crown } from "lucide-react";
import { buildProfileFilter, buildMultiOrgFilter } from "@/lib/event-filter";
import { DashboardEvents } from "@/components/dashboard/dashboard-events";

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const tStatus = await getTranslations("status");

  const session = await getSession();
  if (!session.userId) {
    redirect({ href: "/auth/login", locale });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { subscription: true, accountantOrgs: true },
  });

  if (!user) {
    // Stale session — user ID in cookie no longer exists in DB.
    // Redirect to the logout Route Handler which clears the cookie then
    // sends to login. The middleware skips /api/ paths so no redirect loop.
    nextRedirect(`/api/auth/logout?locale=${locale}`);
  }

  // Onboarding gate — check DB directly (more reliable than session cookie)
  if (!user.onboardingDone) {
    redirect({ href: "/onboarding", locale });
    return null;
  }

  // Build profile-based filter (accountants use union of all their orgs)
  const isAccountant = user.orgType === "ACCOUNTANT";
  const profileFilter = isAccountant
    ? buildMultiOrgFilter(user.accountantOrgs)
    : buildProfileFilter({
        orgType: user.orgType,
        taxRegime: user.taxRegime,
        hasEmployees: user.hasEmployees,
        assets: user.assets,
        specialActivities: user.specialActivities,
        pensionFund: user.pensionFund,
        onboardingDone: user.onboardingDone,
      });

  // Get upcoming events (next 30 days)
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcomingEvents = await prisma.taxEvent.findMany({
    where: { isPublished: true, date: { gte: now, lte: in30 }, ...profileFilter },
    orderBy: { date: "asc" },
    take: 10,
  });

  // Get overdue events (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const overdueEvents = await prisma.taxEvent.findMany({
    where: { isPublished: true, date: { gte: sevenDaysAgo, lt: now }, ...profileFilter },
    orderBy: { date: "desc" },
    take: 3,
  });

  // Load event completion statuses for this user
  const allEventIds = [...upcomingEvents, ...overdueEvents].map((e) => e.id);
  const statusRows = await prisma.eventStatus.findMany({
    where: { userId: user.id, eventId: { in: allEventIds } },
    select: { eventId: true, isDone: true },
  });
  const initialStatuses = Object.fromEntries(statusRows.map((s) => [s.eventId, s.isDone]));

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{ name: user.name, email: user.email, role: user.role, isPro: user.subscription?.plan === "PRO" && user.subscription?.status === "ACTIVE" }}
      />

      <main className="container mx-auto px-4 max-w-4xl py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {t("title")}
            {user.name && (
              <span className="text-muted-foreground font-normal">
                , {user.name}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString(
              locale === "en" ? "en-US" : "ru-RU",
              { weekday: "long", day: "numeric", month: "long", year: "numeric" }
            )}
          </p>
        </div>

        {/* Accountant with no orgs: prompt to add org in settings */}
        {isAccountant && user.accountantOrgs.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-bold text-lg mb-2">{tStatus("accountant_mode")}</h2>
            <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
              {tStatus("accountant_mode_desc")}
            </p>
            <Link href="/settings">
              <Button>{tStatus("add_org_btn")}</Button>
            </Link>
          </div>
        )}

        {(!isAccountant || user.accountantOrgs.length > 0) && (
          <DashboardEvents
            upcomingEvents={upcomingEvents}
            overdueEvents={overdueEvents}
            initialStatuses={initialStatuses}
            locale={locale}
          />
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/calendar">
            <div className="rounded-xl border bg-card p-6 hover:shadow-md transition-all cursor-pointer group">
              <Calendar className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">{t("calendar_card_title")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("calendar_card_desc")}
              </p>
            </div>
          </Link>
          <Link href="/chat">
            <div className={`rounded-xl border p-6 hover:shadow-md transition-all cursor-pointer group
              ${user.subscription?.plan === "PRO"
                ? "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800"
                : "bg-card"}`}>
              {user.subscription?.plan === "PRO"
                ? <Bot className="h-8 w-8 text-purple-500 mb-3" />
                : <Crown className="h-8 w-8 text-muted-foreground mb-3" />}
              <h3 className="font-semibold">{t("ai_card_title")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {user.subscription?.plan === "PRO" ? t("ai_pro_desc") : t("ai_free_desc")}
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
