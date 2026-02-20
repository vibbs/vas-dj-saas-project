import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

export default getRequestConfig(async () => {
  // Priority: cookie > Accept-Language header > default
  let locale: Locale = defaultLocale;

  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("locale")?.value;
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
      locale = cookieLocale as Locale;
    } else {
      const headerStore = await headers();
      const acceptLanguage = headerStore.get("Accept-Language") ?? "";
      const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.trim();
      if (preferred && locales.includes(preferred as Locale)) {
        locale = preferred as Locale;
      }
    }
  } catch {
    // Fallback to default locale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
