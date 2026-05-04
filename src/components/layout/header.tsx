"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Calendar,
  Sun,
  Moon,
  Bot,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { NotificationsBell } from "./notifications-bell";

interface HeaderProps {
  user?: {
    name?: string | null;
    email: string;
    role: string;
    isPro?: boolean;
  } | null;
}

const localeNames: Record<string, string> = {
  ru: "Рус",
  en: "Eng",
  uz: "Uzb",
  uzc: "Ўзб",
};

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="h-8 w-8" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

export function Header({ user }: HeaderProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 max-w-6xl">
        {/* Logo */}
        <Link href="/" className="flex items-center mr-6">
          <span className="font-brand text-2xl tracking-tight">Trek</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  {t("dashboard")}
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {t("calendar")}
                </Button>
              </Link>
              {(user.isPro || user.role === "ADMIN") && (
                <Link href="/chat">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Bot className="h-4 w-4" />
                    Треки
                  </Button>
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {t("admin")}
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/#features">
                <Button variant="ghost" size="sm">
                  {t("about")}
                </Button>
              </Link>
              <Link href="/#pricing">
                <Button variant="ghost" size="sm">
                  {t("pricing")}
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Language switcher */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs h-8 px-2"
              onClick={() => setLangOpen(!langOpen)}
            >
              {localeNames[locale]}
              <ChevronDown className="h-3 w-3" />
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border bg-popover shadow-md z-50">
                {Object.entries(localeNames).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      code === locale ? "font-semibold" : ""
                    }`}
                  >
                    {name} — {
                      { ru: "Русский", en: "English", uz: "O'zbek", uzc: "Ўзбек" }[code]
                    }
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <NotificationsBell />
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 h-8"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="h-8">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="h-8">{t("register")}</Button>
              </Link>
            </div>
          )}

          {/* Bell for mobile (logged-in only) */}
          {user && (
            <div className="md:hidden">
              <NotificationsBell />
            </div>
          )}

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          {user ? (
            <>
              {/* User info */}
              <div className="px-4 py-3 border-b bg-muted/30">
                <p className="font-medium text-sm truncate">{user.name ?? user.email}</p>
                {user.name && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
              </div>
              {/* Nav links */}
              <div className="px-3 py-3 space-y-0.5">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 h-10">
                    <LayoutDashboard className="h-4 w-4" />
                    {t("dashboard")}
                  </Button>
                </Link>
                <Link href="/calendar" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 h-10">
                    <Calendar className="h-4 w-4" />
                    {t("calendar")}
                  </Button>
                </Link>
                {(user.isPro || user.role === "ADMIN") && (
                  <Link href="/chat" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-10">
                      <Bot className="h-4 w-4" />
                      AI
                    </Button>
                  </Link>
                )}
                <Link href="/settings" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 h-10">
                    <Settings className="h-4 w-4" />
                    {t("settings")}
                  </Button>
                </Link>
                {user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-10">
                      <ShieldCheck className="h-4 w-4" />
                      {t("admin")}
                    </Button>
                  </Link>
                )}
              </div>
              {/* Logout — clearly separated */}
              <div className="px-3 pb-4 pt-1 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 h-10 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </Button>
              </div>
            </>
          ) : (
            <div className="px-3 py-4 space-y-2">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">{t("login")}</Button>
              </Link>
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">{t("register")}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
