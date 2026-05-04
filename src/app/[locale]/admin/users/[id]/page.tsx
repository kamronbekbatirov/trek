"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  orgType: string | null;
  taxRegime: string | null;
  language: string;
  telegramId: string | null;
  telegramChatId: string | null;
  hasEmployees: boolean | null;
  assets: string[];
  specialActivities: string[];
  pensionFund: string[];
  reminderDays: number[];
  onboardingDone: boolean;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    nextBillingDate: string | null;
    cancelledAt: string | null;
    createdAt: string;
  } | null;
}

const ORG_TYPES = ["LLC", "JSC", "IE", "SELF_EMPLOYED", "FARM", "ACCOUNTANT"];
const TAX_REGIMES = ["VAT", "TURNOVER", "BOTH"];
const PLANS = ["FREE", "PRO"];
const SUB_STATUSES = ["ACTIVE", "CANCELLED", "PAST_DUE"];
const ROLES = ["USER", "ADMIN"];

const ORG_LABELS: Record<string, string> = {
  LLC: "ООО",
  JSC: "АО",
  IE: "ИП",
  SELF_EMPLOYED: "Самозанятый",
  FARM: "Фермерское хоз-во",
  ACCOUNTANT: "Бухгалтер",
};

const REGIME_LABELS: Record<string, string> = {
  VAT: "НДС",
  TURNOVER: "Оборотный",
  BOTH: "Оба",
};

function Badge({ value, map }: { value: string; map?: Record<string, string> }) {
  const colorMap: Record<string, string> = {
    PRO: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    FREE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    PAST_DUE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    USER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  const label = map?.[value] ?? value;
  const color = colorMap[value] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  labels,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels?: Record<string, string>;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? o}
        </option>
      ))}
    </select>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string | null; email: string; role: string; isPro: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("USER");
  const [orgType, setOrgType] = useState("");
  const [taxRegime, setTaxRegime] = useState("");
  const [plan, setPlan] = useState("FREE");
  const [subStatus, setSubStatus] = useState("ACTIVE");
  const [onboardingDone, setOnboardingDone] = useState(false);

  const showToast = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error();
      const data: User = await res.json();
      setUser(data);
      setName(data.name ?? "");
      setRole(data.role);
      setOrgType(data.orgType ?? "");
      setTaxRegime(data.taxRegime ?? "");
      setPlan(data.subscription?.plan ?? "FREE");
      setSubStatus(data.subscription?.status ?? "ACTIVE");
      setOnboardingDone(data.onboardingDone);
    } catch {
      showToast("err", "Не удалось загрузить пользователя");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setAdminUser({ name: d.user.name, email: d.user.email, role: d.user.role, isPro: d.user.subscription?.plan === "PRO" });
    });
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, orgType, taxRegime, plan, subStatus, onboardingDone }),
      });
      if (!res.ok) throw new Error();
      showToast("ok", "Сохранено");
      load();
    } catch {
      showToast("err", "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!confirm(`Удалить пользователя ${user?.email}? Это действие необратимо.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        showToast("err", d.error || "Ошибка удаления");
        return;
      }
      router.push("/admin/users");
      router.refresh();
    } catch {
      showToast("err", "Ошибка удаления");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 max-w-3xl py-8">
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Загрузка...
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 max-w-3xl py-8">
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Пользователь не найден
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={adminUser} />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg text-sm font-medium ${
            toast.type === "ok"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
          }`}
        >
          {toast.type === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      )}

      <main className="container mx-auto px-4 max-w-3xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{user.email}</h1>
            <p className="text-sm text-muted-foreground">
              Зарегистрирован: {new Date(user.createdAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge value={user.subscription?.plan ?? "FREE"} />
            <Badge value={user.subscription?.status ?? "ACTIVE"} />
          </div>
        </div>

        {/* Read-only info */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h2 className="font-semibold text-sm">Информация</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span>{user.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Язык: </span>
              <span>{user.language}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Telegram ID: </span>
              <span>{user.telegramId || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Telegram Chat: </span>
              <span>{user.telegramChatId || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Онбординг: </span>
              <span>{user.onboardingDone ? "Завершён" : "Не завершён"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Сотрудники: </span>
              <span>
                {user.hasEmployees === null ? "—" : user.hasEmployees ? "Есть" : "Нет"}
              </span>
            </div>
          </div>
          {user.assets.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Имущество: </span>
              <span>{user.assets.join(", ")}</span>
            </div>
          )}
          {user.specialActivities.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Спец. деятельность: </span>
              <span>{user.specialActivities.join(", ")}</span>
            </div>
          )}
          {user.reminderDays.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Напоминания за: </span>
              <span>{user.reminderDays.join(", ")} дн.</span>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-sm">Редактировать</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Имя">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />
            </Field>

            <Field label="Роль">
              <Select value={role} onChange={setRole} options={ROLES} />
            </Field>

            <Field label="Тип организации">
              <Select
                value={orgType}
                onChange={setOrgType}
                options={ORG_TYPES}
                labels={ORG_LABELS}
                placeholder="— не выбрано —"
              />
            </Field>

            <Field label="Налоговый режим">
              <Select
                value={taxRegime}
                onChange={setTaxRegime}
                options={TAX_REGIMES}
                labels={REGIME_LABELS}
                placeholder="— не выбрано —"
              />
            </Field>

            <Field label="Тариф">
              <Select value={plan} onChange={setPlan} options={PLANS} />
            </Field>

            <Field label="Статус подписки">
              <Select value={subStatus} onChange={setSubStatus} options={SUB_STATUSES} />
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="onboarding"
              checked={onboardingDone}
              onChange={(e) => setOnboardingDone(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="onboarding" className="text-sm cursor-pointer">
              Онбординг завершён
            </label>
          </div>

          {user.subscription && (
            <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t">
              {user.subscription.nextBillingDate && (
                <p>
                  Следующее списание:{" "}
                  {new Date(user.subscription.nextBillingDate).toLocaleDateString("ru-RU")}
                </p>
              )}
              {user.subscription.cancelledAt && (
                <p>
                  Отменено:{" "}
                  {new Date(user.subscription.cancelledAt).toLocaleDateString("ru-RU")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
            onClick={deleteUser}
          >
            <Trash2 className="h-4 w-4" />
            Удалить пользователя
          </Button>

          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </main>
    </div>
  );
}
