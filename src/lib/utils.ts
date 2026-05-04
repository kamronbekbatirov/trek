import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: string = "ru"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const localeMap: Record<string, string> = {
    ru: "ru-RU",
    en: "en-US",
    uz: "uz-UZ",
    uzc: "uz-UZ",
  };
  return d.toLocaleDateString(localeMap[locale] ?? "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getDaysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUrgencyLevel(
  daysLeft: number
): "overdue" | "urgent" | "warning" | "ok" {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 3) return "urgent";
  if (daysLeft <= 7) return "warning";
  return "ok";
}

export const TAX_TYPE_COLORS: Record<string, string> = {
  VAT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PERSONAL_IT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PROFIT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  PROPERTY: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  LAND: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  WATER: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  EXCISE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  SOCIAL: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  INPS: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  TURNOVER: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  RENT: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  FEES: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export function getTitleByLocale(
  event: {
    titleRu: string;
    titleEn: string;
    titleUz: string;
    titleUzc: string;
  },
  locale: string
): string {
  switch (locale) {
    case "en": return event.titleEn;
    case "uz": return event.titleUz;
    case "uzc": return event.titleUzc;
    default: return event.titleRu;
  }
}

export function getDescByLocale(
  event: {
    descRu: string;
    descEn: string;
    descUz: string;
    descUzc: string;
  },
  locale: string
): string {
  switch (locale) {
    case "en": return event.descEn;
    case "uz": return event.descUz;
    case "uzc": return event.descUzc;
    default: return event.descRu;
  }
}
