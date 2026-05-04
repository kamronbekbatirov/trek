"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Building2, User, Laptop, Leaf, Users,
  ChevronRight, ChevronLeft, Check, Zap, Globe,
} from "lucide-react";

export interface OrgFormData {
  name: string;
  orgType: string;
  taxRegime: string;
  hasEmployees: boolean | null;
  assets: string[];
  specialActivities: string[];
  pensionFund: string[];
}

interface Props {
  initial?: Partial<OrgFormData>;
  onSave: (data: OrgFormData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

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
      type="button"
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
      type="button"
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

const INITIAL: OrgFormData = {
  name: "",
  orgType: "",
  taxRegime: "",
  hasEmployees: null,
  assets: [],
  specialActivities: [],
  pensionFund: [],
};

// Step IDs
type StepId = "name" | "orgType" | "taxRegime" | "employees" | "assets" | "activities" | "pension";

function getStepIds(state: OrgFormData): StepId[] {
  const steps: StepId[] = ["name", "orgType"];
  const isLegal = ["LLC", "JSC"].includes(state.orgType);
  const isIE = state.orgType === "IE";
  const isFarm = state.orgType === "FARM";
  const isSelfEmployed = state.orgType === "SELF_EMPLOYED";

  if (isLegal || isIE) steps.push("taxRegime");
  if (isLegal || isIE || isFarm) steps.push("employees");
  if (isLegal || isIE || isFarm) steps.push("assets");
  if (!isSelfEmployed && state.orgType) steps.push("activities");
  if (state.hasEmployees === true) steps.push("pension");
  return steps;
}

function canGoNext(stepId: StepId, state: OrgFormData): boolean {
  if (stepId === "name") return state.name.trim().length > 0;
  if (stepId === "orgType") return !!state.orgType;
  if (stepId === "taxRegime") return !!state.taxRegime;
  if (stepId === "employees") return state.hasEmployees !== null;
  return true;
}

export function OrgFormWizard({ initial, onSave, onCancel, saving }: Props) {
  const tOb = useTranslations("onboarding");
  const tAc = useTranslations("accountant");

  const [state, setStateRaw] = useState<OrgFormData>({ ...INITIAL, ...initial });
  const setState = (partial: Partial<OrgFormData>) =>
    setStateRaw((prev) => ({ ...prev, ...partial }));

  const [stepIdx, setStepIdx] = useState(0);

  // Recompute steps on each render based on current state
  const steps = getStepIds(state);
  const currentStepId = steps[stepIdx] ?? steps[steps.length - 1];
  const isLastStep = stepIdx >= steps.length - 1;

  const goNext = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1));
  const goBack = () => {
    if (stepIdx === 0) onCancel();
    else setStepIdx((i) => i - 1);
  };

  const isFarm = state.orgType === "FARM";
  const isTurnover = state.taxRegime === "TURNOVER";
  const isVAT = state.taxRegime === "VAT";

  // Assets step needs useEffect so it must be a component
  function AssetsContent() {
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
    const opts = [
      ...(!isFarm ? [{ key: "property", title: tOb("asset_property_title"), hint: tOb("asset_property_hint") }] : []),
      { key: "land_non_agri", title: tOb("asset_land_nonag_title"), hint: tOb("asset_land_nonag_hint") },
      { key: "land_agri", title: tOb("asset_land_ag_title"), hint: tOb("asset_land_ag_hint") },
      { key: "water", title: tOb("asset_water_title"), hint: tOb("asset_water_hint") },
    ];
    return (
      <>
        <h2 className="text-lg font-bold mb-1">{tOb("assets_title")}</h2>
        <p className="text-muted-foreground text-sm mb-5">
          {isFarm ? tOb("assets_farm_desc") : tOb("assets_desc")}
        </p>
        <div className="space-y-2.5">
          {opts.map((opt) => (
            <CheckOption
              key={opt.key}
              checked={state.assets.includes(opt.key)}
              onChange={() => toggle(opt.key)}
              title={opt.title}
              hint={opt.hint}
            />
          ))}
        </div>
      </>
    );
  }

  const stepContent: Record<StepId, React.ReactNode> = {
    name: (
      <>
        <h2 className="text-lg font-bold mb-1">{tAc("step_name")}</h2>
        <p className="text-muted-foreground text-sm mb-5">{tAc("org_name")}</p>
        <input
          value={state.name}
          onChange={(e) => setState({ name: e.target.value })}
          placeholder={tAc("org_name_placeholder")}
          className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter" && state.name.trim()) goNext(); }}
        />
      </>
    ),
    orgType: (
      <>
        <h2 className="text-lg font-bold mb-1">{tOb("org_type_title")}</h2>
        <p className="text-muted-foreground text-sm mb-5">{tOb("org_type_desc")}</p>
        <div className="space-y-2.5">
          {[
            { value: "LLC", icon: Building2, title: tOb("org_llc_title"), hint: tOb("org_llc_hint") },
            { value: "IE", icon: User, title: tOb("org_ie_title"), hint: tOb("org_ie_hint") },
            { value: "SELF_EMPLOYED", icon: Laptop, title: tOb("org_self_title"), hint: tOb("org_self_hint") },
            { value: "FARM", icon: Leaf, title: tOb("org_farm_title"), hint: tOb("org_farm_hint") },
          ].map((opt) => (
            <CardOption
              key={opt.value}
              selected={state.orgType === opt.value}
              onClick={() => setState({ orgType: opt.value, taxRegime: "", hasEmployees: null, assets: [], specialActivities: [], pensionFund: [] })}
              icon={opt.icon}
              title={opt.title}
              hint={opt.hint}
            />
          ))}
        </div>
      </>
    ),
    taxRegime: (
      <>
        <h2 className="text-lg font-bold mb-1">{tOb("regime_title")}</h2>
        <p className="text-muted-foreground text-sm mb-5">{tOb("regime_desc")}</p>
        <div className="space-y-2.5 mb-4">
          <CardOption selected={state.taxRegime === "VAT"} onClick={() => setState({ taxRegime: "VAT" })} icon={Zap} title={tOb("regime_vat_title")} hint={tOb("regime_vat_hint")} />
          <CardOption selected={state.taxRegime === "TURNOVER"} onClick={() => setState({ taxRegime: "TURNOVER" })} icon={Globe} title={tOb("regime_turnover_title")} hint={tOb("regime_turnover_hint")} />
        </div>
        <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
          {tOb("regime_note")}
        </div>
      </>
    ),
    employees: (
      <>
        <h2 className="text-lg font-bold mb-1">{tOb("employees_title")}</h2>
        <p className="text-muted-foreground text-sm mb-5">{tOb("employees_desc")}</p>
        <div className="space-y-2.5">
          <CardOption selected={state.hasEmployees === true} onClick={() => setState({ hasEmployees: true })} icon={Users} title={tOb("emp_yes_title")} hint={tOb("emp_yes_hint")} />
          <CardOption selected={state.hasEmployees === false} onClick={() => setState({ hasEmployees: false })} icon={User} title={tOb("emp_no_title")} hint={tOb("emp_no_hint")} />
        </div>
      </>
    ),
    assets: <AssetsContent />,
    activities: (
      <>
        <h2 className="text-lg font-bold mb-1">{tOb("activities_title")}</h2>
        <p className="text-muted-foreground text-sm mb-5">{tOb("activities_desc")}</p>
        <div className="space-y-2">
          {[
            { key: "non_resident_income", title: tOb("act_nonresident_title"), hint: tOb("act_nonresident_hint"), hide: false },
            { key: "dividends", title: tOb("act_dividends_title"), hint: tOb("act_dividends_hint"), hide: false },
            { key: "alcohol_tobacco", title: tOb("act_alcohol_title"), hint: tOb("act_alcohol_hint"), hide: false },
            { key: "excise", title: tOb("act_excise_title"), hint: tOb("act_excise_hint"), hide: isFarm || isTurnover },
            { key: "subsoil", title: tOb("act_subsoil_title"), hint: tOb("act_subsoil_hint"), hide: isFarm || isTurnover },
            { key: "high_revenue_20b", title: tOb("act_highrev_title"), hint: tOb("act_highrev_hint"), hide: !isVAT || isFarm },
            { key: "cfc", title: tOb("act_cfc_title"), hint: tOb("act_cfc_hint"), hide: isFarm },
            { key: "controlled_transactions", title: tOb("act_controlled_title"), hint: tOb("act_controlled_hint"), hide: isFarm },
            { key: "online_kkt", title: tOb("act_kkt_title"), hint: tOb("act_kkt_hint"), hide: isFarm },
          ].filter((o) => !o.hide).map((opt) => (
            <CheckOption
              key={opt.key}
              checked={state.specialActivities.includes(opt.key)}
              onChange={() => {
                const cur = state.specialActivities;
                setState({ specialActivities: cur.includes(opt.key) ? cur.filter((x) => x !== opt.key) : [...cur, opt.key] });
              }}
              title={opt.title}
              hint={opt.hint}
            />
          ))}
        </div>
      </>
    ),
    pension: (
      <>
        <h2 className="text-lg font-bold mb-1">{tOb("pension_title")}</h2>
        <p className="text-muted-foreground text-sm mb-5">{tOb("pension_desc")}</p>
        <div className="space-y-2.5">
          {[
            { key: "disabled_child", title: tOb("pension_disabled_title"), hint: tOb("pension_disabled_hint") },
            { key: "loss_of_breadwinner", title: tOb("pension_loss_title"), hint: tOb("pension_loss_hint") },
          ].map((opt) => (
            <CheckOption
              key={opt.key}
              checked={state.pensionFund.includes(opt.key)}
              onChange={() => {
                const cur = state.pensionFund;
                setState({ pensionFund: cur.includes(opt.key) ? cur.filter((x) => x !== opt.key) : [...cur, opt.key] });
              }}
              title={opt.title}
              hint={opt.hint}
            />
          ))}
        </div>
      </>
    ),
  };

  const progress = steps.length > 1 ? Math.round((stepIdx / (steps.length - 1)) * 100) : 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{stepIdx + 1} / {steps.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        {stepContent[currentStepId]}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={goBack} className="gap-1 shrink-0">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{tOb("back")}</span>
        </Button>
        {isLastStep ? (
          <Button type="button" className="flex-1" onClick={() => onSave(state)} disabled={saving || !canGoNext(currentStepId, state)}>
            {saving ? tAc("saving") : tAc("save")}
          </Button>
        ) : (
          <Button type="button" className="flex-1 gap-2" onClick={goNext} disabled={!canGoNext(currentStepId, state)}>
            {tOb("next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
