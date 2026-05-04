"use client";

import { useState, useCallback } from "react";
import { TaxProfileDialog } from "./tax-profile-dialog";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  FileText,
  CreditCard,
  FileCheck,
  X,
  CalendarDays,
  CheckCircle2,
  Circle,
  Download,
  TableIcon,
  FolderOpen,
  Info,
  Settings2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  getTitleByLocale,
  TAX_TYPE_COLORS,
  getDaysUntil,
  getUrgencyLevel,
} from "@/lib/utils";
import { OrgManagerSheet } from "@/components/accountant/org-manager-sheet";

interface TaxEvent {
  id: string;
  date: Date | string;
  taxType: string;
  eventType: string;
  titleRu: string;
  titleEn: string;
  titleUz: string;
  titleUzc: string;
  articleRef?: string | null;
  isPostponed?: boolean;
}

interface UserProfile {
  orgType: string | null;
  taxRegime: string | null;
  onboardingDone: boolean;
}

interface AccountantOrg {
  id: string;
  name: string;
}

interface CalendarViewProps {
  events: TaxEvent[];
  locale: string;
  year: number;
  month: number;
  taxType: string;
  userProfile?: UserProfile;
  eventStatuses?: Record<string, boolean>;
  isLoggedIn?: boolean;
  isPro?: boolean;
  accountantOrgs?: AccountantOrg[];
  selectedOrgId?: string | null;
  eventOrgMap?: Record<string, string[]>;
}

// 8-color palette for organizations
const ORG_PALETTE = [
  { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",   header: "text-blue-600 dark:text-blue-400",   border: "border-l-blue-500"   },
  { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300", header: "text-orange-600 dark:text-orange-400", border: "border-l-orange-500" },
  { dot: "bg-green-500",  badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",  header: "text-green-600 dark:text-green-400",  border: "border-l-green-500"  },
  { dot: "bg-violet-500", badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300", header: "text-violet-600 dark:text-violet-400", border: "border-l-violet-500" },
  { dot: "bg-rose-500",   badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",   header: "text-rose-600 dark:text-rose-400",   border: "border-l-rose-500"   },
  { dot: "bg-teal-500",   badge: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",   header: "text-teal-600 dark:text-teal-400",   border: "border-l-teal-500"   },
  { dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",  header: "text-amber-600 dark:text-amber-400",  border: "border-l-amber-500"  },
  { dot: "bg-pink-500",   badge: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",   header: "text-pink-600 dark:text-pink-400",   border: "border-l-pink-500"   },
];

const ALL_TAX_TYPES = [
  "ALL", "VAT", "PERSONAL_IT", "PROFIT", "PROPERTY",
  "LAND", "WATER", "EXCISE", "SOCIAL", "INPS",
  "TURNOVER", "RENT", "FEES", "OTHER",
];

const TAX_TYPE_DOT: Record<string, string> = {
  VAT: "bg-blue-500",
  PERSONAL_IT: "bg-green-500",
  PROFIT: "bg-purple-500",
  PROPERTY: "bg-orange-500",
  LAND: "bg-yellow-600",
  WATER: "bg-cyan-500",
  EXCISE: "bg-red-500",
  SOCIAL: "bg-teal-500",
  INPS: "bg-emerald-500",
  TURNOVER: "bg-indigo-500",
  RENT: "bg-pink-500",
  FEES: "bg-amber-500",
  OTHER: "bg-slate-400",
};

const EVENT_TYPE_ICON = {
  REPORT: <FileText className="h-3.5 w-3.5" />,
  PAYMENT: <CreditCard className="h-3.5 w-3.5" />,
  BOTH: <FileCheck className="h-3.5 w-3.5" />,
};

function OrgSelectorInline({ orgs, selectedOrgId, pathname, year, month, taxType }: {
  orgs: { id: string; name: string }[];
  selectedOrgId?: string | null;
  pathname: string;
  year: number;
  month: number;
  taxType: string;
}) {
  const tAc = useTranslations("accountant");
  const router = useRouter();

  const handleChange = (value: string) => {
    const p: Record<string, string> = { year: String(year), month: String(month), taxType };
    if (value !== "all") p.orgId = value;
    router.push(`${pathname}?${new URLSearchParams(p).toString()}`);
  };

  return (
    <Select value={selectedOrgId ?? "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{tAc("all_orgs")}</SelectItem>
        {orgs.map((org) => (
          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function urgencyCls(days: number): string {
  if (days <= 0) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  if (days <= 3) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
  if (days <= 7) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
}

// ── Event panel (used on both desktop sidebar and mobile sheet) ──────────────
function EventPanel({
  day,
  monthLabel,
  events,
  locale,
  tTax,
  tCal,
  onClose,
  eventStatuses,
  isLoggedIn,
  onToggleStatus,
  eventOrgMap,
  orgColorIdx,
  orgNameMap,
}: {
  day: number | null;
  monthLabel: string;
  events: TaxEvent[];
  locale: string;
  tTax: (k: string) => string;
  tCal: (k: string) => string;
  onClose?: () => void;
  eventStatuses: Record<string, boolean>;
  isLoggedIn: boolean;
  onToggleStatus: (eventId: string, isDone: boolean) => void;
  eventOrgMap?: Record<string, string[]>;
  orgColorIdx?: Record<string, number>;
  orgNameMap?: Record<string, string>;
}) {
  const tStatus = useTranslations("status");

  if (!day || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-10 text-center gap-3">
        <CalendarDays className="h-10 w-10 text-muted-foreground/20" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">{tStatus("click_day")}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">
            {tStatus("dots_hint")}
          </p>
        </div>
      </div>
    );
  }

  const countLabel = events.length === 1
    ? tStatus("events_count_one")
    : events.length <= 4
    ? tStatus("events_count_few")
    : tStatus("events_count_many");

  return (
    <>
      {/* Panel header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between shrink-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">
            {day} {monthLabel}
          </span>
          <span className="text-xs text-muted-foreground">
            {events.length} {countLabel}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto">
        {(() => {
          // Helper to render a single event row
          const renderEvent = (evt: TaxEvent, orgDotClass?: string) => {
            const days = getDaysUntil(evt.date);
            const urgText = days < 0 ? tStatus("overdue")
              : days === 0 ? tStatus("today")
              : days === 1 ? tStatus("tomorrow")
              : tStatus("days_left", { n: days });
            const urgCls = urgencyCls(days);
            const title = getTitleByLocale(evt, locale);
            const isDone = eventStatuses[evt.id] === true;

            return (
              <div key={evt.id} className={`px-4 py-3.5 flex items-start gap-3 border-b last:border-b-0 transition-colors ${isDone ? "bg-green-50/50 dark:bg-green-950/10" : "hover:bg-accent/20"}`}>
                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${isDone ? "bg-green-500" : (orgDotClass ?? TAX_TYPE_DOT[evt.taxType] ?? "bg-slate-400")}`} />
                <div className="flex-1 min-w-0">
                  <Link href={`/events/${evt.id}`}>
                    <p className={`text-sm font-medium leading-snug hover:underline ${isDone ? "line-through text-muted-foreground" : ""}`}>{title}</p>
                  </Link>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3" />{tStatus("done")}
                      </span>
                    ) : (
                      <>
                        <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium ${TAX_TYPE_COLORS[evt.taxType] ?? "bg-gray-100 text-gray-700"}`}>{tTax(evt.taxType)}</span>
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                          {EVENT_TYPE_ICON[evt.eventType as keyof typeof EVENT_TYPE_ICON]}
                          {evt.eventType === "REPORT" ? tCal("event_report") : evt.eventType === "PAYMENT" ? tCal("event_payment") : tCal("event_both")}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${urgCls}`}>{urgText}</span>
                      </>
                    )}
                  </div>
                  {isLoggedIn && (
                    <button
                      onClick={() => onToggleStatus(evt.id, !isDone)}
                      className={`mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${isDone ? "text-muted-foreground hover:text-foreground" : "text-green-600 hover:text-green-700 dark:text-green-400"}`}
                    >
                      {isDone ? <><Circle className="h-3.5 w-3.5" />{tStatus("unmark")}</> : <><CheckCircle2 className="h-3.5 w-3.5" />{tStatus("mark_done")}</>}
                    </button>
                  )}
                </div>
              </div>
            );
          };

          // Accountant mode: group events by org
          if (eventOrgMap && orgColorIdx && orgNameMap && Object.keys(eventOrgMap).length > 0) {
            // Build org → events map (each event appears under each matching org)
            const orgEventsMap: Record<string, TaxEvent[]> = {};
            const untagged: TaxEvent[] = [];
            for (const evt of events) {
              const orgIds = eventOrgMap[evt.id] ?? [];
              if (orgIds.length === 0) {
                untagged.push(evt);
              } else {
                for (const orgId of orgIds) {
                  if (!orgEventsMap[orgId]) orgEventsMap[orgId] = [];
                  orgEventsMap[orgId].push(evt);
                }
              }
            }
            const orgOrder = Object.keys(orgNameMap).filter((id) => orgEventsMap[id]);
            return (
              <>
                {orgOrder.map((orgId) => {
                  const color = ORG_PALETTE[orgColorIdx[orgId] ?? 0];
                  return (
                    <div key={orgId}>
                      <div className={`px-4 py-2 flex items-center gap-2 bg-muted/30 border-b sticky top-0 z-10`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
                        <span className={`text-xs font-semibold ${color.header}`}>{orgNameMap[orgId]}</span>
                      </div>
                      {orgEventsMap[orgId].map((evt) => renderEvent(evt, color.dot))}
                    </div>
                  );
                })}
                {untagged.map((evt) => renderEvent(evt))}
              </>
            );
          }

          // Normal mode: flat list
          return events.map((evt) => renderEvent(evt));
        })()}
      </div>
    </>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function CalendarView({
  events,
  locale,
  year,
  month,
  taxType,
  userProfile,
  eventStatuses: initialStatuses = {},
  isLoggedIn = false,
  isPro = false,
  accountantOrgs,
  selectedOrgId,
  eventOrgMap = {},
}: CalendarViewProps) {
  const t = useTranslations("calendar");
  const tTax = useTranslations("tax_types");
  const tMonths = useTranslations("months");
  const tStatus = useTranslations("status");
  const tAuth = useTranslations("auth");
  const tWeekdays = useTranslations("weekdays");
  const tAc = useTranslations("accountant");
  const router = useRouter();
  const pathname = usePathname();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [statuses, setStatuses] = useState<Record<string, boolean>>(initialStatuses);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [orgManagerOpen, setOrgManagerOpen] = useState(false);

  // Assign a stable color index to each org
  const orgColorIdx: Record<string, number> = {};
  const orgNameMap: Record<string, string> = {};
  if (accountantOrgs) {
    accountantOrgs.forEach((org, i) => {
      orgColorIdx[org.id] = i % ORG_PALETTE.length;
      orgNameMap[org.id] = org.name;
    });
  }

  const handleToggleStatus = useCallback(async (eventId: string, isDone: boolean) => {
    // Optimistic update
    setStatuses((prev) => ({ ...prev, [eventId]: isDone }));
    try {
      await fetch("/api/events/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, isDone }),
      });
    } catch {
      // Revert on error
      setStatuses((prev) => ({ ...prev, [eventId]: !isDone }));
    }
  }, []);

  const buildParams = (overrides: Record<string, string | null | undefined>) => {
    const p: Record<string, string> = { year: String(year), month: String(month), taxType };
    if (selectedOrgId) p.orgId = selectedOrgId;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v == null) delete p[k];
      else p[k] = v;
    });
    return new URLSearchParams(p).toString();
  };

  const navigate = (newYear: number, newMonth: number) => {
    setSelectedDay(null);
    router.push(`${pathname}?${buildParams({ year: String(newYear), month: String(newMonth) })}`);
  };
  const setFilter = (newTaxType: string) => {
    router.push(`${pathname}?${buildParams({ taxType: newTaxType })}`);
  };
  const prevMonth = () => month === 1 ? navigate(year - 1, 12) : navigate(year, month - 1);
  const nextMonth = () => month === 12 ? navigate(year + 1, 1) : navigate(year, month + 1);
  const goToday = () => { const n = new Date(); navigate(n.getFullYear(), n.getMonth() + 1); };

  // Grid data
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
  const trailingCells = totalCells - startDow - daysInMonth;

  const eventsByDay: Record<number, TaxEvent[]> = {};
  events.forEach((evt) => {
    const d = new Date(evt.date).getDate();
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(evt);
  });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const weekDays = [
    tWeekdays("mon"), tWeekdays("tue"), tWeekdays("wed"),
    tWeekdays("thu"), tWeekdays("fri"), tWeekdays("sat"), tWeekdays("sun"),
  ];

  const orgLabelMap: Record<string, string> = {
    LLC: tAuth("org_llc"),
    JSC: tAuth("org_jsc"),
    IE: tAuth("org_ie"),
    SELF_EMPLOYED: tAuth("org_self"),
    FARM: tAuth("org_farm"),
  };
  const regimeLabelMap: Record<string, string> = {
    VAT: tAuth("regime_vat"),
    TURNOVER: tAuth("regime_turnover"),
    BOTH: tAuth("regime_both"),
  };

  const selectedDayEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : [];
  const monthLabel = tMonths(String(month));

  // Only show tax type filters that are actually present in the current events
  const presentTaxTypes = new Set(events.map((e) => e.taxType));
  const visibleTaxTypes = ALL_TAX_TYPES.filter((t) => t === "ALL" || presentTaxTypes.has(t));

  const isFiltered =
    userProfile?.onboardingDone &&
    userProfile.orgType &&
    userProfile.orgType !== "ACCOUNTANT";

  const isAccountant = userProfile?.orgType === "ACCOUNTANT";

  return (
    <div>
      {/* ── Accountant banner ── */}
      {isAccountant && (
        <>
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 mb-5 text-sm space-y-2.5">
            {/* Top row: mode label + org selector + settings */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{tStatus("accountant_mode")}</span>
              </div>
              <div className="flex items-center gap-2">
                {accountantOrgs && accountantOrgs.length > 1 && (
                  <OrgSelectorInline
                    orgs={accountantOrgs}
                    selectedOrgId={selectedOrgId}
                    pathname={pathname}
                    year={year}
                    month={month}
                    taxType={taxType}
                  />
                )}
                <button
                  onClick={() => setOrgManagerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                  title={tAc("my_organizations")}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  {tAc("manage_orgs")}
                </button>
              </div>
            </div>
            {/* Org color legend */}
            {accountantOrgs && accountantOrgs.length > 0 && !selectedOrgId && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {accountantOrgs.map((org) => {
                  const color = ORG_PALETTE[orgColorIdx[org.id] ?? 0];
                  return (
                    <span key={org.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`} />
                      {org.name}
                    </span>
                  );
                })}
              </div>
            )}
            {selectedOrgId && accountantOrgs && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-2 h-2 rounded-full shrink-0 ${ORG_PALETTE[orgColorIdx[selectedOrgId] ?? 0].dot}`} />
                {orgNameMap[selectedOrgId]}
              </div>
            )}
          </div>
          <OrgManagerSheet open={orgManagerOpen} onOpenChange={setOrgManagerOpen} isPro={isPro ?? false} />
        </>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          {isFiltered && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-xs text-muted-foreground">{tStatus("for_label")}</span>
              {userProfile?.orgType && (
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {orgLabelMap[userProfile.orgType] ?? userProfile.orgType}
                </span>
              )}
              {userProfile?.taxRegime && (
                <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {regimeLabelMap[userProfile.taxRegime] ?? userProfile.taxRegime}
                </span>
              )}
              <button
                onClick={() => setProfileDialogOpen(true)}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
              >
                {tStatus("change")}
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Export buttons — Pro only */}
          {isPro && (
            <div className="flex gap-1.5">
              <a
                href={`/api/export/ics?year=${year}&month=${month}`}
                download
                title="ICS / Google Calendar"
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                ICS
              </a>
              <a
                href={`/api/export/excel?year=${year}&month=${month}`}
                download
                title="Excel / CSV"
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              >
                <TableIcon className="h-3.5 w-3.5" />
                Excel
              </a>
            </div>
          )}
          <Select value={taxType} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-52 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibleTaxTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "ALL" ? t("filter_all") : tTax(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Month navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold capitalize">
            {monthLabel} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={goToday}>
            {t("today")}
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="month">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="month" className="gap-2 flex-1 sm:flex-none">
            <Calendar className="h-4 w-4" />
            {t("month_view")}
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2 flex-1 sm:flex-none">
            <List className="h-4 w-4" />
            {t("list_view")}
          </TabsTrigger>
        </TabsList>

        {/* ══ MONTH VIEW ══ */}
        <TabsContent value="month">
          {/* Two-column layout: grid + sidebar */}
          <div className="flex gap-4 items-start">

            {/* ── Calendar grid ── */}
            <div className="flex-1 min-w-0 rounded-xl border bg-card overflow-hidden shadow-sm">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b bg-muted/40">
                {weekDays.map((d) => (
                  <div key={d} className="py-2.5 text-center text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7">
                {Array.from({ length: startDow }).map((_, i) => (
                  <div key={`e-${i}`} className="min-h-[52px] sm:min-h-[68px] border-r border-b bg-muted/10 last:border-r-0" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dayEvts = eventsByDay[day] ?? [];
                  const isToday = day === todayDate;
                  const isPast = new Date(year, month - 1, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isSelected = selectedDay === day;
                  const hasEvts = dayEvts.length > 0;

                  // Check done state
                  const allDone = hasEvts && dayEvts.every((e) => statuses[e.id] === true);
                  const someDone = hasEvts && !allDone && dayEvts.some((e) => statuses[e.id] === true);

                  // Most urgent level for dot ring
                  const hasUrgent = !allDone && dayEvts.some((e) => {
                    if (statuses[e.id]) return false;
                    const lvl = getUrgencyLevel(getDaysUntil(e.date));
                    return lvl === "overdue" || lvl === "urgent";
                  });

                  return (
                    <div
                      key={day}
                      onClick={() => hasEvts ? setSelectedDay(isSelected ? null : day) : undefined}
                      className={`border-r border-b last:border-r-0 min-h-[52px] sm:min-h-[68px] p-1.5 sm:p-2 transition-colors
                        ${hasEvts ? "cursor-pointer" : ""}
                        ${isSelected
                          ? "bg-primary/8 ring-1 ring-inset ring-primary/30"
                          : allDone ? "bg-green-50/60 dark:bg-green-950/10"
                          : hasEvts ? "hover:bg-accent/25" : isPast ? "bg-muted/5" : ""}
                      `}
                    >
                      {/* Day number */}
                      <div className="flex items-start justify-between">
                        <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold transition-colors
                          ${isSelected
                            ? "bg-primary text-primary-foreground"
                            : isToday
                            ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                            : isPast
                            ? "text-muted-foreground/50"
                            : ""}
                        `}>
                          {day}
                        </span>
                        {allDone && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                        )}
                        {someDone && !allDone && (
                          <span className="hidden sm:block text-[10px] text-muted-foreground/70 font-medium mt-0.5">
                            {dayEvts.length}
                          </span>
                        )}
                        {!allDone && !someDone && dayEvts.length > 0 && (
                          <span className="hidden sm:block text-[10px] text-muted-foreground/70 font-medium mt-0.5">
                            {dayEvts.length}
                          </span>
                        )}
                      </div>

                      {/* Colored dots */}
                      {hasEvts && (
                        <div className="flex flex-wrap gap-0.5 mt-1.5 pl-0.5">
                          {isAccountant && Object.keys(eventOrgMap).length > 0 ? (
                            // Accountant mode: one dot per unique org represented in this day
                            (() => {
                              const dayOrgIds = [...new Set(dayEvts.flatMap((e) => eventOrgMap[e.id] ?? []))];
                              return (
                                <>
                                  {dayOrgIds.slice(0, 4).map((orgId) => {
                                    const color = ORG_PALETTE[orgColorIdx[orgId] ?? 0];
                                    return (
                                      <span
                                        key={orgId}
                                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${color.dot}`}
                                        title={orgNameMap[orgId]}
                                      />
                                    );
                                  })}
                                  {dayOrgIds.length > 4 && (
                                    <span className="text-[9px] text-muted-foreground leading-none self-end">
                                      +{dayOrgIds.length - 4}
                                    </span>
                                  )}
                                </>
                              );
                            })()
                          ) : (
                            // Normal mode: one dot per event colored by tax type
                            <>
                              {dayEvts.slice(0, 4).map((evt, i) => (
                                <span
                                  key={i}
                                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0
                                    ${statuses[evt.id] ? "bg-green-400" : (TAX_TYPE_DOT[evt.taxType] ?? "bg-slate-400")}
                                    ${hasUrgent && !statuses[evt.id] ? "ring-1 ring-offset-[1px] ring-red-400/60" : ""}
                                  `}
                                />
                              ))}
                              {dayEvts.length > 4 && (
                                <span className="text-[9px] text-muted-foreground leading-none self-end">
                                  +{dayEvts.length - 4}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {Array.from({ length: trailingCells }).map((_, i) => (
                  <div key={`t-${i}`} className="min-h-[52px] sm:min-h-[68px] border-r border-b bg-muted/10 last:border-r-0" />
                ))}
              </div>

              {/* Legend inside the card */}
              <div className="border-t px-3 py-2.5 flex flex-wrap gap-x-3 gap-y-1.5 bg-muted/20">
                {isAccountant && accountantOrgs && Object.keys(eventOrgMap).length > 0 ? (
                  accountantOrgs.map((org) => (
                    <span key={org.id} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ORG_PALETTE[orgColorIdx[org.id] ?? 0].dot}`} />
                      {org.name}
                    </span>
                  ))
                ) : (
                  Object.entries(TAX_TYPE_DOT).map(([key, dot]) => (
                    <span key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                      {tTax(key)}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* ── Desktop sidebar event panel ── */}
            <div className="hidden lg:flex flex-col w-[300px] shrink-0 rounded-xl border bg-card shadow-sm overflow-hidden sticky top-20"
              style={{ maxHeight: "calc(100vh - 5.5rem)" }}>
              <EventPanel
                day={selectedDay}
                monthLabel={monthLabel}
                events={selectedDayEvents}
                locale={locale}
                tTax={(k) => tTax(k)}
                tCal={(k) => t(k)}
                eventStatuses={statuses}
                isLoggedIn={isLoggedIn}
                onToggleStatus={handleToggleStatus}
                eventOrgMap={isAccountant ? eventOrgMap : undefined}
                orgColorIdx={isAccountant ? orgColorIdx : undefined}
                orgNameMap={isAccountant ? orgNameMap : undefined}
              />
            </div>
          </div>

          {/* ── Mobile event panel (below grid) ── */}
          {selectedDay && selectedDayEvents.length > 0 && (
            <div className="lg:hidden mt-3 rounded-xl border bg-card shadow-md overflow-hidden flex flex-col">
              <EventPanel
                day={selectedDay}
                monthLabel={monthLabel}
                events={selectedDayEvents}
                locale={locale}
                tTax={(k) => tTax(k)}
                tCal={(k) => t(k)}
                onClose={() => setSelectedDay(null)}
                eventStatuses={statuses}
                isLoggedIn={isLoggedIn}
                onToggleStatus={handleToggleStatus}
                eventOrgMap={isAccountant ? eventOrgMap : undefined}
                orgColorIdx={isAccountant ? orgColorIdx : undefined}
                orgNameMap={isAccountant ? orgNameMap : undefined}
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3 text-center">
            {t("click_day_hint")}
          </p>
        </TabsContent>

        {/* ══ LIST VIEW ══ */}
        <TabsContent value="list">
          {events.length === 0 ? (
            <div className="rounded-xl border bg-muted/30 p-12 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">{t("no_events")}</p>
              <p className="text-xs mt-1">{tStatus("try_another_month")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((evt) => {
                const days = getDaysUntil(evt.date);
                const urgency = getUrgencyLevel(days);
                const dateObj = new Date(evt.date);
                const isDone = statuses[evt.id] === true;
                const evtOrgIds = isAccountant ? (eventOrgMap[evt.id] ?? []) : [];
                const primaryOrgId = evtOrgIds[0];
                const orgColor = primaryOrgId ? ORG_PALETTE[orgColorIdx[primaryOrgId] ?? 0] : null;
                const urgencyBorder = isDone
                  ? "border-l-4 border-l-green-400"
                  : isAccountant && orgColor
                  ? `border-l-4 ${orgColor.border}`
                  : {
                      overdue: "border-l-4 border-l-red-500",
                      urgent: "border-l-4 border-l-orange-400",
                      warning: "border-l-4 border-l-yellow-400",
                      ok: "border-l-4 border-l-blue-300",
                    }[urgency];

                return (
                  <div key={evt.id} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card transition-all ${urgencyBorder} ${isDone ? "opacity-70" : "hover:shadow-md"}`}>
                    <Link href={`/events/${evt.id}`} className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="text-center min-w-[40px] sm:min-w-[52px] shrink-0">
                        <div className={`text-xl sm:text-2xl font-bold leading-none ${isDone ? "text-muted-foreground" : ""}`}>{dateObj.getDate()}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 uppercase">
                          {dateObj.toLocaleDateString(locale === "en" ? "en-US" : "ru-RU", { month: "short" })}
                        </div>
                      </div>

                      <div className="w-px h-10 bg-border shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm leading-snug line-clamp-2 ${isDone ? "line-through text-muted-foreground" : ""}`}>
                          {getTitleByLocale(evt, locale)}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              <CheckCircle2 className="h-3 w-3" />
                              {tStatus("done")}
                            </span>
                          ) : (
                            <>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TAX_TYPE_COLORS[evt.taxType] ?? "bg-gray-100 text-gray-700"}`}>
                                {tTax(evt.taxType)}
                              </span>
                              <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                {EVENT_TYPE_ICON[evt.eventType as keyof typeof EVENT_TYPE_ICON]}
                                {evt.eventType === "REPORT" ? t("event_report") : evt.eventType === "PAYMENT" ? t("event_payment") : t("event_both")}
                              </span>
                            </>
                          )}
                          {/* Org badges for accountant mode */}
                          {isAccountant && evtOrgIds.map((orgId) => {
                            const c = ORG_PALETTE[orgColorIdx[orgId] ?? 0];
                            return (
                              <span key={orgId} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${c.badge}`}>
                                {orgNameMap[orgId]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </Link>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {!isDone && (
                        urgency === "overdue" ? (
                          <Badge variant="danger" className="text-[11px]">{tStatus("overdue")}</Badge>
                        ) : days === 0 ? (
                          <Badge variant="danger" className="text-[11px]">{tStatus("today")}</Badge>
                        ) : days === 1 ? (
                          <Badge variant="warning" className="text-[11px]">{tStatus("tomorrow")}</Badge>
                        ) : urgency === "urgent" ? (
                          <Badge variant="danger" className="text-[11px]">{tStatus("days_left", { n: days })}</Badge>
                        ) : urgency === "warning" ? (
                          <Badge variant="warning" className="text-[11px]">{tStatus("days_left", { n: days })}</Badge>
                        ) : (
                          <Badge variant="success" className="text-[11px]">{tStatus("days_left", { n: days })}</Badge>
                        )
                      )}
                      {isLoggedIn && (
                        <button
                          onClick={() => handleToggleStatus(evt.id, !isDone)}
                          title={isDone ? tStatus("unmark") : tStatus("mark_done")}
                          className={`transition-colors ${isDone ? "text-green-500 hover:text-muted-foreground" : "text-muted-foreground/40 hover:text-green-500"}`}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tax profile edit dialog */}
      {userProfile && (
        <TaxProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          userProfile={userProfile}
        />
      )}
    </div>
  );
}
