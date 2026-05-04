"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  Check,
} from "lucide-react";
import { getDaysUntil, getUrgencyLevel, getTitleByLocale, TAX_TYPE_COLORS } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface TaxEvent {
  id: string;
  date: Date | string;
  taxType: string;
  titleRu: string;
  titleEn: string;
  titleUz: string;
  titleUzc: string;
}

interface DashboardEventsProps {
  upcomingEvents: TaxEvent[];
  overdueEvents: TaxEvent[];
  initialStatuses: Record<string, boolean>;
  locale: string;
}

export function DashboardEvents({
  upcomingEvents,
  overdueEvents,
  initialStatuses,
  locale,
}: DashboardEventsProps) {
  const t = useTranslations("dashboard");
  const tTax = useTranslations("tax_types");
  const tStatus = useTranslations("status");

  const [doneIds, setDoneIds] = useState<Set<string>>(
    new Set(Object.entries(initialStatuses).filter(([, v]) => v).map(([k]) => k))
  );
  const [pending, setPending] = useState<Set<string>>(new Set());

  const toggleDone = async (eventId: string) => {
    if (pending.has(eventId)) return;
    const newDone = !doneIds.has(eventId);
    setPending((p) => new Set(p).add(eventId));
    // Optimistic
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (newDone) next.add(eventId);
      else next.delete(eventId);
      return next;
    });
    try {
      await fetch("/api/events/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, isDone: newDone }),
      });
    } catch {
      // Revert on error
      setDoneIds((prev) => {
        const next = new Set(prev);
        if (newDone) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
    } finally {
      setPending((p) => { const next = new Set(p); next.delete(eventId); return next; });
    }
  };

  const urgencyIcon = {
    overdue: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />,
    urgent: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />,
    warning: <Clock className="h-4 w-4 text-yellow-500 shrink-0" />,
    ok: <CalendarCheck className="h-4 w-4 text-green-500 shrink-0" />,
  };

  const urgencyBadge = {
    overdue: "danger" as const,
    urgent: "danger" as const,
    warning: "warning" as const,
    ok: "success" as const,
  };

  // Filter out done events from overdue
  const visibleOverdue = overdueEvents.filter((e) => !doneIds.has(e.id));
  const visibleUpcoming = upcomingEvents;

  return (
    <>
      {/* Overdue */}
      {visibleOverdue.length > 0 && (
        <div className="mb-6">
          <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="font-semibold text-red-700 dark:text-red-400 text-sm">
                {t("overdue_title")}
              </span>
            </div>
            <div className="space-y-2">
              {visibleOverdue.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 border-t border-red-200 dark:border-red-800 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getTitleByLocale(event, locale)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                      onClick={() => toggleDone(event.id)}
                      title={t("mark_done")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">{t("upcoming")}</h2>
          <Link href="/calendar">
            <Button variant="ghost" size="sm" className="gap-1">
              {t("view_all")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {visibleUpcoming.length === 0 ? (
          <div className="rounded-xl border bg-muted/30 p-8 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <p>{t("no_upcoming")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleUpcoming.map((event) => {
              const days = getDaysUntil(event.date);
              const urgency = getUrgencyLevel(days);
              const isDone = doneIds.has(event.id);

              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border bg-card transition-all ${
                    isDone ? "opacity-50" : "hover:shadow-md"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    urgencyIcon[urgency]
                  )}

                  <Link href={`/events/${event.id}`} className="flex-1 min-w-0 group cursor-pointer">
                    <p className={`font-medium text-sm truncate ${isDone ? "line-through text-muted-foreground" : ""}`}>
                      {getTitleByLocale(event, locale)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAX_TYPE_COLORS[event.taxType]}`}>
                        {tTax(event.taxType)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString(
                          locale === "en" ? "en-US" : "ru-RU",
                          { day: "numeric", month: "short" }
                        )}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 shrink-0">
                    {!isDone && (
                      <Badge variant={urgencyBadge[urgency]}>
                        {days === 0
                          ? t("today")
                          : days === 1
                          ? t("tomorrow")
                          : tStatus("days_left", { n: days })}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        isDone
                          ? "text-green-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          : "text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                      }`}
                      onClick={() => toggleDone(event.id)}
                      title={isDone ? t("mark_undone") : t("mark_done")}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
