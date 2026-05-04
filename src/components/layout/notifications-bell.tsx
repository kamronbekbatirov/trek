"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

interface Notification {
  id: string;
  type: string;
  messageRu: string;
  messageEn: string;
  messageUz: string;
  messageUzc: string;
  readAt: string | null;
  createdAt: string;
  eventId: string | null;
}

function getMsg(n: Notification, locale: string) {
  if (locale === "en") return n.messageEn;
  if (locale === "uz") return n.messageUz;
  if (locale === "uzc") return n.messageUzc;
  return n.messageRu;
}

export function NotificationsBell() {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const tStatus = useTranslations("status");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return t("just_now");
    if (diff < 3600) return t("minutes_ago", { n: Math.floor(diff / 60) });
    if (diff < 86400) return t("hours_ago", { n: Math.floor(diff / 3600) });
    return t("days_ago", { n: Math.floor(diff / 86400) });
  }

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for unread count every 2 minutes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 120_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      // Mark all as read
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 relative"
        onClick={handleOpen}
        aria-label={t("title")}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 rounded-xl border bg-popover shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
            <span className="text-sm font-semibold">{t("title")}</span>
            {notifications.length > 0 && (
              <span className="text-xs text-muted-foreground">{notifications.length}</span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">{tStatus("loading")}</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">{t("empty")}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex items-start gap-2.5 ${!n.readAt ? "bg-blue-50/50 dark:bg-blue-950/10" : ""}`}
                >
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!n.readAt ? "bg-blue-500" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    {n.eventId ? (
                      <Link href={`/events/${n.eventId}`} onClick={() => setOpen(false)}>
                        <p className="text-sm leading-snug hover:underline">{getMsg(n, locale)}</p>
                      </Link>
                    ) : (
                      <p className="text-sm leading-snug">{getMsg(n, locale)}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
