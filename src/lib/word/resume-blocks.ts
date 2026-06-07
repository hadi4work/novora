import { AlignmentType, Paragraph, TextRun } from "docx";
import {
  RESUME_LEVEL_LABELS,
  RESUME_PDF_LABELS,
  type ContentLanguage,
} from "@/lib/i18n/detect-language";
import { formatLanguageEntry } from "@/lib/resume/types";
import type { MainBlock } from "@/lib/resume/paginate";
import { wordParaRtl, wordRunRtl, wordTextAlign } from "@/lib/word/rtl-helpers";

export type WordBlockTheme = {
  sectionColor: string;
  bodyColor: string;
  metaColor: string;
  sectionAlign?: (typeof AlignmentType)[keyof typeof AlignmentType];
};

function formatLang(
  entry: { name: string; level: string },
  lang: ContentLanguage
) {
  const levelLabel = RESUME_LEVEL_LABELS[lang][entry.level] ?? entry.level;
  return formatLanguageEntry(entry, levelLabel);
}

function sectionHeading(text: string, rtl: boolean, theme: WordBlockTheme) {
  return new Paragraph({
    ...wordParaRtl(rtl),
    alignment: theme.sectionAlign ?? wordTextAlign(rtl),
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 20,
        color: theme.sectionColor,
        ...wordRunRtl(rtl),
      }),
    ],
  });
}

function bodyParagraph(text: string, rtl: boolean, theme: WordBlockTheme) {
  return new Paragraph({
    ...wordParaRtl(rtl),
    alignment: wordTextAlign(rtl),
    spacing: { after: 100 },
    children: [
      new TextRun({
        text,
        size: 18,
        color: theme.bodyColor,
        ...wordRunRtl(rtl),
      }),
    ],
  });
}

function bulletParagraph(text: string, rtl: boolean, theme: WordBlockTheme) {
  if (rtl) {
    return bodyParagraph(`• ${text}`, rtl, theme);
  }

  return new Paragraph({
    alignment: AlignmentType.START,
    bullet: { level: 0 },
    children: [
      new TextRun({
        text,
        size: 18,
        color: theme.bodyColor,
      }),
    ],
  });
}

export function blocksToParagraphs(
  blocks: MainBlock[],
  contentLang: ContentLanguage,
  rtl: boolean,
  theme: WordBlockTheme
): Paragraph[] {
  const labels = RESUME_PDF_LABELS[contentLang];
  const paragraphs: Paragraph[] = [];

  for (const block of blocks) {
    if (block.kind === "summary") {
      paragraphs.push(sectionHeading(labels.summary, rtl, theme));
      paragraphs.push(bodyParagraph(block.text, rtl, theme));
      continue;
    }
    if (block.kind === "heading") {
      paragraphs.push(sectionHeading(labels[block.section], rtl, theme));
      continue;
    }
    if (block.kind === "experience") {
      const exp = block.item;
      paragraphs.push(
        new Paragraph({
          ...wordParaRtl(rtl),
          alignment: wordTextAlign(rtl),
          children: [
            new TextRun({
              text: `${exp.title} — ${exp.company}`,
              bold: true,
              size: 18,
              color: theme.bodyColor,
              ...wordRunRtl(rtl),
            }),
          ],
        })
      );
      paragraphs.push(
        new Paragraph({
          ...wordParaRtl(rtl),
          alignment: wordTextAlign(rtl),
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: exp.period,
              italics: true,
              size: 16,
              color: theme.metaColor,
              ...wordRunRtl(rtl),
            }),
          ],
        })
      );
      for (const bullet of exp.bullets) {
        paragraphs.push(bulletParagraph(bullet, rtl, theme));
      }
      continue;
    }
    if (block.kind === "education") {
      const edu = block.item;
      paragraphs.push(
        new Paragraph({
          ...wordParaRtl(rtl),
          alignment: wordTextAlign(rtl),
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 18,
              color: theme.bodyColor,
              ...wordRunRtl(rtl),
            }),
          ],
        })
      );
      const meta = `${edu.institution}${edu.period ? ` · ${edu.period}` : ""}`;
      paragraphs.push(bodyParagraph(meta, rtl, theme));
      continue;
    }
    if (block.kind === "skills") {
      paragraphs.push(bodyParagraph(block.items.join(" · "), rtl, theme));
      continue;
    }
    if (block.kind === "languages") {
      paragraphs.push(
        bodyParagraph(
          block.items.map((lang) => formatLang(lang, contentLang)).join(" · "),
          rtl,
          theme
        )
      );
    }
  }

  return paragraphs;
}
