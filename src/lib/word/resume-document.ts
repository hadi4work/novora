import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  PageBreak,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import {
  RESUME_LEVEL_LABELS,
  RESUME_PDF_LABELS,
} from "@/lib/i18n/detect-language";
import {
  getResumeContentLanguage,
  isResumeRtl,
  parsePhotoDataUrl,
  resumeContactLine,
} from "@/lib/resume/export-meta";
import { paginateResume } from "@/lib/resume/paginate";
import { formatLanguageEntry, normalizeLanguages, resolveTemplate } from "@/lib/resume/types";
import { blocksToParagraphs, type WordBlockTheme } from "@/lib/word/resume-blocks";
import { wordParaRtl, wordRunRtl, wordTextAlign } from "@/lib/word/rtl-helpers";
import type { ResumeOutput } from "@/lib/validations/resume";

const NO_BORDERS = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function sideParagraph(
  text: string,
  rtl: boolean,
  opts: {
    bold?: boolean;
    color?: string;
    size?: number;
    center?: boolean;
    spacingAfter?: number;
  } = {}
) {
  return new Paragraph({
    ...wordParaRtl(rtl),
    alignment: wordTextAlign(rtl, opts.center),
    spacing: { after: opts.spacingAfter ?? 80 },
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        color: opts.color ?? "F8FAFC",
        size: opts.size ?? 16,
        ...wordRunRtl(rtl),
      }),
    ],
  });
}

function photoParagraph(photo: NonNullable<ReturnType<typeof parsePhotoDataUrl>>) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new ImageRun({
        type: photo.type,
        data: photo.data,
        transformation: { width: 88, height: 88 },
      }),
    ],
  });
}

function buildSidebarParagraphs(
  data: ResumeOutput,
  rtl: boolean,
  theme: { text: string; muted: string }
) {
  const { sections } = data;
  const contentLang = getResumeContentLanguage(data);
  const labels = RESUME_PDF_LABELS[contentLang];
  const languages = normalizeLanguages(sections.languages);
  const photo = parsePhotoDataUrl(sections.header.photoUrl);
  const paragraphs: Paragraph[] = [];

  if (photo) paragraphs.push(photoParagraph(photo));

  paragraphs.push(
    sideParagraph(sections.header.name, rtl, {
      bold: true,
      size: 28,
      center: true,
      color: theme.text,
    })
  );
  paragraphs.push(
    sideParagraph(resumeContactLine(sections.header), rtl, {
      size: 14,
      center: true,
      color: theme.muted,
      spacingAfter: 160,
    })
  );
  paragraphs.push(
    sideParagraph(labels.skills.toUpperCase(), rtl, {
      bold: true,
      size: 16,
      color: theme.muted,
    })
  );
  for (const skill of sections.skills) {
    paragraphs.push(sideParagraph(`• ${skill}`, rtl, { size: 14, color: theme.text }));
  }
  if (languages.length > 0) {
    paragraphs.push(
      sideParagraph(labels.languages.toUpperCase(), rtl, {
        bold: true,
        size: 16,
        color: theme.muted,
        spacingAfter: 80,
      })
    );
    for (const lang of languages) {
      const levelLabel = lang.level
        ? RESUME_LEVEL_LABELS[contentLang][lang.level] ?? lang.level
        : "";
      paragraphs.push(
        sideParagraph(formatLanguageEntry(lang, levelLabel), rtl, {
          size: 14,
          color: theme.text,
        })
      );
    }
  }

  return paragraphs;
}

function sidebarTableCell(
  paragraphs: Paragraph[],
  fill: string,
  widthPct: number
) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill },
    margins: { top: 280, bottom: 280, left: 280, right: 280 },
    borders: NO_BORDERS,
    children: paragraphs,
  });
}

function mainTableCell(paragraphs: Paragraph[], widthPct: number) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: "FFFFFF" },
    margins: { top: 320, bottom: 320, left: 320, right: 320 },
    borders: NO_BORDERS,
    children: paragraphs,
  });
}

function twoColumnPage(
  data: ResumeOutput,
  pageBlocks: ReturnType<typeof paginateResume>["mainPages"][number],
  rtl: boolean,
  options: {
    sidebarFill: string;
    sidebarText: string;
    sidebarMuted: string;
    sidebarWidth: number;
    mainTheme: WordBlockTheme;
  }
) {
  const contentLang = getResumeContentLanguage(data);
  const sidebar = sidebarTableCell(
    buildSidebarParagraphs(data, rtl, {
      text: options.sidebarText,
      muted: options.sidebarMuted,
    }),
    options.sidebarFill,
    options.sidebarWidth
  );
  const main = mainTableCell(
    blocksToParagraphs(pageBlocks, contentLang, rtl, options.mainTheme),
    100 - options.sidebarWidth
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: rtl,
    alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
    borders: NO_BORDERS,
    rows: [new TableRow({ children: [sidebar, main] })],
  });
}

function headerBandTable(
  data: ResumeOutput,
  rtl: boolean,
  fill: string,
  nameColor: string,
  contactColor: string
) {
  const { sections } = data;
  const photo = parsePhotoDataUrl(sections.header.photoUrl);
  const photoCellChildren: Paragraph[] = photo
    ? [photoParagraph(photo)]
    : [new Paragraph({ children: [] })];

  const infoCell = new TableCell({
    shading: { fill },
    margins: { top: 280, bottom: 280, left: 200, right: 280 },
    borders: NO_BORDERS,
    children: [
      new Paragraph({
        ...wordParaRtl(rtl),
        alignment: wordTextAlign(rtl),
        children: [
          new TextRun({
            text: sections.header.name,
            bold: true,
            size: 40,
            color: nameColor,
            ...wordRunRtl(rtl),
          }),
        ],
      }),
      new Paragraph({
        ...wordParaRtl(rtl),
        alignment: wordTextAlign(rtl),
        children: [
          new TextRun({
            text: resumeContactLine(sections.header),
            size: 16,
            color: contactColor,
            ...wordRunRtl(rtl),
          }),
        ],
      }),
    ],
  });

  const photoCell = new TableCell({
    width: { size: 18, type: WidthType.PERCENTAGE },
    shading: { fill },
    margins: { top: 280, bottom: 280, left: 280, right: 120 },
    borders: NO_BORDERS,
    children: photoCellChildren,
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: rtl,
    alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
    borders: NO_BORDERS,
    rows: [new TableRow({ children: [photoCell, infoCell] })],
  });
}

function centeredHeaderParagraphs(data: ResumeOutput, rtl: boolean) {
  const { sections } = data;
  return [
    new Paragraph({
      ...wordParaRtl(rtl),
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: sections.header.name,
          bold: true,
          size: 48,
          color: "111111",
          ...wordRunRtl(rtl),
        }),
      ],
    }),
    new Paragraph({
      ...wordParaRtl(rtl),
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: resumeContactLine(sections.header),
          size: 16,
          color: "444444",
          ...wordRunRtl(rtl),
        }),
      ],
    }),
  ];
}

function atsHeaderParagraphs(data: ResumeOutput, rtl: boolean) {
  const { sections } = data;
  return [
    new Paragraph({
      ...wordParaRtl(rtl),
      alignment: wordTextAlign(rtl),
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: sections.header.name,
          bold: true,
          size: 40,
          ...wordRunRtl(rtl),
        }),
      ],
    }),
    new Paragraph({
      ...wordParaRtl(rtl),
      alignment: wordTextAlign(rtl),
      spacing: { after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "E5E5E5" },
      },
      children: [
        new TextRun({
          text: resumeContactLine(sections.header),
          size: 18,
          color: "666666",
          ...wordRunRtl(rtl),
        }),
      ],
    }),
  ];
}

function buildExecutivePages(data: ResumeOutput, rtl: boolean) {
  const { mainPages } = paginateResume(data);
  const children: (Paragraph | Table)[] = [];

  children.push(
    twoColumnPage(data, mainPages[0], rtl, {
      sidebarFill: "1E293B",
      sidebarText: "F8FAFC",
      sidebarMuted: "94A3B8",
      sidebarWidth: 32,
      mainTheme: {
        sectionColor: "1E293B",
        bodyColor: "0F172A",
        metaColor: "64748B",
      },
    })
  );

  for (let i = 1; i < mainPages.length; i++) {
    children.push(new Paragraph({ ...wordParaRtl(rtl), children: [new PageBreak()] }));
    children.push(
      ...blocksToParagraphs(mainPages[i], getResumeContentLanguage(data), rtl, {
        sectionColor: "1E293B",
        bodyColor: "0F172A",
        metaColor: "64748B",
      })
    );
  }

  return children;
}

function buildClassicPages(data: ResumeOutput, rtl: boolean) {
  const { mainPages } = paginateResume(data);
  const children: (Paragraph | Table)[] = [];

  children.push(
    twoColumnPage(data, mainPages[0], rtl, {
      sidebarFill: "F1F5F9",
      sidebarText: "0F172A",
      sidebarMuted: "475569",
      sidebarWidth: 30,
      mainTheme: {
        sectionColor: "0F172A",
        bodyColor: "0F172A",
        metaColor: "64748B",
      },
    })
  );

  for (let i = 1; i < mainPages.length; i++) {
    children.push(new Paragraph({ ...wordParaRtl(rtl), children: [new PageBreak()] }));
    children.push(
      ...blocksToParagraphs(mainPages[i], getResumeContentLanguage(data), rtl, {
        sectionColor: "0F172A",
        bodyColor: "0F172A",
        metaColor: "64748B",
      })
    );
  }

  return children;
}

function buildModernPages(data: ResumeOutput, rtl: boolean) {
  const { mainPages } = paginateResume(data);
  const contentLang = getResumeContentLanguage(data);
  const theme: WordBlockTheme = {
    sectionColor: "0F766E",
    bodyColor: "0F172A",
    metaColor: "64748B",
  };
  const children: (Paragraph | Table)[] = [];

  children.push(headerBandTable(data, rtl, "0F766E", "FFFFFF", "CCFBF1"));
  children.push(
    ...blocksToParagraphs(mainPages[0], contentLang, rtl, theme)
  );

  for (let i = 1; i < mainPages.length; i++) {
    children.push(new Paragraph({ ...wordParaRtl(rtl), children: [new PageBreak()] }));
    children.push(...blocksToParagraphs(mainPages[i], contentLang, rtl, theme));
  }

  return children;
}

function buildCreativePages(data: ResumeOutput, rtl: boolean) {
  const { mainPages } = paginateResume(data);
  const contentLang = getResumeContentLanguage(data);
  const { sections } = data;
  const photo = parsePhotoDataUrl(sections.header.photoUrl);
  const theme: WordBlockTheme = {
    sectionColor: "7C3AED",
    bodyColor: "4C1D95",
    metaColor: "6B7280",
  };
  const children: (Paragraph | Table)[] = [];

  const photoCell = new TableCell({
    width: { size: 20, type: WidthType.PERCENTAGE },
    shading: { fill: "FAF5FF" },
    margins: { top: 320, bottom: 120, left: 320, right: 200 },
    borders: NO_BORDERS,
    children: photo ? [photoParagraph(photo)] : [new Paragraph({ children: [] })],
  });
  const infoCell = new TableCell({
    shading: { fill: "FAF5FF" },
    margins: { top: 320, bottom: 120, left: 200, right: 320 },
    borders: NO_BORDERS,
    children: [
      new Paragraph({
        ...wordParaRtl(rtl),
        alignment: wordTextAlign(rtl),
        children: [
          new TextRun({
            text: sections.header.name,
            bold: true,
            size: 44,
            color: "5B21B6",
            ...wordRunRtl(rtl),
          }),
        ],
      }),
      new Paragraph({
        ...wordParaRtl(rtl),
        alignment: wordTextAlign(rtl),
        children: [
          new TextRun({
            text: resumeContactLine(sections.header),
            size: 16,
            color: "6B7280",
            ...wordRunRtl(rtl),
          }),
        ],
      }),
    ],
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      visuallyRightToLeft: rtl,
      alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
      borders: NO_BORDERS,
      rows: [new TableRow({ children: [photoCell, infoCell] })],
    })
  );
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: NO_BORDERS,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "7C3AED" },
              borders: NO_BORDERS,
              children: [new Paragraph({ spacing: { after: 0 }, children: [] })],
            }),
          ],
        }),
      ],
    })
  );
  children.push(
    ...blocksToParagraphs(mainPages[0], contentLang, rtl, theme)
  );

  for (let i = 1; i < mainPages.length; i++) {
    children.push(new Paragraph({ ...wordParaRtl(rtl), children: [new PageBreak()] }));
    children.push(...blocksToParagraphs(mainPages[i], contentLang, rtl, theme));
  }

  return children;
}

function buildCorporatePages(data: ResumeOutput, rtl: boolean) {
  const { mainPages } = paginateResume(data);
  const contentLang = getResumeContentLanguage(data);
  const theme: WordBlockTheme = {
    sectionColor: "111111",
    bodyColor: "111111",
    metaColor: "555555",
    sectionAlign: AlignmentType.CENTER,
  };
  const children: (Paragraph | Table)[] = [];

  children.push(...centeredHeaderParagraphs(data, rtl));
  children.push(...blocksToParagraphs(mainPages[0], contentLang, rtl, theme));

  for (let i = 1; i < mainPages.length; i++) {
    children.push(new Paragraph({ ...wordParaRtl(rtl), children: [new PageBreak()] }));
    children.push(...blocksToParagraphs(mainPages[i], contentLang, rtl, theme));
  }

  return children;
}

function buildAtsPages(data: ResumeOutput, rtl: boolean) {
  const { mainPages } = paginateResume(data);
  const contentLang = getResumeContentLanguage(data);
  const theme: WordBlockTheme = {
    sectionColor: "111111",
    bodyColor: "111111",
    metaColor: "666666",
  };
  const children: (Paragraph | Table)[] = [];

  children.push(...atsHeaderParagraphs(data, rtl));
  children.push(...blocksToParagraphs(mainPages[0], contentLang, rtl, theme));

  for (let i = 1; i < mainPages.length; i++) {
    children.push(new Paragraph({ ...wordParaRtl(rtl), children: [new PageBreak()] }));
    children.push(...blocksToParagraphs(mainPages[i], contentLang, rtl, theme));
  }

  return children;
}

export async function buildResumeDocxBuffer(data: ResumeOutput): Promise<Buffer> {
  const template = resolveTemplate(data.template);
  const rtl = isResumeRtl(getResumeContentLanguage(data));

  const children =
    template === "executive"
      ? buildExecutivePages(data, rtl)
      : template === "classic"
        ? buildClassicPages(data, rtl)
        : template === "modern"
          ? buildModernPages(data, rtl)
          : template === "creative"
            ? buildCreativePages(data, rtl)
            : template === "corporate"
              ? buildCorporatePages(data, rtl)
              : buildAtsPages(data, rtl);

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
