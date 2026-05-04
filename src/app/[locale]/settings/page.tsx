"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, User, CreditCard, ExternalLink, Filter, Trash2, AlertTriangle, Send, Building2 } from "lucide-react";
import { OrgList, AccountantOrg } from "@/components/accountant/org-list";
import { Link } from "@/i18n/navigation";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  orgType: string | null;
  taxRegime: string | null;
  language: string;
  hasEmployees: boolean | null;
  assets: string[];
  specialActivities: string[];
  pensionFund: string[];
  reminderDays: number[];
  onboardingDone: boolean;
  telegramId: string | null;
  telegramUsername: string | null;
  phone: string | null;
  subscription: { plan: string; status: string } | null;
}

const REMINDER_DAY_OPTIONS = [1, 3, 7, 14, 30];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tAc = useTranslations("accountant");
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accountantOrgs, setAccountantOrgs] = useState<AccountantOrg[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    language: "ru",
    reminderDays: [7, 3, 1] as number[],
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/auth/login");
          return;
        }
        const u: UserData = data.user;
        setUser(u);
        setFormData({
          name: u.name || "",
          language: u.language || "ru",
          reminderDays: u.reminderDays ?? [7, 3, 1],
        });
        setLoading(false);

        // Fetch accountant orgs if applicable
        if (u.orgType === "ACCOUNTANT") {
          fetch("/api/accountant/orgs")
            .then((r) => r.json())
            .then((d) => { if (d.orgs) setAccountantOrgs(d.orgs); });
        }
      });
  }, [router]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/";
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    const cur = formData.reminderDays;
    setFormData({
      ...formData,
      reminderDays: cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day].sort((a, b) => b - a),
    });
  };


  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={null} />
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <div className="h-8 bg-muted rounded w-1/3 mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="container mx-auto px-4 max-w-2xl py-8 space-y-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        {/* Profile */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("profile")}</h2>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("name_placeholder")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>

            {user.telegramId && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Telegram
                </Label>
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
                  {user.telegramUsername ? (
                    <span>@{user.telegramUsername}</span>
                  ) : (
                    <span className="text-muted-foreground">{t("telegram_connected")}</span>
                  )}
                  {user.phone && (
                    <span className="ml-auto text-muted-foreground text-xs">{user.phone}</span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("language")}</Label>
              <Select
                value={formData.language}
                onValueChange={(v) => setFormData({ ...formData, language: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uz">O&apos;zbek (Latin)</SelectItem>
                  <SelectItem value="uzc">Ўзбек (Кирилл)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Separator />

        {/* Notifications / Reminder days */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("reminder_section_title") ?? t("reminder_label")}</h2>
          </div>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <Label>{t("reminder_label")}</Label>
              <div className="flex flex-wrap gap-2">
                {REMINDER_DAY_OPTIONS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-all
                      ${formData.reminderDays.includes(day)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/40"
                      }`}
                  >
                    {day} {day === 1 ? t("day_one") : day <= 4 ? t("day_few") : t("day_many")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t("saving") : t("save")}
              </Button>
              {saved && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("saved")}
                </div>
              )}
            </div>
          </div>
        </section>

        <Separator />

        {/* My Organizations — ACCOUNTANT users only */}
        {user.orgType === "ACCOUNTANT" && (
          <>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{tAc("my_organizations")}</h2>
              </div>
              <OrgList
                orgs={accountantOrgs}
                isPro={user.subscription?.plan === "PRO" && user.subscription?.status === "ACTIVE"}
                onOrgsChange={setAccountantOrgs}
              />
            </section>
            <Separator />
          </>
        )}

        {/* Subscription */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("subscription")}</h2>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("current_plan")}</p>
                <p className="text-xl font-bold mt-1">
                  {user.subscription?.plan === "PRO" ? "Pro" : "Free"}
                </p>
              </div>
              <Link href="/billing">
                <Button variant={user.subscription?.plan === "PRO" ? "outline" : "default"} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {user.subscription?.plan === "PRO" ? t("manage") : t("upgrade")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Separator />

        {/* Danger Zone */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">{t("danger_zone")}</h2>
          </div>

          <div className="rounded-xl border border-destructive/40 bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{t("delete_account")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("delete_desc")}
                </p>
              </div>
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {tCommon("delete")}
                </Button>
              ) : null}
            </div>

            {showDeleteConfirm && (
              <div className="mt-4 pt-4 border-t border-destructive/20">
                <p className="text-sm font-medium text-destructive mb-3">
                  {t("delete_confirm")}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? t("deleting") : t("delete_yes")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
