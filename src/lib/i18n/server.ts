import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  isRtlLocale,
  isValidLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { translate } from "@/lib/i18n/translate";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value && isValidLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerTranslations() {
  const locale = await getServerLocale();
  const messages = getMessages(locale);

  return {
    locale,
    dir: isRtlLocale(locale) ? ("rtl" as const) : ("ltr" as const),
    messages,
    t: (key: string, params?: Record<string, string | number>) =>
      translate(messages, key, params),
  };
}
