"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { OrgList, type AccountantOrg } from "./org-list";
import { TaxProfileDialog } from "@/components/calendar/tax-profile-dialog";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPro: boolean;
}

export function OrgManagerSheet({ open, onOpenChange, isPro }: Props) {
  const tAc = useTranslations("accountant");
  const router = useRouter();
  const [orgs, setOrgs] = useState<AccountantOrg[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchTypeOpen, setSwitchTypeOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/accountant/orgs")
      .then((r) => r.json())
      .then((data) => setOrgs(data.orgs ?? []))
      .finally(() => setLoading(false));
  }, [open]);

  const handleOrgsChange = (newOrgs: AccountantOrg[]) => {
    setOrgs(newOrgs);
    router.refresh();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{tAc("my_organizations")}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <OrgList orgs={orgs} isPro={isPro} onOrgsChange={handleOrgsChange} />
            )}
          </div>
          <div className="px-6 py-4 border-t shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setSwitchTypeOpen(true)}
            >
              {tAc("switch_account_type")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <TaxProfileDialog
        open={switchTypeOpen}
        onOpenChange={setSwitchTypeOpen}
        userProfile={{}}
      />
    </>
  );
}
