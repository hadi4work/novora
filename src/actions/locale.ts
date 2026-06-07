"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

export async function setLocale(locale: Locale) {
  if (!isValidLocale(locale)) return { success: false };

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return { success: true };
}
