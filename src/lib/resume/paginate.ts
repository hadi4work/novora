import { resolveTemplate } from "@/lib/resume/types";
import type { ResumeOutput } from "@/lib/validations/resume";

export type MainBlock =
  | { kind: "summary"; text: string }
  | { kind: "heading"; section: "experience" | "education" | "skills" | "languages" }
  | { kind: "experience"; item: ResumeOutput["sections"]["experience"][number] }
  | { kind: "education"; item: ResumeOutput["sections"]["education"][number] }
  | { kind: "skills"; items: string[] }
  | { kind: "languages"; items: { name: string; level: string }[] };

export type ResumeLayoutKind = "sidebar" | "header" | "centered" | "plain";

function blockWeight(block: MainBlock): number {
  switch (block.kind) {
    case "summary":
      return Math.max(3, Math.ceil(block.text.length / 90));
    case "heading":
      return 2;
    case "experience":
      return 3 + block.item.bullets.length * 1.4;
    case "education":
      return 2.5;
    case "skills":
      return 2 + Math.ceil(block.items.join(" ").length / 80);
    case "languages":
      return 2 + block.items.length * 0.8;
    default:
      return 2;
  }
}

function layoutKind(template: ReturnType<typeof resolveTemplate>): ResumeLayoutKind {
  if (template === "executive" || template === "classic") return "sidebar";
  if (template === "modern" || template === "creative") return "header";
  if (template === "corporate") return "centered";
  return "plain";
}

function pageCapacity(layout: ResumeLayoutKind, pageIndex: number): number {
  if (pageIndex === 0) {
    if (layout === "sidebar") return 24;
    if (layout === "header") return 28;
    if (layout === "centered") return 26;
    return 30;
  }
  return 36;
}

function buildMainBlocks(
  sections: ResumeOutput["sections"],
  skillsInMain: boolean,
  languagesInMain: boolean
): MainBlock[] {
  const blocks: MainBlock[] = [];

  if (sections.summary) {
    blocks.push({ kind: "summary", text: sections.summary });
  }

  if (sections.experience.length > 0) {
    blocks.push({ kind: "heading", section: "experience" });
    for (const item of sections.experience) {
      blocks.push({ kind: "experience", item });
    }
  }

  if (sections.education.length > 0) {
    blocks.push({ kind: "heading", section: "education" });
    for (const item of sections.education) {
      blocks.push({ kind: "education", item });
    }
  }

  if (skillsInMain && sections.skills.length > 0) {
    blocks.push({ kind: "heading", section: "skills" });
    blocks.push({ kind: "skills", items: sections.skills });
  }

  if (languagesInMain && sections.languages && sections.languages.length > 0) {
    const langs = sections.languages.map((l) =>
      typeof l === "string" ? { name: l, level: "" } : l
    );
    blocks.push({ kind: "heading", section: "languages" });
    blocks.push({ kind: "languages", items: langs });
  }

  return blocks;
}

function needsHeadingOnContinue(block: MainBlock): MainBlock | null {
  if (block.kind === "experience") return { kind: "heading", section: "experience" };
  if (block.kind === "education") return { kind: "heading", section: "education" };
  return null;
}

function packBlocks(blocks: MainBlock[], layout: ResumeLayoutKind): MainBlock[][] {
  if (blocks.length === 0) return [[]];

  const pages: MainBlock[][] = [];
  let current: MainBlock[] = [];
  let used = 0;
  let pageIndex = 0;
  let lastHeading: MainBlock | null = null;

  for (const block of blocks) {
    if (block.kind === "heading") {
      lastHeading = block;
    }

    const weight = blockWeight(block);
    const cap = pageCapacity(layout, pageIndex);

    if (current.length > 0 && used + weight > cap) {
      pages.push(current);
      current = [];
      used = 0;
      pageIndex += 1;

      const continueHeading = needsHeadingOnContinue(block);
      if (continueHeading) {
        current.push(continueHeading);
        used += blockWeight(continueHeading);
        lastHeading = continueHeading;
      } else if (
        block.kind !== "heading" &&
        lastHeading &&
        (block.kind === "skills" || block.kind === "languages")
      ) {
        current.push(lastHeading);
        used += blockWeight(lastHeading);
      }
    }

    current.push(block);
    used += weight;
  }

  if (current.length > 0) pages.push(current);
  return pages;
}

export function paginateResume(data: ResumeOutput) {
  const template = resolveTemplate(data.template);
  const layout = layoutKind(template);
  const skillsInSidebar = layout === "sidebar";
  const skillsInMain = !skillsInSidebar;

  const blocks = buildMainBlocks(data.sections, skillsInMain, skillsInMain);
  const totalWeight = blocks.reduce((sum, b) => sum + blockWeight(b), 0);
  const firstCap = pageCapacity(layout, 0);

  const mainPages =
    totalWeight > firstCap ? packBlocks(blocks, layout) : [blocks];

  return {
    template,
    layout,
    skillsInSidebar,
    mainPages,
    pageCount: mainPages.length,
  };
}
