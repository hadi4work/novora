import type { Locale } from "@/lib/i18n/config";
import { ar } from "./ar";
import { de } from "./de";
import { en } from "./en";
import type { Messages } from "./en";
import { fr } from "./fr";
import { ru } from "./ru";

const catalogs: Record<Locale, Messages> = { en, ar, fr, ru, de };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs.en;
}

export type { Messages };
