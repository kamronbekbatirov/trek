"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle2,
  Crown,
  AlertCircle,
  ExternalLink,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface Payment {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
}

interface SubscriptionData {
  plan: "FREE" | "PRO";
  status: string;
  nextBillingDate: string | null;
  cancelledAt: string | null;
  cardMask: string | null;
  payments: Payment[];
}

interface BillingViewProps {
  subscription: SubscriptionData;
  userId: string;
  locale: string;
}

const PRO_PRICE_UZS = 17999;

export function BillingView({ subscription, userId, locale }: BillingViewProps) {
  const t = useTranslations("billing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPro = subscription.plan === "PRO" && subscription.status === "ACTIVE";

  async function handleUpgrade() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(t("error_checkout"));
      }
    } catch {
      setError(t("error_checkout"));
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatAmount(tiyin: number) {
    return (tiyin / 100).toLocaleString("ru-RU") + " сум";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold flex-1">{t("title")}</h1>
      </div>

      {/* Current Plan */}
      <div
        className={`rounded-xl border p-6 ${
          isPro
            ? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20"
            : "bg-card"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isPro ? (
                <Crown className="h-5 w-5 text-purple-500" />
              ) : (
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              )}
              <h2 className="font-semibold text-lg">
                {isPro ? t("plan_pro") : t("plan_free")}
              </h2>
            </div>
            {isPro ? (
              <p className="text-sm text-muted-foreground">
                {t("next_billing")}: {formatDate(subscription.nextBillingDate)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">{t("free_desc")}</p>
            )}
          </div>
          <div
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              isPro
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {isPro ? "PRO" : "FREE"}
          </div>
        </div>

        {!isPro && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-2xl">
                {PRO_PRICE_UZS.toLocaleString("ru-RU")} UZS
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / {t("month")}
                </span>
              </span>
            </div>
            <ul className="space-y-1.5 mb-4 text-sm text-muted-foreground">
              {(t.raw("pro_features") as string[]).map((f: string) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {error && (
              <p className="text-sm text-destructive mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                t("loading")
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  {t("pay_with_payme")}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {t("redirect_notice")}
            </p>
          </div>
        )}

        {isPro && subscription.cardMask && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("card")}: {subscription.cardMask}
            </span>
          </div>
        )}
      </div>

      {/* Payment History */}
      {subscription.payments.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">{t("history")}</h2>
          </div>
          <div className="divide-y">
            {subscription.payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {p.description ?? t("plan_pro")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {formatAmount(p.amount)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : p.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {p.status === "SUCCESS"
                      ? t("status_paid")
                      : p.status === "CANCELLED"
                      ? t("status_cancelled")
                      : t("status_pending")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No payment history */}
      {subscription.payments.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground text-sm">
          {t("no_payments")}
        </div>
      )}
    </div>
  );
}
