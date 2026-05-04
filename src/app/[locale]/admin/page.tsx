import { getTranslations, setRequestLocale } from "next-intl/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, CreditCard, TrendingUp, Plus, AlertCircle } from "lucide-react";

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const session = await getSession();
  if (!session.userId || session.role !== "ADMIN") {
    redirect({ href: "/dashboard", locale });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  // Stats
  const [totalUsers, proUsers, totalEvents, draftEvents] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { plan: "PRO", status: "ACTIVE" } }),
    prisma.taxEvent.count({ where: { isPublished: true } }),
    prisma.taxEvent.count({ where: { isDraft: true } }),
  ]);

  const stats = [
    { label: t("total_users"), value: totalUsers, icon: Users, color: "text-blue-500" },
    { label: t("pro_users"), value: proUsers, icon: TrendingUp, color: "text-purple-500" },
    { label: t("total_events"), value: totalEvents, icon: CalendarDays, color: "text-green-500" },
    { label: "Черновиков", value: draftEvents, icon: AlertCircle, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 max-w-5xl py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t("events")}</h2>
              <Link href="/admin/events/new">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t("new_event")}
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Управление налоговыми событиями. Создание, редактирование, публикация.
            </p>
            <Link href="/admin/events">
              <Button variant="outline" className="w-full">
                Все события
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">{t("users")}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Просмотр пользователей, фильтрация по тарифу и типу организации.
            </p>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full">
                Все пользователи
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent events */}
        <RecentEvents locale={locale} />
      </main>
    </div>
  );
}

async function RecentEvents({ locale }: { locale: string }) {
  const events = await prisma.taxEvent.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Последние события</h2>
      </div>
      <div className="divide-y">
        {events.map((evt) => (
          <div key={evt.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-sm">{evt.titleRu}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(evt.date).toLocaleDateString("ru-RU")} • {evt.taxType}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  evt.isPublished
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {evt.isPublished ? "Опубликовано" : "Черновик"}
              </span>
              <Link href={`/admin/events/${evt.id}`}>
                <Button variant="ghost" size="sm">
                  Ред.
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
