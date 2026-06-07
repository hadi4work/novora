import {
  detectLanguageFromText,
  type ContentLanguage,
} from "@/lib/i18n/detect-language";
import type { ResumeOutput } from "@/lib/validations/resume";

export function getResumeContentLanguage(data: ResumeOutput): ContentLanguage {
  const { sections } = data;
  return detectLanguageFromText(
    sections.header.name,
    sections.summary,
    sections.experience
      .map((e) => `${e.title} ${e.company} ${e.bullets.join(" ")}`)
      .join(" "),
    sections.education.map((e) => `${e.institution} ${e.degree}`).join(" "),
    sections.skills.join(" ")
  ) as ContentLanguage;
}

export function isResumeRtl(lang: ContentLanguage) {
  return lang === "ar";
}

export function resumeContactLine(header: ResumeOutput["sections"]["header"]) {
  return [header.email, header.phone, header.location].filter(Boolean).join(" · ");
}

export type ParsedPhoto = {
  type: "png" | "jpg";
  data: Buffer;
};

export function parsePhotoDataUrl(photoUrl?: string): ParsedPhoto | null {
  if (!photoUrl) return null;
  const match = photoUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/i);
  if (!match) return null;
  const type = match[1].toLowerCase() === "png" ? "png" : "jpg";
  return { type, data: Buffer.from(match[2], "base64") };
}
