"use client";

import type { ReactNode } from "react";
import type { MainBlock } from "@/lib/resume/paginate";

export function ResumeMainBlocksPreview({
  blocks,
  labels,
  formatLang,
  experiencePeriodClass = "text-gray-500 text-xs",
  educationMetaClass = "text-gray-600",
}: {
  blocks: MainBlock[];
  labels: Record<string, string>;
  formatLang: (lang: { name: string; level: string }) => string;
  experiencePeriodClass?: string;
  educationMetaClass?: string;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "summary") {
          return (
            <section key={i} className="mb-4">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider">{labels.summary}</h3>
              <p>{block.text}</p>
            </section>
          );
        }
        if (block.kind === "heading") {
          return (
            <h3 key={i} className="mb-2 text-xs font-bold uppercase tracking-wider">
              {labels[block.section]}
            </h3>
          );
        }
        if (block.kind === "experience") {
          const exp = block.item;
          return (
            <div key={i} className="mb-3">
              <div className="flex justify-between font-semibold gap-4">
                <span>
                  {exp.title} — {exp.company}
                </span>
                <span className={experiencePeriodClass}>{exp.period}</span>
              </div>
              <ul className="mt-1 list-disc ps-4 space-y-0.5">
                {exp.bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
            </div>
          );
        }
        if (block.kind === "education") {
          const edu = block.item;
          return (
            <div key={i} className="mb-2">
              <div className="font-semibold">{edu.degree}</div>
              <div className={educationMetaClass}>
                {edu.institution}
                {edu.period ? ` · ${edu.period}` : ""}
              </div>
            </div>
          );
        }
        if (block.kind === "skills") {
          return (
            <p key={i} className="mb-4">
              {block.items.join(" · ")}
            </p>
          );
        }
        if (block.kind === "languages") {
          return (
            <p key={i}>
              {block.items.map((lang) => formatLang(lang)).join(" · ")}
            </p>
          );
        }
        return null;
      })}
    </>
  );
}

export function ResumePageFrame({
  children,
  pageNumber,
  totalPages,
}: {
  children: ReactNode;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <div
      className={`resume-page-sheet relative overflow-hidden rounded-lg border bg-white shadow-sm ${
        pageNumber < totalPages ? "mb-6" : ""
      }`}
      style={{ minHeight: "min(1056px, 80vh)" }}
    >
      {children}
      {totalPages > 1 && (
        <div className="absolute bottom-3 inset-x-0 text-center text-[10px] text-muted-foreground">
          {pageNumber} / {totalPages}
        </div>
      )}
    </div>
  );
}
