import { getTranslations, setRequestLocale } from "next-intl/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  FileText,
  CreditCard,
  FileCheck,
  ExternalLink,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  getTitleByLocale,
  getDescByLocale,
  TAX_TYPE_COLORS,
  getDaysUntil,
  getUrgencyLevel,
  formatDate,
} from "@/lib/utils";

async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as never, sessionOptions);
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("event");
  const tTax = await getTranslations("tax_types");
  const tCal = await getTranslations("calendar");

  const session = await getSession();
  let user = null;
  if (session.userId) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  const event = await prisma.taxEvent.findUnique({
    where: { id, isPublished: true },
  });

  if (!event) notFound();

  const days = getDaysUntil(event.date);
  const urgency = getUrgencyLevel(days);

  const urgencyStyles = {
    overdue: "border-red-300 bg-red-50 dark:bg-red-950/30",
    urgent: "border-orange-300 bg-orange-50 dark:bg-orange-950/30",
    warning: "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30",
    ok: "border-green-300 bg-green-50 dark:bg-green-950/30",
  };

  const urgencyText = {
    overdue: t("status_overdue"),
    urgent: t("status_urgent", { days }),
    warning: t("status_warning", { days }),
    ok: t("status_ok", { days }),
  };

  const eventTypeLabel = {
    REPORT: tCal("event_report"),
    PAYMENT: tCal("event_payment"),
    BOTH: tCal("event_both"),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 max-w-2xl py-8">
        {/* Back */}
        <Link href="/calendar">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
        </Link>

        {/* Urgency banner */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${urgencyStyles[urgency]}`}
        >
          {urgency === "overdue" || urgency === "urgent" ? (
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          ) : (
            <Clock className="h-5 w-5 text-yellow-500 shrink-0" />
          )}
          <div>
            <p className="font-semibold text-sm">{urgencyText[urgency]}</p>
            <p className="text-sm text-muted-foreground">
              {tCal("deadline")}:{" "}
              <span className="font-medium text-foreground">
                {formatDate(event.date, locale)}
              </span>
            </p>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {/* Tax type + event type */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${TAX_TYPE_COLORS[event.taxType]}`}
            >
              {tTax(event.taxType)}
            </span>
            <Badge variant="outline" className="gap-1">
              {event.eventType === "REPORT" ? (
                <FileText className="h-3 w-3" />
              ) : event.eventType === "PAYMENT" ? (
                <CreditCard className="h-3 w-3" />
              ) : (
                <FileCheck className="h-3 w-3" />
              )}
              {eventTypeLabel[event.eventType as keyof typeof eventTypeLabel]}
            </Badge>
            {event.isPostponed && (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t("postponed_badge")}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4">
            {getTitleByLocale(event, locale)}
          </h1>

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {tCal("deadline")}: <span className="text-foreground font-medium">{formatDate(event.date, locale)}</span>
            </span>
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed mb-6">
            <p>{getDescByLocale(event, locale)}</p>
          </div>

          {/* Postponement info */}
          {event.isPostponed && event.originalDate && (
            <div className="rounded-lg bg-muted p-4 mb-4 text-sm">
              <p className="font-medium mb-1">{t("postponed_from")}: {formatDate(event.originalDate, locale)}</p>
              {event.postponeReasonRu && locale === "ru" && (
                <p className="text-muted-foreground">{t("postpone_reason")}: {event.postponeReasonRu}</p>
              )}
              {event.postponeReasonEn && locale === "en" && (
                <p className="text-muted-foreground">{t("postpone_reason")}: {event.postponeReasonEn}</p>
              )}
            </div>
          )}

          {/* Legal reference */}
          {event.articleRef && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-1">
                {t("article_ref")}
              </p>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{event.articleRef}</span>
                {event.articleUrl && (
                  <a
                    href={event.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto"
                  >
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t("open")}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Link href="/calendar">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("to_calendar")}
            </Button>
          </Link>
          <Link
            href={`/calendar?year=${new Date(event.date).getFullYear()}&month=${new Date(event.date).getMonth() + 1}`}
          >
            <Button variant="ghost" className="gap-2">
              <Calendar className="h-4 w-4" />
              {`${new Date(event.date).toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", { month: "long" })} ${new Date(event.date).getFullYear()}`}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
