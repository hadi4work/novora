import type { ContentLanguage } from "@/lib/i18n/detect-language";

export function pdfFontFamily(lang: ContentLanguage): string {
  return lang === "ar" ? "NotoSansArabic" : "Helvetica";
}

export function patchPdfStyle<T extends Record<string, unknown>>(
  style: T,
  lang: ContentLanguage
): T {
  const patched: Record<string, unknown> = { ...style };
  const ff = patched.fontFamily as string | undefined;

  if (ff === "Helvetica-Bold") {
    patched.fontFamily = pdfFontFamily(lang);
    patched.fontWeight = "bold";
  } else if (ff === "Helvetica") {
    patched.fontFamily = pdfFontFamily(lang);
  }

  if (lang === "ar") {
    if (patched.textAlign === "left") {
      patched.textAlign = "right";
    } else if (patched.textAlign === "justify") {
      patched.textAlign = "right";
    } else if (!patched.textAlign) {
      patched.textAlign = "right";
    }

    if (typeof patched.marginLeft === "number") {
      patched.marginRight = patched.marginLeft;
      delete patched.marginLeft;
    }
  }

  return patched as T;
}

export function patchPdfStyles<T extends Record<string, Record<string, unknown>>>(
  styles: T,
  lang: ContentLanguage
): T {
  const result = {} as T;
  for (const key of Object.keys(styles)) {
    result[key as keyof T] = patchPdfStyle(styles[key as keyof T], lang);
  }
  return result;
}
