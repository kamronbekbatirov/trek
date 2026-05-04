import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  Bell,
  Bot,
  Calendar,
  Filter,
  Check,
  ChevronRight,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
import { LandingCalendarDemo } from "@/components/landing/calendar-demo";
import type { PreviewEvent } from "@/components/landing/calendar-demo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  return {
    title: "Trek — " + t("hero_title"),
    description: t("hero_subtitle"),
  };
}

async function getUser() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore as never, sessionOptions);
    if (!session.userId) return null;
    return await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true },
    });
  } catch {
    return null;
  }
}

async function getCalendarData(): Promise<{ year: number; month: number; events: PreviewEvent[] }> {
  const { unstable_noStore: noStore } = await import("next/cache");
  noStore();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based

  const events = await prisma.taxEvent.findMany({
    where: { isPublished: true, year, month },
    select: {
      id: true,
      date: true,
      taxType: true,
      eventType: true,
      titleRu: true,
      titleEn: true,
      titleUz: true,
      titleUzc: true,
      orgTypes: true,
      taxRegimes: true,
    },
    orderBy: { date: "asc" },
  });

  return {
    year,
    month,
    events: events.map((e) => ({ ...e, date: e.date.toISOString() })),
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [user, calData] = await Promise.all([getUser(), getCalendarData()]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl relative">
            <HeroContent user={user} />
          </div>
        </section>

        {/* Interactive Calendar Demo */}
        <section className="py-10 border-y bg-muted/20">
          <div className="container mx-auto px-4 max-w-5xl">
            <LandingCalendarDemo
              initialEvents={calData.events}
              initialYear={calData.year}
              initialMonth={calData.month}
            />
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y bg-muted/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <StatsSection />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <FeaturesSection />
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <HowItWorksSection />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <PricingSection user={user} />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <FAQSection />
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className="py-20">
            <div className="container mx-auto px-4 max-w-5xl">
              <CTASection />
            </div>
          </section>
        )}
      </main>

      <FooterSection />
    </div>
  );
}

function HeroContent({
  user,
}: {
  user: { name?: string | null; email: string; role: string } | null;
}) {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");

  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium mb-8">
        <Zap className="h-3.5 w-3.5" />
        {t("hero_badge")}
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
        {t("hero_title")}
      </h1>

      <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
        {t("hero_subtitle")}
      </p>

      {user ? (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2 min-w-44">
              {t("go_to_dashboard")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/calendar">
            <Button variant="outline" size="lg" className="min-w-44">
              {tNav("calendar")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/register">
            <Button size="lg" className="gap-2 min-w-48">
              {t("hero_cta")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="min-w-48">
              {tNav("login")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatsSection() {
  const t = useTranslations("landing");
  const stats = [
    { value: t("stats_events_value"), label: t("stats_events") },
    { value: "4", label: t("stats_languages") },
    { value: t("stats_accuracy_value"), label: t("stats_accuracy_label") },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="text-2xl md:text-4xl font-bold mb-1">{stat.value}</div>
          <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-6 rounded-xl border bg-card hover:border-foreground/20 transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold mb-1.5">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const t = useTranslations("landing");

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("features_title")}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t("features_subtitle")}
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard icon={Calendar} title={t("feature_calendar_title")} desc={t("feature_calendar_desc")} />
        <FeatureCard icon={Bell} title={t("feature_notify_title")} desc={t("feature_notify_desc")} />
        <FeatureCard icon={Bot} title={t("feature_ai_title")} desc={t("feature_ai_desc")} />
        <FeatureCard icon={Filter} title={t("feature_filter_title")} desc={t("feature_filter_desc")} />
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const t = useTranslations("landing");
  const steps = [
    { num: "01", title: t("step_1_title"), desc: t("step_1_desc") },
    { num: "02", title: t("step_2_title"), desc: t("step_2_desc") },
    { num: "03", title: t("step_3_title"), desc: t("step_3_desc") },
    { num: "04", title: t("step_4_title"), desc: t("step_4_desc") },
  ];

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">{t("how_it_works")}</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step) => (
          <div key={step.num}>
            <div className="text-4xl font-bold text-muted-foreground/30 mb-3 font-brand">{step.num}</div>
            <h3 className="font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSection({ user }: { user: { role: string } | null }) {
  const t = useTranslations("landing");

  const freeFeatures = t.raw("free_features") as string[];
  const proFeatures = t.raw("pro_features_list") as string[];

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("pricing_title")}</h2>
        <p className="text-muted-foreground">{t("pricing_subtitle")}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="rounded-xl border bg-card p-7">
          <div className="mb-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">{t("plan_free")}</div>
            <div className="text-3xl font-bold mb-1">{t("plan_free_price")}</div>
            <p className="text-muted-foreground text-sm">{t("plan_free_desc")}</p>
          </div>
          <ul className="space-y-2.5 mb-7">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">{t("go_to_dashboard")}</Button>
            </Link>
          ) : (
            <Link href="/auth/register">
              <Button variant="outline" className="w-full">{t("hero_cta")}</Button>
            </Link>
          )}
        </div>

        {/* Pro */}
        <div className="rounded-xl border-2 border-foreground bg-card p-7 relative">
          <div className="absolute -top-3 left-6">
            <span className="bg-foreground text-background text-xs font-semibold px-3 py-1 rounded-full">{t("popular_badge")}</span>
          </div>
          <div className="mb-6">
            <div className="text-xs font-medium uppercase tracking-widest mb-3">{t("plan_pro")}</div>
            <div className="text-3xl font-bold mb-1">17 999 <span className="text-xl font-normal text-muted-foreground">{t("price_per_month")}</span></div>
            <p className="text-muted-foreground text-sm">{t("plan_pro_desc")}</p>
          </div>
          <ul className="space-y-2.5 mb-7">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {user ? (
            <Link href="/billing">
              <Button className="w-full gap-2">
                {t("manage_subscription")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/register">
              <Button className="w-full gap-2">
                {t("start_with_pro")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function FooterSection() {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 max-w-5xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-brand text-base text-foreground">Trek</span>
          <p>{t("footer_copyright")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/#features" className="hover:text-foreground transition-colors">{t("footer_features")}</Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">{t("footer_pricing")}</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">{t("footer_contact")}</Link>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">{tNav("terms")}</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">{tNav("privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}

function FAQSection() {
  const t = useTranslations("landing");
  const faqs = [
    { q: t("faq_1_q"), a: t("faq_1_a") },
    { q: t("faq_2_q"), a: t("faq_2_a") },
    { q: t("faq_3_q"), a: t("faq_3_a") },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">{t("faq_title")}</h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-2">{faq.q}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTASection() {
  const t = useTranslations("landing");

  return (
    <div className="rounded-2xl border bg-foreground text-background p-10 md:p-14 text-center">
      <div className="flex justify-center mb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background/10">
          <Shield className="h-7 w-7" />
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("cta_title")}</h2>
      <p className="text-background/70 mb-8 max-w-md mx-auto text-sm leading-relaxed">
        {t("cta_subtitle")}
      </p>
      <Link href="/auth/register">
        <Button size="lg" variant="secondary" className="min-w-44 gap-2">
          {t("cta_button")}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
