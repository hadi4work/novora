import type { Locale } from "@/lib/i18n/config";

export type ContentLanguage = Locale | "en";

export function detectLanguageFromText(...parts: (string | undefined | null)[]): ContentLanguage {
  const text = parts.filter(Boolean).join(" ");

  if (/[\u0600-\u06FF\u0750-\u077F]/.test(text)) return "ar";
  if (/[\u0400-\u04FF]/.test(text)) return "ru";
  if (/[äöüßÄÖÜ]/.test(text)) return "de";
  if (/[àâäéèêëïîôùûüçœæÀÂÄÉÈÊËÏÎÔÙÛÜŸ]/.test(text)) return "fr";

  return "en";
}

export const AI_LANGUAGE_RULE = `LANGUAGE RULE (critical):
- Detect the primary language of the user's input fields.
- Write ALL generated text (captions, descriptions, resume sections, bullets, hashtags, CTAs) in that same language.
- If input is Arabic → output Arabic. French → French. Russian → Russian. German → German. English → English.
- Keep JSON keys in English; only translate string values.
- For mixed-language input, use the dominant language.`;

export const RESUME_LEVEL_LABELS: Record<ContentLanguage, Record<string, string>> = {
  en: {
    native: "Native",
    fluent: "Fluent",
    advanced: "Advanced",
    intermediate: "Intermediate",
    basic: "Basic",
  },
  ar: {
    native: "لغة أم",
    fluent: "طلاقة",
    advanced: "متقدم",
    intermediate: "متوسط",
    basic: "مبتدئ",
  },
  fr: {
    native: "Langue maternelle",
    fluent: "Courant",
    advanced: "Avancé",
    intermediate: "Intermédiaire",
    basic: "Débutant",
  },
  ru: {
    native: "Родной",
    fluent: "Свободно",
    advanced: "Продвинутый",
    intermediate: "Средний",
    basic: "Базовый",
  },
  de: {
    native: "Muttersprache",
    fluent: "Fließend",
    advanced: "Fortgeschritten",
    intermediate: "Mittel",
    basic: "Grundkenntnisse",
  },
};

export const RESUME_PDF_LABELS: Record<
  ContentLanguage,
  { summary: string; experience: string; education: string; skills: string; languages: string }
> = {
  en: {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
  },
  ar: {
    summary: "الملخص",
    experience: "الخبرة",
    education: "التعليم",
    skills: "المهارات",
    languages: "اللغات",
  },
  fr: {
    summary: "Résumé",
    experience: "Expérience",
    education: "Formation",
    skills: "Compétences",
    languages: "Langues",
  },
  ru: {
    summary: "Резюме",
    experience: "Опыт работы",
    education: "Образование",
    skills: "Навыки",
    languages: "Языки",
  },
  de: {
    summary: "Zusammenfassung",
    experience: "Berufserfahrung",
    education: "Ausbildung",
    skills: "Fähigkeiten",
    languages: "Sprachen",
  },
};
