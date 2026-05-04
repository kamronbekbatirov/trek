"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { TelegramBotAuth } from "@/components/auth/telegram-bot-auth";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError(t("error_passwords_mismatch")); return; }
    if (!agreed) { setError(t("error_terms_required")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(res.status === 409 ? t("error_exists") : (data.error ?? t("error_register")));
        return;
      }
      router.push("/onboarding");
    } catch {
      setError(t("error_register"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-brand text-3xl tracking-tight">Trek</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">{t("register_hint")}</p>
        </div>
        <div className="rounded-xl border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-semibold mb-5">{t("register_title")}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password_placeholder")} required minLength={6} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("confirm_password")}</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("confirm_password_placeholder")} required autoComplete="new-password" />
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer" />
              <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                {t("agree_prefix")}{" "}
                <a href="/terms" target="_blank" className="underline text-foreground hover:opacity-70">{t("agree_terms")}</a>
                {" "}{t("agree_and")}{" "}
                <a href="/privacy" target="_blank" className="underline text-foreground hover:opacity-70">{t("agree_privacy")}</a>.
              </label>
            </div>
            {error && <div className="rounded-lg bg-destructive/10 text-destructive px-3 py-2.5 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading || !agreed}>
              {loading ? "..." : t("register_button")}
            </Button>
          </form>
          <div className="mt-5">
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground shrink-0">{t("or_register_via")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <TelegramBotAuth onError={(msg) => setError(msg)} />
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {t("has_account")}{" "}
            <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4 hover:opacity-70">{t("or_login")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
