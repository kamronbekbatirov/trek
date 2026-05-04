"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

const SESSION_KEY = "tg_auth_token";
const SESSION_URL_KEY = "tg_auth_url";

interface Props {
  onError?: (msg: string) => void;
}

type AuthState = "idle" | "loading" | "waiting";

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.47l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.268.089z" />
  </svg>
);

export function TelegramBotAuth({ onError }: Props) {
  const t = useTranslations("auth");
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [token, setToken] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const doPoll = useCallback(async (tok: string) => {
    try {
      const res = await fetch(`/api/auth/telegram/poll?token=${tok}`);
      const data = await res.json();
      if (data.ok) {
        clearInterval(pollRef.current!);
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_URL_KEY);
        window.location.href = data.onboardingDone === false ? "/onboarding" : "/dashboard";
      } else if (data.error === "Expired" || data.error === "Invalid token") {
        clearInterval(pollRef.current!);
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_URL_KEY);
        setAuthState("idle");
        setToken("");
        setTelegramUrl("");
        onErrorRef.current?.(t("tg_expired"));
      }
    } catch {
      // ignore transient errors
    }
  }, [t]);

  // Restore pending auth on mount (handles page reload)
  useEffect(() => {
    const savedToken = sessionStorage.getItem(SESSION_KEY);
    const savedUrl = sessionStorage.getItem(SESSION_URL_KEY);
    if (savedToken && savedUrl) {
      setToken(savedToken);
      setTelegramUrl(savedUrl);
      setAuthState("waiting");
      doPoll(savedToken);
    }
  }, [doPoll]);

  // Interval polling
  useEffect(() => {
    if (authState !== "waiting" || !token) return;
    pollRef.current = setInterval(() => doPoll(token), 2000);
    return () => clearInterval(pollRef.current!);
  }, [authState, token, doPoll]);

  // Poll immediately when user returns to tab from Telegram
  useEffect(() => {
    if (authState !== "waiting" || !token) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") doPoll(token);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [authState, token, doPoll]);

  const startAuth = async () => {
    setAuthState("loading");
    try {
      const res = await fetch("/api/auth/telegram/init", { method: "POST" });
      const data = await res.json();
      sessionStorage.setItem(SESSION_KEY, data.token);
      sessionStorage.setItem(SESSION_URL_KEY, data.url);
      setToken(data.token);
      setTelegramUrl(data.url);
      setAuthState("waiting");
    } catch {
      setAuthState("idle");
      onErrorRef.current?.(t("tg_error"));
    }
  };

  const cancel = () => {
    clearInterval(pollRef.current!);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_URL_KEY);
    setAuthState("idle");
    setToken("");
    setTelegramUrl("");
  };

  if (authState === "loading") {
    return (
      <div className="w-full flex items-center justify-center gap-2.5 rounded-lg border bg-card px-4 py-2.5 text-sm text-muted-foreground">
        <span className="h-4 w-4 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin" />
        {t("tg_preparing")}
      </div>
    );
  }

  if (authState === "waiting") {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2.5 text-sm">
          <span className="h-3.5 w-3.5 border-2 border-[#229ED9] border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-muted-foreground">{t("tg_waiting")}</span>
        </div>
        {/* tg:// opens the app directly; falls back to https://t.me on desktop */}
        <a
          href={telegramUrl.replace("https://t.me/", "tg://resolve?domain=").replace("?start=", "&start=")}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#229ED9] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            const tgLink = telegramUrl.replace("https://t.me/", "tg://resolve?domain=").replace("?start=", "&start=");
            const fallback = telegramUrl;
            const win = window.open(tgLink, "_blank");
            if (!win) {
              window.open(fallback, "_blank");
            }
          }}
        >
          <TelegramIcon className="h-4 w-4" />
          {t("tg_open")}
        </a>
        <p className="text-xs text-muted-foreground text-center">
          {t("tg_hint")}
        </p>
        <button
          onClick={cancel}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("tg_cancel")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startAuth}
      className="w-full flex items-center justify-center gap-2.5 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      <TelegramIcon className="h-5 w-5 text-[#229ED9]" />
      {t("tg_login")}
    </button>
  );
}
