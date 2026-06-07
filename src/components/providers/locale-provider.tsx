"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/actions/locale";
import {
  isRtlLocale,
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import { translate } from "@/lib/i18n/translate";

type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  messages: Messages;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  locales: readonly Locale[];
  localeLabels: typeof LOCALE_LABELS;
  isPending: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const messages = useMemo(() => getMessages(locale), [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(messages, key, params),
    [messages]
  );

  const changeLocale = useCallback(
    (next: Locale) => {
      startTransition(async () => {
        await setLocale(next);
        router.refresh();
      });
    },
    [router]
  );

  const value = useMemo(
    () => ({
      locale,
      dir: isRtlLocale(locale) ? ("rtl" as const) : ("ltr" as const),
      messages,
      t,
      setLocale: changeLocale,
      locales: LOCALES,
      localeLabels: LOCALE_LABELS,
      isPending,
    }),
    [locale, messages, t, changeLocale, isPending]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslations(namespace?: string) {
  const { t, locale, dir, setLocale, locales, localeLabels, isPending } =
    useLocale();

  return {
    t: (key: string, params?: Record<string, string | number>) =>
      t(namespace ? `${namespace}.${key}` : key, params),
    locale,
    dir,
    setLocale,
    locales,
    localeLabels,
    isPending,
  };
}
