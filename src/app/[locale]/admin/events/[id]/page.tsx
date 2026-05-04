import { getTranslations, setRequestLocale } from "next-intl/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AdminEventForm } from "@/components/admin/event-form";

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
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

  const isNew = id === "new";
  let event = null;

  if (!isNew) {
    event = await prisma.taxEvent.findUnique({ where: { id } });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 max-w-4xl py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/events">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isNew ? t("new_event") : t("edit_event")}
          </h1>
        </div>

        <AdminEventForm event={event} locale={locale} />
      </main>
    </div>
  );
}
