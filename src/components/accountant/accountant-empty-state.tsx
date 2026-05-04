"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrgDialog } from "./org-dialog";
import type { AccountantOrg } from "./org-list";

interface Props {
  onOrgAdded: (org: AccountantOrg) => void;
}

export function AccountantEmptyState({ onOrgAdded }: Props) {
  const tAc = useTranslations("accountant");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <FolderOpen className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">{tAc("no_orgs_title")}</h2>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">
        {tAc("no_orgs_desc")}
      </p>
      <Button className="gap-2" onClick={() => setDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        {tAc("add_organization")}
      </Button>

      <OrgDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={(org) => {
          onOrgAdded(org);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
