"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TaxEvent {
  id: string;
  year: number;
  month: number;
  date: Date | string;
  taxType: string;
  eventType: string;
  titleRu: string;
  titleEn: string;
  titleUz: string;
  titleUzc: string;
  descRu: string;
  descEn: string;
  descUz: string;
  descUzc: string;
  articleRef?: string | null;
  forPeriod?: string | null;
  baseDateNK?: Date | string | null;
  isPostponed?: boolean;
  postponeReasonRu?: string | null;
  postponeReasonEn?: string | null;
  postponeReasonUz?: string | null;
  postponeReasonUzc?: string | null;
  isRecurring?: boolean;
  recurrence?: string | null;
  baseDay?: number | null;
  orgTypes: string[];
  taxRegimes: string[];
  requiresEmployees: boolean | null;
  requiresAssets: string[];
  requiresSpecial: string[];
  requiresPension: string[];
  isPublished: boolean;
  isDraft: boolean;
}

interface AdminEventFormProps {
  event: TaxEvent | null;
  locale: string;
}

const TAX_TYPES = [
  "VAT", "PERSONAL_IT", "PROFIT", "PROPERTY",
  "LAND", "WATER", "EXCISE", "SOCIAL", "INPS",
  "TURNOVER", "RENT", "FEES", "OTHER",
];

const EVENT_TYPES = ["REPORT", "PAYMENT", "BOTH"];

const ORG_TYPE_OPTIONS = [
  { value: "LLC", label: "ООО/АО (юрлицо)" },
  { value: "JSC", label: "АО" },
  { value: "IE", label: "ИП" },
  { value: "SELF_EMPLOYED", label: "Самозанятый" },
  { value: "FARM", label: "Дехканское хозяйство" },
];

const TAX_REGIME_OPTIONS = [
  { value: "VAT", label: "Плательщик НДС" },
  { value: "TURNOVER", label: "Плательщик налога с оборота (НсО)" },
];

const ASSET_OPTIONS = [
  { value: "property", label: "Имущество на балансе" },
  { value: "land_non_agri", label: "Земля несельхоз" },
  { value: "land_agri", label: "Земля сельхоз" },
  { value: "water", label: "Водные ресурсы" },
];

const SPECIAL_OPTIONS = [
  { value: "non_resident_income", label: "Выплаты нерезидентам" },
  { value: "dividends", label: "Дивиденды / проценты" },
  { value: "alcohol_tobacco", label: "Алкоголь, пиво, табак" },
  { value: "excise", label: "Подакцизные товары" },
  { value: "subsoil", label: "Добыча ископаемых" },
  { value: "high_revenue_20b", label: "Доход > 20 млрд" },
  { value: "cfc", label: "КИК" },
  { value: "controlled_transactions", label: "Контролируемые сделки" },
  { value: "online_kkt", label: "Онлайн-ККТ" },
];

const PENSION_OPTIONS = [
  { value: "disabled_child", label: "Ребёнок-инвалид до 16 лет" },
  { value: "loss_of_breadwinner", label: "Потеря кормильца / трудовое увечье" },
];

function MultiCheckbox({
  options,
  value,
  onChange,
  hint,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-x-6 gap-y-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="h-4 w-4 rounded border"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AdminEventForm({ event, locale }: AdminEventFormProps) {
  const t = useTranslations("admin");
  const tTax = useTranslations("tax_types");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: event ? new Date(event.date).toISOString().split("T")[0] : "",
    taxType: event?.taxType ?? "VAT",
    eventType: event?.eventType ?? "BOTH",
    titleRu: event?.titleRu ?? "",
    titleEn: event?.titleEn ?? "",
    titleUz: event?.titleUz ?? "",
    titleUzc: event?.titleUzc ?? "",
    descRu: event?.descRu ?? "",
    descEn: event?.descEn ?? "",
    descUz: event?.descUz ?? "",
    descUzc: event?.descUzc ?? "",
    articleRef: event?.articleRef ?? "",
    forPeriod: event?.forPeriod ?? "",
    baseDateNK: event?.baseDateNK
      ? new Date(event.baseDateNK).toISOString().split("T")[0]
      : "",
    orgTypes: event?.orgTypes ?? [],
    taxRegimes: event?.taxRegimes ?? [],
    requiresEmployees: event?.requiresEmployees ?? null as boolean | null,
    requiresAssets: event?.requiresAssets ?? [],
    requiresSpecial: event?.requiresSpecial ?? [],
    requiresPension: event?.requiresPension ?? [],
    isPostponed: event?.isPostponed ?? false,
    postponeReasonRu: event?.postponeReasonRu ?? "",
    postponeReasonEn: event?.postponeReasonEn ?? "",
    postponeReasonUz: event?.postponeReasonUz ?? "",
    postponeReasonUzc: event?.postponeReasonUzc ?? "",
    isRecurring: event?.isRecurring ?? false,
    recurrence: event?.recurrence ?? "ONCE",
    baseDay: event?.baseDay ? String(event.baseDay) : "",
    isPublished: event?.isPublished ?? true,
  });

  const set = (key: string, value: unknown) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dateObj = new Date(formData.date);
    const payload = {
      ...formData,
      date: dateObj,
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      isDraft: !formData.isPublished,
      baseDateNK: formData.baseDateNK ? new Date(formData.baseDateNK) : null,
      baseDay: formData.baseDay ? parseInt(formData.baseDay) : null,
      postponeReasonRu: formData.isPostponed ? formData.postponeReasonRu : null,
      postponeReasonEn: formData.isPostponed ? formData.postponeReasonEn : null,
      postponeReasonUz: formData.isPostponed ? formData.postponeReasonUz : null,
      postponeReasonUzc: formData.isPostponed ? formData.postponeReasonUzc : null,
      recurrence: formData.isRecurring ? formData.recurrence : null,
    };

    try {
      if (event) {
        await fetch(`/api/admin/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      router.push("/admin/events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Meta */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Основные данные</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Дата дедлайна *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Базовая дата по НК</Label>
            <Input
              type="date"
              value={formData.baseDateNK}
              onChange={(e) => set("baseDateNK", e.target.value)}
              placeholder="До переноса"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("tax_type")} *</Label>
            <Select
              value={formData.taxType}
              onValueChange={(v) => set("taxType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tTax(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("event_type")} *</Label>
            <Select
              value={formData.eventType}
              onValueChange={(v) => set("eventType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((et) => (
                  <SelectItem key={et} value={et}>
                    {et === "REPORT" ? "Отчётность" : et === "PAYMENT" ? "Уплата" : "Отчётность + Уплата"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("article_ref")}</Label>
            <Input
              value={formData.articleRef}
              onChange={(e) => set("articleRef", e.target.value)}
              placeholder="НК, ст. 273, ч. 1"
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label>За какой период</Label>
            <Input
              value={formData.forPeriod}
              onChange={(e) => set("forPeriod", e.target.value)}
              placeholder="март 2026 / I квартал 2026 / 2025 год"
            />
          </div>
        </div>

        {/* Field 9: Причина переноса */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPostponed"
              checked={formData.isPostponed}
              onChange={(e) => set("isPostponed", e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            <Label htmlFor="isPostponed">Перенос дедлайна (дата изменена из-за выходных)</Label>
          </div>
          {formData.isPostponed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
              {(["Ru", "En", "Uz", "Uzc"] as const).map((lang) => {
                const key = `postponeReason${lang}` as keyof typeof formData;
                const labels = { Ru: "Причина (рус)", En: "Reason (eng)", Uz: "Sababi (uzb lat)", Uzc: "Сабаби (uzb kir)" };
                return (
                  <div key={lang} className="space-y-1">
                    <Label className="text-xs">{labels[lang]}</Label>
                    <Input
                      value={formData[key] as string}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={lang === "Ru" ? "Перенос с 15 марта (воскресенье)" : ""}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Field 10: Повторяющееся событие */}
        <div className="space-y-3 pt-2 border-t">
          <Label>Повторяющееся событие</Label>
          <div className="flex flex-wrap gap-6">
            {[
              { v: "ONCE", label: "Разовое" },
              { v: "MONTHLY", label: "Ежемесячное" },
              { v: "QUARTERLY", label: "Ежеквартальное" },
              { v: "YEARLY", label: "Ежегодное" },
            ].map(({ v, label }) => (
              <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="recurrence"
                  checked={(!formData.isRecurring && v === "ONCE") || (formData.isRecurring && formData.recurrence === v)}
                  onChange={() => {
                    if (v === "ONCE") {
                      set("isRecurring", false);
                      set("recurrence", "ONCE");
                    } else {
                      set("isRecurring", true);
                      set("recurrence", v);
                    }
                  }}
                  className="h-4 w-4"
                />
                {label}
              </label>
            ))}
          </div>
          {formData.isRecurring && (
            <div className="flex items-center gap-3 pl-6">
              <Label className="text-sm shrink-0">База (день месяца):</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={formData.baseDay}
                onChange={(e) => set("baseDay", e.target.value)}
                placeholder="15"
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">Число месяца для автогенерации событий</span>
            </div>
          )}
        </div>
      </div>

      {/* Visibility conditions — spec Part 6 */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="font-semibold">Условия показа</h2>

        <div className="space-y-2">
          <Label>Кому показывать</Label>
          <MultiCheckbox
            options={ORG_TYPE_OPTIONS}
            value={formData.orgTypes}
            onChange={(v) => set("orgTypes", v)}
            hint="Оставьте пустым — покажется всем типам организаций"
          />
        </div>

        <div className="space-y-2">
          <Label>Режим налогообложения</Label>
          <MultiCheckbox
            options={TAX_REGIME_OPTIONS}
            value={formData.taxRegimes}
            onChange={(v) => set("taxRegimes", v)}
            hint="Оставьте пустым — покажется при любом режиме"
          />
        </div>

        <div className="space-y-2">
          <Label>Требует наличие сотрудников</Label>
          <div className="flex gap-6">
            {[
              { v: null, label: "Неважно" },
              { v: true, label: "Только с сотрудниками" },
              { v: false, label: "Только без сотрудников" },
            ].map(({ v, label }) => (
              <label key={String(v)} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="requiresEmployees"
                  checked={formData.requiresEmployees === v}
                  onChange={() => set("requiresEmployees", v)}
                  className="h-4 w-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Требует наличие активов</Label>
          <MultiCheckbox
            options={ASSET_OPTIONS}
            value={formData.requiresAssets}
            onChange={(v) => set("requiresAssets", v)}
            hint="Покажется если у пользователя отмечен ХОТЯ БЫ ОДИН из выбранных"
          />
        </div>

        <div className="space-y-2">
          <Label>Требует специфичную деятельность</Label>
          <MultiCheckbox
            options={SPECIAL_OPTIONS}
            value={formData.requiresSpecial}
            onChange={(v) => set("requiresSpecial", v)}
            hint="Покажется если у пользователя отмечена ХОТЯ БЫ ОДНА из выбранных"
          />
        </div>

        <div className="space-y-2">
          <Label>Требует Пенсионный фонд</Label>
          <MultiCheckbox
            options={PENSION_OPTIONS}
            value={formData.requiresPension}
            onChange={(v) => set("requiresPension", v)}
          />
        </div>
      </div>

      {/* Multilingual content */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-4">Контент (4 языка)</h2>

        <Tabs defaultValue="ru">
          <TabsList className="mb-4">
            <TabsTrigger value="ru">Русский</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="uz">Uzb Lat</TabsTrigger>
            <TabsTrigger value="uzc">Uzb Kir</TabsTrigger>
          </TabsList>

          {(["ru", "en", "uz", "uzc"] as const).map((lang) => {
            const titleKey = `title${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof formData;
            const descKey = `desc${lang.charAt(0).toUpperCase()}${lang.slice(1)}` as keyof typeof formData;

            return (
              <TabsContent key={lang} value={lang} className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {lang === "ru" ? t("title_ru") : lang === "en" ? t("title_en") : lang === "uz" ? t("title_uz") : t("title_uzc")} *
                  </Label>
                  <Input
                    value={formData[titleKey] as string}
                    onChange={(e) => set(titleKey, e.target.value)}
                    placeholder="Заголовок..."
                    required={lang === "ru"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {lang === "ru" ? t("desc_ru") : lang === "en" ? t("desc_en") : lang === "uz" ? t("desc_uz") : t("desc_uzc")} *
                  </Label>
                  <Textarea
                    value={formData[descKey] as string}
                    onChange={(e) => set(descKey, e.target.value)}
                    placeholder="Описание..."
                    rows={5}
                    required={lang === "ru"}
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Publish */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) => set("isPublished", e.target.checked)}
            className="h-4 w-4 rounded border"
          />
          <Label htmlFor="isPublished">Опубликовать сразу</Label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Сохранение..." : t("save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/events")}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
