"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Building2, User, Laptop, Leaf, Users,
  Check, Zap, Globe,
} from "lucide-react";

interface ProfileData {
  orgType: string;
  taxRegime: string;
  hasEmployees: boolean | null;
  assets: string[];
  specialActivities: string[];
  pensionFund: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CardOption({
  selected, onClick, icon: Icon, title, hint, small,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  hint?: string;
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
        {hint && !small && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
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

function SectionLabel({ label }: { label: string }) {
  return <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>;
}

const INITIAL: ProfileData = {
  orgType: "",
  taxRegime: "",
  hasEmployees: null,
  assets: [],
  specialActivities: [],
  pensionFund: [],
};

export function SwitchAccountTypeDialog({ open, onOpenChange }: Props) {
  const tOb = useTranslations("onboarding");
  const tAc = useTranslations("accountant");

  const [state, setStateRaw] = useState<ProfileData>(INITIAL);
  const setState = (p: Partial<ProfileData>) => setStateRaw((prev) => ({ ...prev, ...p }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFarm = state.orgType === "FARM";
  const isSelfEmployed = state.orgType === "SELF_EMPLOYED";
  const isLegal = ["LLC", "JSC"].includes(state.orgType);
  const isIE = state.orgType === "IE";
  const showTaxRegime = isLegal || isIE;
  const showEmployees = isLegal || isIE || isFarm;
  const showActivities = !isSelfEmployed && !!state.orgType;
  const showPension = state.hasEmployees === true;
  const isTurnover = state.taxRegime === "TURNOVER";
  const isVAT = state.taxRegime === "VAT";

  useEffect(() => {
    if (isFarm && state.assets.length === 0) {
      setState({ assets: ["land_agri", "water"] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFarm]);

  const canSave =
    !!state.orgType &&
    (!showTaxRegime || !!state.taxRegime) &&
    (!showEmployees || state.hasEmployees !== null);

  const toggleArr = (key: string, arr: string[], setter: (v: string[]) => void) =>
    setter(arr.includes(key) ? arr.filter((x) => x !== key) : [...arr, key]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgType: state.orgType,
          taxRegime: state.taxRegime || null,
          hasEmployees: state.hasEmployees,
          assets: state.assets,
          specialActivities: state.specialActivities,
          pensionFund: state.pensionFund,
          onboardingDone: true,
        }),
      });
      if (!res.ok) {
        setError("Ошибка сохранения");
        return;
      }
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const orgTypeOptions = [
    { value: "LLC", icon: Building2, title: tOb("org_llc_title") },
    { value: "IE", icon: User, title: tOb("org_ie_title") },
    { value: "SELF_EMPLOYED", icon: Laptop, title: tOb("org_self_title") },
    { value: "FARM", icon: Leaf, title: tOb("org_farm_title") },
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tAc("switch_account_type")}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2 mb-1">{tAc("switch_to_regular_desc")}</p>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Org type */}
          <div>
            <SectionLabel label={tAc("step_org_type")} />
            <div className="grid grid-cols-2 gap-2">
              {orgTypeOptions.map((opt) => (
                <CardOption
                  key={opt.value}
                  selected={state.orgType === opt.value}
                  onClick={() => setState({ orgType: opt.value, taxRegime: "", hasEmployees: null, assets: [], specialActivities: [], pensionFund: [] })}
                  icon={opt.icon}
                  title={opt.title}
                  small
                />
              ))}
            </div>
          </div>

          {/* Tax regime */}
          {showTaxRegime && (
            <div>
              <SectionLabel label={tAc("step_tax_regime")} />
              <div className="grid grid-cols-2 gap-2">
                <CardOption selected={state.taxRegime === "VAT"} onClick={() => setState({ taxRegime: "VAT" })} icon={Zap} title={tOb("regime_vat_title")} small />
                <CardOption selected={state.taxRegime === "TURNOVER"} onClick={() => setState({ taxRegime: "TURNOVER" })} icon={Globe} title={tOb("regime_turnover_title")} small />
              </div>
            </div>
          )}

          {/* Employees */}
          {showEmployees && (
            <div>
              <SectionLabel label={tAc("step_employees")} />
              <div className="grid grid-cols-2 gap-2">
                <CardOption selected={state.hasEmployees === true} onClick={() => setState({ hasEmployees: true })} icon={Users} title={tOb("emp_yes_title")} small />
                <CardOption selected={state.hasEmployees === false} onClick={() => setState({ hasEmployees: false })} icon={User} title={tOb("emp_no_title")} small />
              </div>
            </div>
          )}

          {/* Assets */}
          {showEmployees && (
            <div>
              <SectionLabel label={tAc("step_assets")} />
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
            </div>
          )}

          {/* Special activities */}
          {showActivities && activityOptions.length > 0 && (
            <div>
              <SectionLabel label={tAc("step_activities")} />
              <div className="space-y-1.5">
                {activityOptions.map((opt) => (
                  <CheckOption
                    key={opt.key}
                    checked={state.specialActivities.includes(opt.key)}
                    onChange={() => toggleArr(opt.key, state.specialActivities, (v) => setState({ specialActivities: v }))}
                    title={opt.title}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pension */}
          {showPension && (
            <div>
              <SectionLabel label={tAc("step_pension")} />
              <div className="space-y-1.5">
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
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="shrink-0">
              {tAc("cancel")}
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !canSave}
            >
              {saving ? tAc("saving") : tAc("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
