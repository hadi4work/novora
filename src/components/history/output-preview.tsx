"use client";

import { ResumePreview } from "@/components/tools/resume-preview";
import { useTranslations } from "@/components/providers/locale-provider";
import { resumeOutputSchema } from "@/lib/validations/resume";

export function HistoryOutputPreview({
  tool,
  output,
  expanded,
}: {
  tool: string;
  output: Record<string, unknown>;
  expanded: boolean;
}) {
  const { t } = useTranslations("history");

  if (tool === "resume") {
    const parsed = resumeOutputSchema.safeParse(output);
    if (parsed.success) {
      if (expanded) {
        return <ResumePreview data={parsed.data} />;
      }
      const { sections } = parsed.data;
      return (
        <div className="space-y-2 text-sm">
          <p className="font-medium">{sections.header?.name}</p>
          {sections.summary && (
            <p className="text-muted-foreground line-clamp-2">{sections.summary}</p>
          )}
        </div>
      );
    }
  }

  if (tool === "social_media" && output.variations) {
    const variations = output.variations as { caption: string; hook?: string }[];
    return (
      <div className={`space-y-2 text-sm ${expanded ? "" : "line-clamp-3"}`}>
        {variations.map((v, i) => (
          <p key={i}>
            <span className="font-medium">{t("variation", { n: i + 1 })}:</span> {v.caption}
          </p>
        ))}
      </div>
    );
  }

  if (tool === "product_description") {
    const short = output.short as string | undefined;
    const long = output.long as string | undefined;
    return (
      <div className={`space-y-2 text-sm ${expanded ? "" : "line-clamp-3"}`}>
        {short ? (
          <p>
            <span className="font-medium">{t("shortLabel")}:</span> {short}
          </p>
        ) : null}
        {expanded && long ? (
          <p className="whitespace-pre-wrap">
            <span className="font-medium">{t("longLabel")}:</span> {long}
          </p>
        ) : null}
      </div>
    );
  }

  return <p className="text-sm text-muted-foreground">{t("generatedContent")}</p>;
}
