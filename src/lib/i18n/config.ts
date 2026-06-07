export const LOCALES = ["en", "ar", "fr", "ru", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "novora_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  ru: "Русский",
  de: "Deutsch",
};

export const RTL_LOCALES: Locale[] = ["ar"];

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
