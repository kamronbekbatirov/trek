"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";

interface UserProfile {
  orgType?: string | null;
  taxRegime?: string | null;
  hasEmployees?: boolean | null;
  assets?: string[];
  specialActivities?: string[];
  pensionFund?: string[];
}

interface TaxProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: UserProfile;
}

function CheckBox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={onChange}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors
          ${checked ? "bg-primary border-primary" : "border-muted-foreground/40 group-hover:border-primary/50"}`}
      >
        {checked && (
          <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-medium leading-tight">{label}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

function toggleArr(arr: string[], key: string) {
  return arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];
}

export function TaxProfileDialog({ open, onOpenChange, userProfile }: TaxProfileDialogProps) {
  const t = useTranslations("settings");
  const tAuth = useTranslations("auth");
  const router = useRouter();

  const [orgType, setOrgType] = useState(userProfile.orgType ?? "");
  const [taxRegime, setTaxRegime] = useState(userProfile.taxRegime ?? "");
  const [hasEmployees, setHasEmployees] = useState<boolean | null>(userProfile.hasEmployees ?? null);
  const [assets, setAssets] = useState<string[]>(userProfile.assets ?? []);
  const [specialActivities, setSpecialActivities] = useState<string[]>(userProfile.specialActivities ?? []);
  const [pensionFund, setPensionFund] = useState<string[]>(userProfile.pensionFund ?? []);
  const [saving, setSaving] = useState(false);

  const isSelfEmployed = orgType === "SELF_EMPLOYED";
  const isFarm = orgType === "FARM";
  const showTaxRegime = orgType && !isSelfEmployed && !isFarm;
  const showEmployees = orgType && !isSelfEmployed;
  const showAssets = ["LLC", "JSC", "IE", "FARM"].includes(orgType);
  const showPension = ["LLC", "JSC"].includes(orgType) && hasEmployees === true;
  const isTurnover = taxRegime === "TURNOVER";
  const hiddenActivity = new Set(isTurnover || isFarm || isSelfEmployed ? ["excise", "subsoil", "high_revenue_20b"] : []);

  const ASSET_KEYS = [
    { key: "property", label: t("asset_property"), hint: t("asset_property_hint") },
    { key: "land_non_agri", label: t("asset_land_non_ag"), hint: t("asset_land_non_ag_hint") },
    { key: "land_agri", label: t("asset_land_ag"), hint: t("asset_land_ag_hint") },
    { key: "water", label: t("asset_water"), hint: t("asset_water_hint") },
  ];
  const ACTIVITY_KEYS = [
    { key: "non_resident_income", label: t("act_non_resident") },
    { key: "dividends", label: t("act_dividends") },
    { key: "alcohol_tobacco", label: t("act_alcohol") },
    { key: "excise", label: t("act_excise") },
    { key: "subsoil", label: t("act_subsoil") },
    { key: "high_revenue_20b", label: t("act_high_revenue") },
    { key: "cfc", label: t("act_cfc") },
    { key: "controlled_transactions", label: t("act_controlled_tx") },
    { key: "online_kkt", label: t("act_kkt") },
  ];
  const PENSION_KEYS = [
    { key: "disabled_child", label: t("pension_disabled_child") },
    { key: "loss_of_breadwinner", label: t("pension_breadwinner") },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgType, taxRegime, hasEmployees, assets, specialActivities, pensionFund }),
      });
      onOpenChange(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("tax_profile")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Org type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("org_type")}</Label>
              <Select value={orgType} onValueChange={(v) => { setOrgType(v); setTaxRegime(""); }}>
                <SelectTrigger><SelectValue placeholder={t("select_placeholder")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLC">{tAuth("org_llc")}</SelectItem>
                  <SelectItem value="JSC">{tAuth("org_jsc")}</SelectItem>
                  <SelectItem value="IE">{tAuth("org_ie")}</SelectItem>
                  <SelectItem value="SELF_EMPLOYED">{tAuth("org_self")}</SelectItem>
                  <SelectItem value="FARM">{tAuth("org_farm")}</SelectItem>
                  <SelectItem value="ACCOUNTANT">{t("accountant")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showTaxRegime && (
              <div className="space-y-2">
                <Label>{t("tax_regime")}</Label>
                <Select value={taxRegime} onValueChange={setTaxRegime}>
                  <SelectTrigger><SelectValue placeholder={t("select_placeholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT">{tAuth("regime_vat")}</SelectItem>
                    <SelectItem value="TURNOVER">{tAuth("regime_turnover")}</SelectItem>
                    <SelectItem value="BOTH">{tAuth("regime_both")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Has employees */}
          {showEmployees && (
            <div className="space-y-2">
              <Label>{t("has_employees")}</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setHasEmployees(true)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${hasEmployees === true ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                >
                  {t("has_employees_yes")}
                </button>
                <button
                  onClick={() => setHasEmployees(false)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all
                    ${hasEmployees === false ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                >
                  {t("has_employees_no")}
                </button>
              </div>
            </div>
          )}

          {/* Assets */}
          {showAssets && (
            <div className="space-y-2">
              <Label>{t("assets_label")}</Label>
              <div className="space-y-2.5">
                {ASSET_KEYS.map((opt) => (
                  <CheckBox
                    key={opt.key}
                    checked={assets.includes(opt.key)}
                    onChange={() => setAssets(toggleArr(assets, opt.key))}
                    label={opt.label}
                    hint={opt.hint}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Special activities */}
          <div className="space-y-2">
            <Label>{t("activities_label")}</Label>
            <div className="space-y-2.5">
              {ACTIVITY_KEYS.filter((o) => !hiddenActivity.has(o.key)).map((opt) => (
                <CheckBox
                  key={opt.key}
                  checked={specialActivities.includes(opt.key)}
                  onChange={() => setSpecialActivities(toggleArr(specialActivities, opt.key))}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Pension */}
          {showPension && (
            <div className="space-y-2">
              <Label>{t("pension_label")}</Label>
              <div className="space-y-2.5">
                {PENSION_KEYS.map((opt) => (
                  <CheckBox
                    key={opt.key}
                    checked={pensionFund.includes(opt.key)}
                    onChange={() => setPensionFund(toggleArr(pensionFund, opt.key))}
                    label={opt.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel") ?? "Отмена"}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
