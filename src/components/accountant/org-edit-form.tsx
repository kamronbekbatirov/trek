"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Building2, User, Laptop, Leaf, Users,
  Check, Zap, Globe,
} from "lucide-react";
import type { OrgFormData } from "./org-form-wizard";

interface Props {
  initial: OrgFormData;
  onSave: (data: OrgFormData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

function CardOption({
  selected, onClick, icon: Icon, title, hint, small,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  hint: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 transition-all flex items-center gap-2.5
        ${small ? "p-3" : "p-4"}
        ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
    >
      <div className={`flex shrink-0 items-center justify-center rounded-lg
        ${small ? "h-8 w-8" : "h-10 w-10"}
        ${selected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
        <Icon className={small ? "h-4 w-4" : "h-5 w-5"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${small ? "text-xs" : "text-sm"}`}>{title}</p>
        {!small && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
    </button>
  );
}

function CheckOption({
  checked, onChange, title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-2.5
        ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
    >
      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2
        ${checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
        {checked && <Check className="h-3 w-3" />}
      </div>
      <p className="font-medium text-sm">{title}</p>
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}

export function OrgEditForm({ initial, onSave, onCancel, saving }: Props) {
  const tOb = useTranslations("onboarding");
  const tAc = useTranslations("accountant");

  const [state, setStateRaw] = useState<OrgFormData>(initial);
  const setState = (p: Partial<OrgFormData>) => setStateRaw((prev) => ({ ...prev, ...p }));

  const isFarm = state.orgType === "FARM";
  const isSelfEmployed = state.orgType === "SELF_EMPLOYED";
  const isLegal = ["LLC", "JSC"].includes(state.orgType);
  const isIE = state.orgType === "IE";
  const showTaxRegime = isLegal || isIE;
  const showEmployees = isLegal || isIE || isFarm;
  const showActivities = !isSelfEmployed;
  const showPension = state.hasEmployees === true;
  const isTurnover = state.taxRegime === "TURNOVER";
  const isVAT = state.taxRegime === "VAT";

  // Auto-preset assets for FARM
  useEffect(() => {
    if (isFarm && state.assets.length === 0) {
      setState({ assets: ["land_agri", "water"] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFarm]);

  const toggleArr = (key: string, arr: string[], setter: (v: string[]) => void) =>
    setter(arr.includes(key) ? arr.filter((x) => x !== key) : [...arr, key]);

  const orgTypeOptions = [
    { value: "LLC", icon: Building2, title: tOb("org_llc_title"), hint: "" },
    { value: "IE", icon: User, title: tOb("org_ie_title"), hint: "" },
    { value: "SELF_EMPLOYED", icon: Laptop, title: tOb("org_self_title"), hint: "" },
    { value: "FARM", icon: Leaf, title: tOb("org_farm_title"), hint: "" },
  ];

  const assetOptions = [
    ...(!isFarm ? [{ key: "property", title: tOb("asset_property_title") }] : []),
    { key: "land_non_agri", title: tOb("asset_land_nonag_title") },
    { key: "land_agri", title: tOb("asset_land_ag_title") },
    { key: "water", title: tOb("asset_water_title") },
  ];

  const activityOptions = [
    { key: "non_resident_income", title: tOb("act_nonresident_title"), hide: false },
    { key: "dividends", title: tOb("act_dividends_title"), hide: false },
    { key: "alcohol_tobacco", title: tOb("act_alcohol_title"), hide: false },
    { key: "excise", title: tOb("act_excise_title"), hide: isFarm || isTurnover },
    { key: "subsoil", title: tOb("act_subsoil_title"), hide: isFarm || isTurnover },
    { key: "high_revenue_20b", title: tOb("act_highrev_title"), hide: !isVAT || isFarm },
    { key: "cfc", title: tOb("act_cfc_title"), hide: isFarm },
    { key: "controlled_transactions", title: tOb("act_controlled_title"), hide: isFarm },
    { key: "online_kkt", title: tOb("act_kkt_title"), hide: isFarm },
  ].filter((o) => !o.hide);

  return (
    <div className="space-y-5">
      {/* Name */}
      <Section label={tAc("org_name")}>
        <input
          value={state.name}
          onChange={(e) => setState({ name: e.target.value })}
          placeholder={tAc("org_name_placeholder")}
          className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </Section>

      {/* Org type */}
      <Section label={tAc("step_org_type")}>
        <div className="grid grid-cols-2 gap-2">
          {orgTypeOptions.map((opt) => (
            <CardOption
              key={opt.value}
              selected={state.orgType === opt.value}
              onClick={() => setState({ orgType: opt.value, taxRegime: "", hasEmployees: null, assets: [], specialActivities: [], pensionFund: [] })}
              icon={opt.icon}
              title={opt.title}
              hint={opt.hint}
              small
            />
          ))}
        </div>
      </Section>

      {/* Tax regime */}
      {showTaxRegime && (
        <Section label={tAc("step_tax_regime")}>
          <div className="grid grid-cols-2 gap-2">
            <CardOption selected={state.taxRegime === "VAT"} onClick={() => setState({ taxRegime: "VAT" })} icon={Zap} title={tOb("regime_vat_title")} hint="" small />
            <CardOption selected={state.taxRegime === "TURNOVER"} onClick={() => setState({ taxRegime: "TURNOVER" })} icon={Globe} title={tOb("regime_turnover_title")} hint="" small />
          </div>
        </Section>
      )}

      {/* Employees */}
      {showEmployees && (
        <Section label={tAc("step_employees")}>
          <div className="grid grid-cols-2 gap-2">
            <CardOption selected={state.hasEmployees === true} onClick={() => setState({ hasEmployees: true })} icon={Users} title={tOb("emp_yes_title")} hint="" small />
            <CardOption selected={state.hasEmployees === false} onClick={() => setState({ hasEmployees: false })} icon={User} title={tOb("emp_no_title")} hint="" small />
          </div>
        </Section>
      )}

      {/* Assets */}
      {showEmployees && (
        <Section label={tAc("step_assets")}>
          <div className="grid grid-cols-2 gap-2">
            {assetOptions.map((opt) => (
              <CheckOption
                key={opt.key}
                checked={state.assets.includes(opt.key)}
                onChange={() => toggleArr(opt.key, state.assets, (v) => setState({ assets: v }))}
                title={opt.title}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Special activities */}
      {showActivities && activityOptions.length > 0 && (
        <Section label={tAc("step_activities")}>
          <div className="grid grid-cols-1 gap-2">
            {activityOptions.map((opt) => (
              <CheckOption
                key={opt.key}
                checked={state.specialActivities.includes(opt.key)}
                onChange={() => toggleArr(opt.key, state.specialActivities, (v) => setState({ specialActivities: v }))}
                title={opt.title}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Pension */}
      {showPension && (
        <Section label={tAc("step_pension")}>
          <div className="grid grid-cols-1 gap-2">
            {[
              { key: "disabled_child", title: tOb("pension_disabled_title") },
              { key: "loss_of_breadwinner", title: tOb("pension_loss_title") },
            ].map((opt) => (
              <CheckOption
                key={opt.key}
                checked={state.pensionFund.includes(opt.key)}
                onChange={() => toggleArr(opt.key, state.pensionFund, (v) => setState({ pensionFund: v }))}
                title={opt.title}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="shrink-0">
          {tAc("cancel")}
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() => onSave(state)}
          disabled={saving || !state.name.trim() || !state.orgType || (showTaxRegime && !state.taxRegime) || (showEmployees && state.hasEmployees === null)}
        >
          {saving ? tAc("saving") : tAc("save")}
        </Button>
      </div>
    </div>
  );
}
