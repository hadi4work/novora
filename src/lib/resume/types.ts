import type { ResumeOutput } from "@/lib/validations/resume";

export const RESUME_TEMPLATES = [
  "executive",
  "modern",
  "creative",
  "corporate",
  "classic",
  "ats",
  "professional",
] as const;

export type ResumeTemplateId = (typeof RESUME_TEMPLATES)[number];

export const LANGUAGE_LEVELS = [
  "native",
  "fluent",
  "advanced",
  "intermediate",
  "basic",
] as const;

export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export function resolveTemplate(template: ResumeTemplateId): Exclude<ResumeTemplateId, "professional"> {
  return template === "professional" ? "classic" : template;
}

export function formatLanguageEntry(
  entry: { name: string; level: string },
  levelLabel?: string
): string {
  const level = levelLabel ?? entry.level;
  return level ? `${entry.name} — ${level}` : entry.name;
}

export function normalizeLanguages(
  languages?: ResumeOutput["sections"]["languages"]
): { name: string; level: string }[] {
  if (!languages?.length) return [];
  return languages.map((item) =>
    typeof item === "string"
      ? { name: item, level: "" }
      : { name: item.name, level: item.level }
  );
}
