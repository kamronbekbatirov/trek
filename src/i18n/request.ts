import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { headers } from "next/headers";

export default getRequestConfig(async ({ requestLocale }) => {
  // Try requestLocale first (set via setRequestLocale in layouts/pages)
  let locale = await requestLocale;

  // Fall back to header set by middleware
  if (!locale || !routing.locales.includes(locale as never)) {
    const headersList = await headers();
    const localeFromHeader = headersList.get("x-next-intl-locale");
    if (localeFromHeader && routing.locales.includes(localeFromHeader as never)) {
      locale = localeFromHeader;
    } else {
      locale = routing.defaultLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
