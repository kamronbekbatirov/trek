"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Building2 } from "lucide-react";
import { OrgDialog } from "./org-dialog";

export interface AccountantOrg {
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
  orgs: AccountantOrg[];
  isPro: boolean;
  onOrgsChange: (orgs: AccountantOrg[]) => void;
}

const ORG_TYPE_LABELS: Record<string, string> = {
  LLC: "ООО", JSC: "АО", IE: "ИП", SELF_EMPLOYED: "Самозанятый", FARM: "Фермерское хоз-во",
};

export function OrgList({ orgs, isPro, onOrgsChange }: Props) {
  const tAc = useTranslations("accountant");
  const [editOrg, setEditOrg] = useState<AccountantOrg | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const FREE_LIMIT = 3;
  const canAdd = isPro || orgs.length < FREE_LIMIT;

  const handleAdd = () => {
    setEditOrg(null);
    setDialogOpen(true);
  };

  const handleEdit = (org: AccountantOrg) => {
    setEditOrg(org);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/accountant/orgs/${id}`, { method: "DELETE" });
      if (res.ok) {
        onOrgsChange(orgs.filter((o) => o.id !== id));
      }
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleSaved = (saved: AccountantOrg) => {
    if (editOrg) {
      onOrgsChange(orgs.map((o) => (o.id === saved.id ? saved : o)));
    } else {
      onOrgsChange([...orgs, saved]);
    }
  };

  return (
    <div>
      {orgs.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-center">
          <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-sm">{tAc("no_orgs_title")}</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">{tAc("no_orgs_desc")}</p>
          <Button onClick={handleAdd}>{tAc("add_organization")}</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div key={org.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{org.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ORG_TYPE_LABELS[org.orgType] ?? org.orgType}
                  {org.taxRegime && ` · ${org.taxRegime === "VAT" ? "НДС" : "Налог с оборота"}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleEdit(org)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {confirmDeleteId === org.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs px-2"
                      disabled={deletingId === org.id}
                      onClick={() => handleDelete(org.id)}
                    >
                      {deletingId === org.id ? "..." : tAc("delete_organization")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      {tAc("cancel")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDeleteId(org.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1">
            <Button onClick={handleAdd} disabled={!canAdd} variant={canAdd ? "default" : "outline"}>
              {tAc("add_organization")}
            </Button>
            {!isPro && (
              <p className="text-xs text-muted-foreground">
                {orgs.length} / {FREE_LIMIT} (Free)
              </p>
            )}
          </div>

          {!isPro && orgs.length >= FREE_LIMIT && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-200">
              {tAc("org_limit_reached")}
            </div>
          )}
        </div>
      )}

      <OrgDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editOrg={editOrg}
        onSaved={handleSaved}
      />
    </div>
  );
}
