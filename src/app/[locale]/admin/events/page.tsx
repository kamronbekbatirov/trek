import { getTranslations, setRequestLocale } from "next-intl/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { AdminEventsList } from "@/components/admin/events-list";

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export default async function AdminEventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string; month?: string; published?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
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

  const where: Record<string, unknown> = {};
  if (sp.year) where.year = parseInt(sp.year);
  if (sp.month) where.month = parseInt(sp.month);
  if (sp.published === "true") where.isPublished = true;
  if (sp.published === "false") where.isPublished = false;

  const events = await prisma.taxEvent.findMany({
    where,
    orderBy: [{ year: "asc" }, { month: "asc" }, { date: "asc" }],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 max-w-5xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex-1">{t("events")}</h1>
          <Link href="/admin/events/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("new_event")}
            </Button>
          </Link>
        </div>

        <AdminEventsList events={events} locale={locale} />
      </main>
    </div>
  );
}
