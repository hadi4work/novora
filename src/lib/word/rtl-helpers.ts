import { AlignmentType, type IRunOptions } from "docx";

export function wordTextAlign(rtl: boolean, center = false) {
  if (center) return AlignmentType.CENTER;
  return rtl ? AlignmentType.END : AlignmentType.START;
}

export function wordParaRtl(rtl: boolean) {
  return rtl ? ({ bidirectional: true } as const) : {};
}

export function wordRunRtl(rtl: boolean): Partial<IRunOptions> {
  if (!rtl) return {};
  return {
    rightToLeft: true,
    language: { value: "ar-SA", bidirectional: "ar-SA" },
  };
}
