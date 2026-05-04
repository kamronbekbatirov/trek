"use client";

import { useEffect, useRef } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

interface TelegramLoginButtonProps {
  onError?: (msg: string) => void;
}

export function TelegramLoginButton({ onError }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "trekcalendar_bot";

  useEffect(() => {
    // Define global callback before script loads
    window.onTelegramAuth = async (user: TelegramUser) => {
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          onError?.(data.error ?? "Ошибка авторизации через Telegram");
          return;
        }

        const data = await res.json();
        // Use full page navigation so the updated session cookie is sent
        window.location.href = data.onboardingDone === false ? "/onboarding" : "/dashboard";
      } catch {
        onError?.("Ошибка соединения. Попробуйте снова.");
      }
    };

    // Inject script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-lang", "ru");

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [botUsername, onError]);

  return (
    <div ref={containerRef} className="flex justify-center min-h-[40px]" />
  );
}
