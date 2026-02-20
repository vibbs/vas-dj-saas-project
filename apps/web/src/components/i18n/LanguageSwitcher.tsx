"use client";

import { useLocale } from "next-intl";
import { locales, localeNames, type Locale } from "@/i18n/config";

/**
 * Language switcher dropdown.
 * Sets a `locale` cookie that next-intl reads on the server.
 */
export function LanguageSwitcher() {
  const currentLocale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale;
    document.cookie = `locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    window.location.reload();
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      aria-label="Select language"
      style={{
        padding: "4px 8px",
        borderRadius: "6px",
        border: "1px solid var(--color-border, #e5e7eb)",
        backgroundColor: "var(--color-surface, #fff)",
        color: "var(--color-text, #111)",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {localeNames[locale]}
        </option>
      ))}
    </select>
  );
}
