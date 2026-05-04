"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Org {
  id: string;
  name: string;
}

interface Props {
  orgs: Org[];
  selectedOrgId?: string | null;
  extraParams?: Record<string, string>;
}

export function OrgSelector({ orgs, selectedOrgId, extraParams }: Props) {
  const tAc = useTranslations("accountant");
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (value: string) => {
    const params = new URLSearchParams();
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => params.set(k, v));
    }
    if (value !== "all") {
      params.set("orgId", value);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <Select value={selectedOrgId ?? "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px] h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{tAc("all_orgs")}</SelectItem>
        {orgs.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
