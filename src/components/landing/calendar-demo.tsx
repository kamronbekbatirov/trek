"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export interface PreviewEvent {
  id: string;
  date: string;
  taxType: string;
  eventType: string;
  titleRu: string;
  titleEn: string;
  titleUz: string;
  titleUzc: string;
  orgTypes: string[];
  taxRegimes: string[];
}

interface Props {
  initialEvents: PreviewEvent[];
  initialYear: number;
  initialMonth: number;
}

const TAX_DOT: Record<string, string> = {
  VAT: "bg-blue-500",
  PERSONAL_IT: "bg-green-500",
  PROFIT: "bg-purple-500",
  PROPERTY: "bg-orange-500",
  LAND: "bg-yellow-500",
  WATER: "bg-cyan-500",
  EXCISE: "bg-red-500",
  SOCIAL: "bg-teal-500",
  INPS: "bg-emerald-500",
  TURNOVER: "bg-indigo-500",
  RENT: "bg-pink-500",
  FEES: "bg-amber-500",
  OTHER: "bg-slate-400",
};

const TAX_PILL: Record<string, string> = {
  VAT: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  PERSONAL_IT: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  PROFIT: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  PROPERTY: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  LAND: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
  WATER: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
  EXCISE: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  SOCIAL: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  INPS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  TURNOVER: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  RENT: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200",
  FEES: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  OTHER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function filterEvents(events: PreviewEvent[], orgType: string, taxRegime: string) {
  return events.filter((e) => {
    const orgMatch = e.orgTypes.length === 0 || e.orgTypes.includes(orgType);
    const regimeMatch = !taxRegime || e.taxRegimes.length === 0 || e.taxRegimes.includes(taxRegime);
    return orgMatch && regimeMatch;
  });
}

export function LandingCalendarDemo({ initialEvents, initialYear, initialMonth }: Props) {
  const t = useTranslations("landing");
  const tTax = useTranslations("tax_types");
  const tCal = useTranslations("calendar");
  const tMonths = useTranslations("months");
  const tWd = useTranslations("weekdays");
  const locale = useLocale();

  const getTitle = (e: PreviewEvent) => {
    switch (locale) {
      case "en": return e.titleEn || e.titleRu;
      case "uz": return e.titleUz || e.titleRu;
      case "uzc": return e.titleUzc || e.titleRu;
      default: return e.titleRu;
    }
  };
  const [orgType, setOrgType] = useState("LLC");
  const [taxRegime, setTaxRegime] = useState("VAT");
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [events, setEvents] = useState<PreviewEvent[]>(initialEvents);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const ORG_OPTIONS = [
    { value: "LLC", label: t("org_llc_ao") },
    { value: "IE", label: t("org_ie_short") },
    { value: "SELF_EMPLOYED", label: t("org_self_short") },
    { value: "FARM", label: t("org_farm_short") },
  ];
  const REGIME_OPTIONS = [
    { value: "VAT", label: t("regime_vat_short") },
    { value: "TURNOVER", label: t("regime_turnover_short") },
  ];
  const WEEK_DAYS = [tWd("mon"), tWd("tue"), tWd("wed"), tWd("thu"), tWd("fri"), tWd("sat"), tWd("sun")];

  const showRegime = orgType !== "SELF_EMPLOYED" && orgType !== "FARM";
  const effectiveTaxRegime = showRegime ? taxRegime : "";
  const filtered = filterEvents(events, orgType, effectiveTaxRegime);

  // Build grid
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
  const trailingCells = totalCells - startDow - daysInMonth;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const eventsByDay: Record<number, PreviewEvent[]> = {};
  for (const e of filtered) {
    const d = new Date(e.date).getDate();
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(e);
  }

  const selectedDayEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];

  const navigateMonth = useCallback(async (newYear: number, newMonth: number) => {
    setLoading(true);
    setSelectedDay(null);
    try {
      const res = await fetch(`/api/events/preview?year=${newYear}&month=${newMonth}`);
      const data = await res.json();
      setEvents(data);
      setYear(newYear);
      setMonth(newMonth);
    } finally {
      setLoading(false);
    }
  }, []);

  const prevMonth = () => month === 1 ? navigateMonth(year - 1, 12) : navigateMonth(year, month - 1);
  const nextMonth = () => month === 12 ? navigateMonth(year + 1, 1) : navigateMonth(year, month + 1);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header label */}
      <div className="text-center mb-5">
        <p className="text-sm font-medium text-muted-foreground">
          {t("demo_hint")}
        </p>
      </div>

      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
        {/* Filter bar */}
        <div className="px-4 py-3 border-b bg-muted/20 flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Org type */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium shrink-0">{t("filter_type_label")}</span>
            {ORG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setOrgType(opt.value); setSelectedDay(null); }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                  ${orgType === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/50 text-foreground"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Tax regime */}
          {showRegime && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium shrink-0">{t("filter_regime_label")}</span>
              {REGIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTaxRegime(opt.value); setSelectedDay(null); }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                    ${taxRegime === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary/50 text-foreground"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row">
          {/* Calendar side */}
          <div className="flex-1 min-w-0">
            {/* Month nav */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b">
              <button
                onClick={prevMonth}
                disabled={loading}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {tMonths(String(month))} {year}
                </span>
                <span className={`text-xs rounded-full px-2 py-0.5 font-medium
                  ${loading ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  {loading ? "…" : filtered.length}
                </span>
              </div>
              <button
                onClick={nextMonth}
                disabled={loading}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Grid */}
            <div className={`p-3 transition-opacity ${loading ? "opacity-40 pointer-events-none" : ""}`}>
              {/* Weekdays */}
              <div className="grid grid-cols-7 mb-1">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1 uppercase tracking-widest">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: startDow }).map((_, i) => (
                  <div key={`b-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dayEvts = eventsByDay[day] ?? [];
                  const isToday = day === todayDate;
                  const isPast = new Date(year, month - 1, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isSelected = selectedDay === day;
                  const hasEvts = dayEvts.length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => hasEvts ? setSelectedDay(isSelected ? null : day) : undefined}
                      className={`relative flex flex-col items-center pt-1 pb-1.5 rounded-lg text-[12px] font-medium transition-all
                        ${hasEvts ? "cursor-pointer" : "cursor-default"}
                        ${isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : isToday
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : hasEvts
                          ? "hover:bg-accent/40"
                          : isPast
                          ? "text-muted-foreground/40"
                          : ""
                        }`}
                    >
                      <span>{day}</span>
                      {hasEvts && (
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[28px]">
                          {dayEvts.slice(0, 3).map((e, i) => (
                            <span
                              key={i}
                              className={`w-1 h-1 rounded-full shrink-0
                                ${isSelected ? "bg-primary-foreground/70" : TAX_DOT[e.taxType] ?? "bg-slate-400"}`}
                            />
                          ))}
                          {dayEvts.length > 3 && !isSelected && (
                            <span className="text-[8px] text-muted-foreground leading-none">+{dayEvts.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}

                {Array.from({ length: trailingCells }).map((_, i) => (
                  <div key={`t-${i}`} />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="px-3 pb-3 flex flex-wrap gap-x-2.5 gap-y-1">
              {[...new Set(filtered.map((e) => e.taxType))].map((type) => (
                <span key={type} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TAX_DOT[type] ?? "bg-slate-400"}`} />
                  {tTax(type)}
                </span>
              ))}
            </div>
          </div>

          {/* Event panel (desktop: right column) */}
          <div className="md:w-64 md:border-l border-t md:border-t-0 flex flex-col">
            {selectedDay && selectedDayEvents.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                  <span className="text-sm font-semibold">
                    {selectedDay} {tMonths(String(month))}
                  </span>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto divide-y max-h-[280px] md:max-h-none">
                  {selectedDayEvents.map((e) => (
                    <div key={e.id} className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${TAX_DOT[e.taxType] ?? "bg-slate-400"}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug">{getTitle(e)}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAX_PILL[e.taxType] ?? "bg-gray-100 text-gray-700"}`}>
                              {tTax(e.taxType)}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                              {e.eventType === "REPORT" ? tCal("event_report")
                                : e.eventType === "PAYMENT" ? tCal("event_payment")
                                : tCal("event_both")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center gap-2">
                <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {filtered.length === 0
                    ? t("no_events_profile")
                    : t("click_dots_hint")}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="border-t px-4 py-3 mt-auto">
              <Link href="/auth/register">
                <button className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-foreground/15 hover:bg-foreground hover:text-background transition-colors">
                  {t("create_free_account")} →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
