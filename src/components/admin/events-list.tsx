"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { TAX_TYPE_COLORS } from "@/lib/utils";

interface TaxEvent {
  id: string;
  year: number;
  month: number;
  date: Date | string;
  taxType: string;
  eventType: string;
  titleRu: string;
  isPublished: boolean;
  isDraft: boolean;
}

export function AdminEventsList({
  events: initialEvents,
  locale,
}: {
  events: TaxEvent[];
  locale: string;
}) {
  const t = useTranslations("admin");
  const tTax = useTranslations("tax_types");
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);

  const togglePublish = async (id: string, current: boolean) => {
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current, isDraft: current }),
    });
    setEvents(
      events.map((e) =>
        e.id === id ? { ...e, isPublished: !current, isDraft: current } : e
      )
    );
  };

  const deleteEvent = async (id: string) => {
    if (!confirm(t("confirm_delete"))) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">{t("date")}</th>
              <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">{t("tax_type")}</th>
              <th className="text-left px-4 py-3 font-semibold">Название (рус)</th>
              <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Статус</th>
              <th className="text-right px-4 py-3 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map((evt) => (
              <tr key={evt.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(evt.date).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAX_TYPE_COLORS[evt.taxType]}`}
                  >
                    {tTax(evt.taxType)}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-xs truncate">{evt.titleRu}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      evt.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {evt.isPublished ? t("published") : t("draft")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublish(evt.id, evt.isPublished)}
                      title={evt.isPublished ? t("unpublish") : t("publish")}
                    >
                      {evt.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Link href={`/admin/events/${evt.id}`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteEvent(evt.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            Нет событий
          </div>
        )}
      </div>
    </div>
  );
}
