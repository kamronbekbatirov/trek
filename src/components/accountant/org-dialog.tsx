"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgFormWizard, OrgFormData } from "./org-form-wizard";
import { OrgEditForm } from "./org-edit-form";

interface AccountantOrg {
  id: string;
  name: string;
  orgType: string;
  taxRegime: string | null;
  hasEmployees: boolean | null;
  assets: string[];
  specialActivities: string[];
  pensionFund: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editOrg?: AccountantOrg | null;
  onSaved: (org: AccountantOrg) => void;
}

export function OrgDialog({ open, onOpenChange, editOrg, onSaved }: Props) {
  const tAc = useTranslations("accountant");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: OrgFormData) => {
    setSaving(true);
    setError(null);
    try {
      let res: Response;
      if (editOrg) {
        res = await fetch(`/api/accountant/orgs/${editOrg.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch("/api/accountant/orgs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      if (res.status === 403) {
        const json = await res.json();
        if (json.error === "limit_reached") {
          setError(tAc("org_limit_reached"));
          return;
        }
      }

      if (!res.ok) {
        setError("Error saving organization");
        return;
      }

      const json = await res.json();
      onSaved(json.org);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const initial: Partial<OrgFormData> | undefined = editOrg
    ? {
        name: editOrg.name,
        orgType: editOrg.orgType,
        taxRegime: editOrg.taxRegime ?? "",
        hasEmployees: editOrg.hasEmployees,
        assets: editOrg.assets,
        specialActivities: editOrg.specialActivities,
        pensionFund: editOrg.pensionFund,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editOrg ? tAc("edit_organization") : tAc("add_organization")}
          </DialogTitle>
        </DialogHeader>
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm text-destructive mb-4">
            {error}
          </div>
        )}
        {editOrg && initial ? (
          <OrgEditForm
            key={editOrg.id}
            initial={initial as OrgFormData}
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
            saving={saving}
          />
        ) : (
          <OrgFormWizard
            key="new"
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
            saving={saving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
