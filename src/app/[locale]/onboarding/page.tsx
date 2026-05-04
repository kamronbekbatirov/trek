"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Building2, User, Laptop, Leaf, FolderOpen,
  ChevronRight, ChevronLeft, Check,
  Bell, Calendar, Users, Zap, Globe, Info,
  Sun, Moon, ChevronDown, Crown, Sparkles,
} from "lucide-react";
import { TrekiChat } from "@/components/onboarding/treki-chat";

const localeNames: Record<string, string> = {
  ru: "Рус", en: "Eng", uz: "Uzb", uzc: "Ўзб",
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface OnboardingState {
  orgType: string;
  taxRegime: string;
  hasEmployees: boolean | null;
  assets: string[];
  specialActivities: string[];
  pensionFund: string[];
  reminderDays: number[];
  language: string;
  name: string;
}

const INITIAL: OnboardingState = {
  orgType: "",
  taxRegime: "",
  hasEmployees: null,
  assets: [],
  specialActivities: [],
  pensionFund: [],
  reminderDays: [7, 3, 1],
  language: "ru",
  name: "",
};

// ─── Step logic ──────────────────────────────────────────────────────────────
function getSteps(state: OnboardingState): number[] {
  const steps = [1, 2];
  const isLegal = ["LLC", "JSC"].includes(state.orgType);
  const isIE = state.orgType === "IE";
  const isFarm = state.orgType === "FARM";
  const isSelfEmployed = state.orgType === "SELF_EMPLOYED";

  if (isLegal || isIE) steps.push(3);                        // tax regime
  if (isLegal || isIE || isFarm) steps.push(4);             // employees
  if (isLegal || isIE || isFarm) steps.push(5);             // assets — now includes FARM
  if (!isSelfEmployed) steps.push(6);                        // special activities — skip for self-employed
  if (state.hasEmployees === true) steps.push(7);            // pension — all orgs with employees
  steps.push(8);                                             // reminders + language
  steps.push(9);                                             // done
  return steps;
}

// ─── Card selector ───────────────────────────────────────────────────────────
function CardOption({
  selected, onClick, icon: Icon, title, hint,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  hint: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3
        ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg mt-0.5
        ${selected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>
      </div>
      {selected && <Check className="h-5 w-5 text-primary ml-auto shrink-0 mt-0.5" />}
    </button>
  );
}

// ─── Checkbox option ─────────────────────────────────────────────────────────
function CheckOption({
  checked, onChange, title, hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3
        ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
    >
      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 mt-0.5
        ${checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
        {checked && <Check className="h-3 w-3" />}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm">{title}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
      </div>
    </button>
  );
}

// ─── Toggle chip ─────────────────────────────────────────────────────────────
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all
        ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40"}`}
    >
      {children}
    </button>
  );
}

// ─── Nav buttons ─────────────────────────────────────────────────────────────
function NavButtons({
  onBack, onNext, nextDisabled = false, nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  const t = useTranslations("onboarding");
  return (
    <div className="flex gap-3 pt-2">
      <Button variant="outline" onClick={onBack} className="gap-1 shrink-0">
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{t("back")}</span>
      </Button>
      <Button className="flex-1 gap-2" onClick={onNext} disabled={nextDisabled}>
        {nextLabel ?? t("next")}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════════════════════

function Screen1({ state, setState, onNext }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void; onNext: () => void }) {
  const t = useTranslations("onboarding");
  return (
    <div>
      <div className="flex justify-center mb-5">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
          <Calendar className="h-7 w-7 text-primary-foreground" />
        </div>
      </div>
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{t("welcome_title")}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("welcome_desc")}
        </p>
      </div>

      <div className="space-y-1.5 mb-6">
        <label className="text-sm font-medium">{t("name_label")} <span className="text-muted-foreground font-normal">({t("optional")})</span></label>
        <input
          value={state.name}
          onChange={(e) => setState({ name: e.target.value })}
          placeholder={t("name_placeholder")}
          className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button size="lg" className="w-full gap-2" onClick={onNext}>
        {t("start_btn")}
        <ChevronRight className="h-4 w-4" />
      </Button>

      <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
        {t("terms_prefix")}{" "}
        <a href="/terms" target="_blank" className="underline">{t("terms_offer")}</a>
        {" "}{t("terms_and")}{" "}
        <a href="/privacy" target="_blank" className="underline">{t("terms_privacy")}</a>
        {t("terms_consent")}
      </p>
    </div>
  );
}

function Screen2({ state, setState, onNext, onBack }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void; onNext: () => void; onBack: () => void }) {
  const t = useTranslations("onboarding");
  const options = [
    { value: "LLC", icon: Building2, title: t("org_llc_title"), hint: t("org_llc_hint") },
    { value: "IE", icon: User, title: t("org_ie_title"), hint: t("org_ie_hint") },
    { value: "SELF_EMPLOYED", icon: Laptop, title: t("org_self_title"), hint: t("org_self_hint") },
    { value: "FARM", icon: Leaf, title: t("org_farm_title"), hint: t("org_farm_hint") },
    { value: "ACCOUNTANT", icon: FolderOpen, title: t("org_acct_title"), hint: t("org_acct_hint") },
  ];

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{t("org_type_title")}</h2>
      <p className="text-muted-foreground text-sm mb-5">{t("org_type_desc")}</p>

      <div className="space-y-2.5 mb-4">
        {options.map((opt) => (
          <CardOption
            key={opt.value}
            selected={state.orgType === opt.value}
            onClick={() => setState({ orgType: opt.value })}
            icon={opt.icon}
            title={opt.title}
            hint={opt.hint}
          />
        ))}
      </div>

      {state.orgType === "ACCOUNTANT" && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-foreground mb-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>{t("accountant_info")}</span>
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!state.orgType} />
    </div>
  );
}

function Screen3({ state, setState, onNext, onBack }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void; onNext: () => void; onBack: () => void }) {
  const t = useTranslations("onboarding");
  const options = [
    { value: "VAT", title: t("regime_vat_title"), hint: t("regime_vat_hint") },
    { value: "TURNOVER", title: t("regime_turnover_title"), hint: t("regime_turnover_hint") },
  ];

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{t("regime_title")}</h2>
      <p className="text-muted-foreground text-sm mb-5">{t("regime_desc")}</p>

      <div className="space-y-2.5 mb-4">
        {options.map((opt) => (
          <CardOption
            key={opt.value}
            selected={state.taxRegime === opt.value}
            onClick={() => setState({ taxRegime: opt.value })}
            icon={opt.value === "VAT" ? Zap : Globe}
            title={opt.title}
            hint={opt.hint}
          />
        ))}
      </div>

      <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground mb-5">
        {t("regime_note")}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!state.taxRegime} />
    </div>
  );
}

function Screen4({ state, setState, onNext, onBack }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void; onNext: () => void; onBack: () => void }) {
  const t = useTranslations("onboarding");
  const isIE = state.orgType === "IE";

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{t("employees_title")}</h2>
      <p className="text-muted-foreground text-sm mb-5">{t("employees_desc")}</p>

      <div className="space-y-2.5 mb-4">
        <CardOption
          selected={state.hasEmployees === true}
          onClick={() => setState({ hasEmployees: true })}
          icon={Users}
          title={t("emp_yes_title")}
          hint={t("emp_yes_hint")}
        />
        <CardOption
          selected={state.hasEmployees === false}
          onClick={() => setState({ hasEmployees: false })}
          icon={User}
          title={t("emp_no_title")}
          hint={t("emp_no_hint")}
        />
      </div>

      {isIE && (
        <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground mb-5">
          <strong>{t("ie_note_prefix")}</strong>{t("ie_note_text")}
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={state.hasEmployees === null} />
    </div>
  );
}

function Screen5({ state, setState, onNext, onBack }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void; onNext: () => void; onBack: () => void }) {
  const t = useTranslations("onboarding");
  const isFarm = state.orgType === "FARM";

  useEffect(() => {
    if (isFarm && state.assets.length === 0) {
      setState({ assets: ["land_agri", "water"] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (key: string) => {
    const cur = state.assets;
    setState({ assets: cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key] });
  };

  const options = [
    ...(!isFarm ? [{ key: "property", title: t("asset_property_title"), hint: t("asset_property_hint") }] : []),
    { key: "land_non_agri", title: t("asset_land_nonag_title"), hint: t("asset_land_nonag_hint") },
    { key: "land_agri", title: t("asset_land_ag_title"), hint: t("asset_land_ag_hint") },
    { key: "water", title: t("asset_water_title"), hint: t("asset_water_hint") },
  ];

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{t("assets_title")}</h2>
      <p className="text-muted-foreground text-sm mb-5">
        {isFarm ? t("assets_farm_desc") : t("assets_desc")}
      </p>

      <div className="space-y-2.5 mb-6">
        {options.map((opt) => (
          <CheckOption
            key={opt.key}
            checked={state.assets.includes(opt.key)}
            onChange={() => toggle(opt.key)}
            title={opt.title}
            hint={opt.hint}
          />
        ))}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function Screen6({ state, setState, onNext, onBack }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void; onNext: () => void; onBack: () => void }) {
  const t = useTranslations("onboarding");
  const { orgType, taxRegime } = state;
  const isFarm = orgType === "FARM";
  const isTurnover = taxRegime === "TURNOVER";
  const isVAT = taxRegime === "VAT";

  const toggle = (key: string) => {
    const cur = state.specialActivities;
    setState({ specialActivities: cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key] });
  };

  const allOptions = [
    { key: "non_resident_income",      title: t("act_nonresident_title"),  hint: t("act_nonresident_hint"),  hide: false },
    { key: "dividends",                title: t("act_dividends_title"),    hint: t("act_dividends_hint"),    hide: false },
    { key: "alcohol_tobacco",          title: t("act_alcohol_title"),      hint: t("act_alcohol_hint"),      hide: false },
    { key: "excise",                   title: t("act_excise_title"),       hint: t("act_excise_hint"),       hide: isFarm || isTurnover },
    { key: "subsoil",                  title: t("act_subsoil_title"),      hint: t("act_subsoil_hint"),      hide: isFarm || isTurnover },
    { key: "high_revenue_20b",         title: t("act_highrev_title"),      hint: t("act_highrev_hint"),      hide: !isVAT || isFarm },
    { key: "cfc",                      title: t("act_cfc_title"),          hint: t("act_cfc_hint"),          hide: isFarm },
    { key: "controlled_transactions",  title: t("act_controlled_title"),   hint: t("act_controlled_hint"),   hide: isFarm },
    { key: "online_kkt",               title: t("act_kkt_title"),          hint: t("act_kkt_hint"),          hide: isFarm },
  ];

  const options = allOptions.filter((o) => !o.hide);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{t("activities_title")}</h2>
      <p className="text-muted-foreground text-sm mb-5">{t("activities_desc")}</p>

      <div className="space-y-2 mb-6">
        {options.map((opt) => (
          <CheckOption
            key={opt.key}
            checked={state.specialActivities.includes(opt.key)}
            onChange={() => toggle(opt.key)}
            title={opt.title}
            hint={opt.hint}
          />
        ))}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function Screen7({ state, setState, onNext, onBack }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void; onNext: () => void; onBack: () => void }) {
  const t = useTranslations("onboarding");
  const toggle = (key: string) => {
    const cur = state.pensionFund;
    setState({ pensionFund: cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key] });
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{t("pension_title")}</h2>
      <p className="text-muted-foreground text-sm mb-5">{t("pension_desc")}</p>

      <div className="space-y-2.5 mb-6">
        <CheckOption
          checked={state.pensionFund.includes("disabled_child")}
          onChange={() => toggle("disabled_child")}
          title={t("pension_disabled_title")}
          hint={t("pension_disabled_hint")}
        />
        <CheckOption
          checked={state.pensionFund.includes("loss_of_breadwinner")}
          onChange={() => toggle("loss_of_breadwinner")}
          title={t("pension_loss_title")}
          hint={t("pension_loss_hint")}
        />
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function Screen8({ state, setState, onNext, onBack }: { state: OnboardingState; setState: (s: Partial<OnboardingState>) => void; onNext: () => void; onBack: () => void }) {
  const t = useTranslations("onboarding");
  const toggleDay = (d: number) => {
    const cur = state.reminderDays;
    setState({ reminderDays: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d] });
  };

  const dayLabel = (d: number) => {
    if (d === 1) return t("day_1", { d });
    if (d === 3) return t("day_3", { d });
    return t("day_7", { d });
  };

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{t("reminders_title")}</h2>
      <p className="text-muted-foreground text-sm mb-5">{t("reminders_desc")}</p>

      <div className="mb-5">
        <p className="text-sm font-medium mb-2.5">{t("language_label")}</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { code: "ru", label: "Русский" },
            { code: "uz", label: "O'zbek (Lotin)" },
            { code: "uzc", label: "Ўзбекча (Кирилл)" },
            { code: "en", label: "English" },
          ].map((l) => (
            <Chip key={l.code} active={state.language === l.code} onClick={() => setState({ language: l.code })}>
              {l.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-sm font-medium mb-2.5">{t("days_label")}</p>
        <div className="flex gap-2 flex-wrap">
          {[7, 3, 1].map((d) => (
            <Chip key={d} active={state.reminderDays.includes(d)} onClick={() => toggleDay(d)}>
              {dayLabel(d)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground mb-5 flex items-start gap-2">
        <Bell className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{t("notifications_note")}</span>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel={t("finish_btn")} />
    </div>
  );
}

function Screen9({ state, onFinish, onProUpgrade, loading }: { state: OnboardingState; onFinish: () => void; onProUpgrade: () => void; loading: boolean }) {
  const t = useTranslations("onboarding");

  const orgLabels: Record<string, string> = {
    LLC: t("org_label_llc"), IE: t("org_label_ie"), SELF_EMPLOYED: t("org_label_self"),
    FARM: t("org_label_farm"), ACCOUNTANT: t("org_label_acct"),
  };
  const regimeLabels: Record<string, string> = {
    VAT: t("regime_label_vat"), TURNOVER: t("regime_label_turnover"), BOTH: t("regime_label_both"),
  };

  const isSelfEmployed = state.orgType === "SELF_EMPLOYED";

  return (
    <div>
      <div className="flex justify-center mb-5">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
          <Check className="h-7 w-7 text-primary-foreground" />
        </div>
      </div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-1.5">{t("done_title")}</h2>
        <p className="text-muted-foreground text-sm">{t("done_desc")}</p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border bg-muted/20 p-4 mb-4 space-y-2.5">
        {state.orgType && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("org_type_label")}</span>
            <span className="font-medium">{orgLabels[state.orgType] ?? "—"}</span>
          </div>
        )}
        {state.taxRegime && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("regime_label")}</span>
            <span className="font-medium">{regimeLabels[state.taxRegime] ?? "—"}</span>
          </div>
        )}
        {state.hasEmployees !== null && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("employees_label")}</span>
            <span className="font-medium">{state.hasEmployees ? t("emp_has") : t("emp_none")}</span>
          </div>
        )}
        {state.reminderDays.length > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("reminders_label")}</span>
            <span className="font-medium">
              {state.reminderDays.sort((a, b) => b - a).map((d) => t("reminder_chip", { d })).join(", ")}
            </span>
          </div>
        )}
      </div>

      {isSelfEmployed && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-foreground mb-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>{t("selfemployed_note")}</span>
        </div>
      )}

      {/* Pro upgrade CTA */}
      <div className="rounded-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20 p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">{t("pro_upgrade_badge")}</span>
            <h3 className="text-sm font-bold leading-tight">{t("pro_upgrade_title")}</h3>
          </div>
        </div>
        <ul className="space-y-1.5 mb-4">
          {[t("pro_upgrade_feature_1"), t("pro_upgrade_feature_2"), t("pro_upgrade_feature_3"), t("pro_upgrade_feature_4")].map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
              <Check className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          size="lg"
          className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-200 dark:shadow-purple-900/30"
          onClick={onProUpgrade}
          disabled={loading}
        >
          <Sparkles className="h-4 w-4" />
          {t("pro_upgrade_btn")}
        </Button>
      </div>

      <button
        onClick={onFinish}
        disabled={loading}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 disabled:opacity-50"
      >
        {loading ? t("saving") : t("free_continue")}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [state, setStateRaw] = useState<OnboardingState>(INITIAL);
  const [loading, setLoading] = useState(false);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setLangOpen(false);
  };

  const setState = (partial: Partial<OnboardingState>) =>
    setStateRaw((prev) => ({ ...prev, ...partial }));

  const steps = getSteps(state);
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = steps[stepIdx];
  const totalSteps = steps.length;

  const goNext = () => { if (stepIdx < totalSteps - 1) setStepIdx((i) => i + 1); };
  const goBack = () => { if (stepIdx > 0) setStepIdx((i) => i - 1); };
  const recalcAndNext = (patch: Partial<OnboardingState>) => { setState(patch); goNext(); };

  const saveOnboarding = async () => {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("Onboarding error:", data);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await saveOnboarding();
      window.location.href = "/dashboard";
    } catch (e) {
      console.error("Onboarding fetch error:", e);
      window.location.href = "/dashboard";
    }
  };

  const handleProUpgrade = async () => {
    setLoading(true);
    try {
      await saveOnboarding();
      window.location.href = "/billing";
    } catch (e) {
      console.error("Onboarding fetch error:", e);
      window.location.href = "/billing";
    }
  };

  const screenProps = { state, setState, onNext: goNext, onBack: goBack };

  // Progress: hide on first and last step
  const showProgress = currentStep !== 1 && currentStep !== 9;
  const progressPct = totalSteps <= 1 ? 100 : Math.round((stepIdx / (totalSteps - 1)) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="flex items-center justify-between h-12">
            <span className="font-brand text-xl tracking-tight">Trek</span>
            <div className="flex items-center gap-1">
              {showProgress && (
                <span className="text-xs text-muted-foreground mr-2">
                  {t("step_of", { n: stepIdx + 1, total: totalSteps })}
                </span>
              )}
              {/* Theme toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {/* Language switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  className="h-8 px-2 flex items-center gap-1 rounded-md border text-xs hover:bg-muted transition-colors"
                >
                  {localeNames[locale]}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border bg-popover shadow-md z-50">
                    {Object.entries(localeNames).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => switchLocale(code)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg ${code === locale ? "font-semibold" : ""}`}
                      >
                        {name} — {{ ru: "Русский", en: "English", uz: "O'zbek", uzc: "Ўзбек" }[code]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {showProgress && (
            <div className="h-1 bg-muted rounded-full overflow-hidden mb-0 -mx-4">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1">
        <div className="container mx-auto px-4 max-w-lg py-6 pb-10">
          <div className="bg-card rounded-2xl border shadow-sm p-5 sm:p-7">
            {currentStep === 1 && <Screen1 state={state} setState={setState} onNext={goNext} />}
            {currentStep === 2 && <Screen2 {...screenProps} onNext={() => recalcAndNext({})} />}
            {currentStep === 3 && <Screen3 {...screenProps} />}
            {currentStep === 4 && <Screen4 {...screenProps} />}
            {currentStep === 5 && <Screen5 {...screenProps} />}
            {currentStep === 6 && <Screen6 {...screenProps} />}
            {currentStep === 7 && <Screen7 {...screenProps} />}
            {currentStep === 8 && <Screen8 {...screenProps} />}
            {currentStep === 9 && <Screen9 state={state} onFinish={handleFinish} onProUpgrade={handleProUpgrade} loading={loading} />}
          </div>
        </div>
      </div>

      {/* Treki AI chat assistant */}
      <TrekiChat currentStep={currentStep} currentState={state} />

    </div>
  );
}
