import { Prisma } from "@prisma/client";

export interface OrgProfile {
  orgType: string;
  taxRegime?: string | null;
  hasEmployees?: boolean | null;
  assets?: string[];
  specialActivities?: string[];
  pensionFund?: string[];
}

/**
 * Builds a filter matching events for ANY of the given org profiles.
 * Returns { id: "never-match" } when orgs array is empty (shows nothing).
 */
export function buildMultiOrgFilter(orgs: OrgProfile[]): Prisma.TaxEventWhereInput {
  if (orgs.length === 0) return { id: "never-match" };
  if (orgs.length === 1) {
    return buildProfileFilter({ ...orgs[0], onboardingDone: true });
  }
  return {
    OR: orgs.map((org) => buildProfileFilter({ ...org, onboardingDone: true })),
  };
}

interface UserProfile {
  orgType?: string | null;
  taxRegime?: string | null;
  hasEmployees?: boolean | null;
  assets?: string[];
  specialActivities?: string[];
  pensionFund?: string[];
  onboardingDone?: boolean;
}

/**
 * Builds a Prisma WHERE clause that filters TaxEvents by the user's tax profile.
 * Returns {} if no filtering should be applied (accountant, onboarding not done, etc.)
 */
export function buildProfileFilter(user: UserProfile): Prisma.TaxEventWhereInput {
  const shouldFilter =
    user.onboardingDone && user.orgType && user.orgType !== "ACCOUNTANT";
  if (!shouldFilter) return {};

  const conditions: Prisma.TaxEventWhereInput[] = [];

  // 1. orgType
  conditions.push({
    OR: [
      { orgTypes: { isEmpty: true } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { orgTypes: { has: user.orgType as any } },
    ],
  });

  // 2. taxRegime (not applicable for SELF_EMPLOYED / FARM)
  if (
    user.taxRegime &&
    user.orgType !== "SELF_EMPLOYED" &&
    user.orgType !== "FARM"
  ) {
    conditions.push({
      OR: [
        { taxRegimes: { isEmpty: true } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { taxRegimes: { has: user.taxRegime as any } },
      ],
    });
  }

  // 3. requiresEmployees (null = no requirement)
  if (user.hasEmployees !== null && user.hasEmployees !== undefined) {
    conditions.push({
      OR: [
        { requiresEmployees: null },
        { requiresEmployees: user.hasEmployees },
      ],
    });
  }

  // 4. requiresAssets — show if event has no asset requirement OR user has ≥1 matching asset
  const assets = user.assets ?? [];
  if (assets.length > 0) {
    conditions.push({
      OR: [
        { requiresAssets: { isEmpty: true } },
        { requiresAssets: { hasSome: assets } },
      ],
    });
  } else {
    conditions.push({ requiresAssets: { isEmpty: true } });
  }

  // 5. requiresSpecial — show if event has no special requirement OR user has ≥1 match
  const special = user.specialActivities ?? [];
  if (special.length > 0) {
    conditions.push({
      OR: [
        { requiresSpecial: { isEmpty: true } },
        { requiresSpecial: { hasSome: special } },
      ],
    });
  } else {
    conditions.push({ requiresSpecial: { isEmpty: true } });
  }

  // 6. requiresPension — show if event has no pension requirement OR user has ≥1 match
  const pension = user.pensionFund ?? [];
  if (pension.length > 0) {
    conditions.push({
      OR: [
        { requiresPension: { isEmpty: true } },
        { requiresPension: { hasSome: pension } },
      ],
    });
  } else {
    conditions.push({ requiresPension: { isEmpty: true } });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}
