"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportResumePdf, exportResumeWord } from "@/actions/export-resume";
import { saveResult } from "@/actions/save";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";
import { downloadBase64File } from "@/lib/downloads/client";
import { resumeOutputSchema } from "@/lib/validations/resume";
import type { Generation } from "@/types";

function buildSavePayload(generation: Generation, resumeSuffix: string) {
  if (generation.status !== "completed") return null;

  const output = generation.output_data;

  if (generation.tool === "resume") {
    const parsed = resumeOutputSchema.safeParse(output);
    if (!parsed.success) return null;
    return {
      tool: "resume" as const,
      title: parsed.data.sections.header.name + resumeSuffix,
      content: output,
      generationId: generation.id,
    };
  }

  if (generation.tool === "social_media") {
    const input = generation.input_data as { platform?: string };
    return {
      tool: "social_media" as const,
      title: `${input.platform ?? "social"} post`,
      content: output,
      generationId: generation.id,
    };
  }

  if (generation.tool === "product_description") {
    return {
      tool: "product_description" as const,
      title: "Product description",
      content: output,
      generationId: generation.id,
    };
  }

  return null;
}

export function GenerationActions({
  generation,
  canExportPdf,
  canSaveHistory,
  initiallySaved,
}: {
  generation: Generation;
  canExportPdf: boolean;
  canSaveHistory: boolean;
  initiallySaved: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslations("history");
  const { t: tr } = useTranslations("tools.resume");
  const { t: tc } = useTranslations("common");

  const isResume = generation.tool === "resume" && generation.status === "completed";
  const parsedResume = isResume
    ? resumeOutputSchema.safeParse(generation.output_data)
    : null;
  const canDownloadResume = Boolean(canExportPdf && parsedResume?.success);
  const savePayload = buildSavePayload(generation, tr("resumeSuffix"));

  function exportResume(
    mime: string,
    exporter: (data: unknown) => Promise<{
      success?: boolean;
      base64?: string;
      filename?: string;
      error?: string;
    }>,
    successMessage: string
  ) {
    if (!parsedResume?.success) return;

    startTransition(async () => {
      const result = await exporter(parsedResume.data);
      if (!result.success || !result.base64) {
        toast.error(result.error ?? tr("exportFailed"));
        return;
      }
      downloadBase64File(result.base64, mime, result.filename ?? "Resume");
      toast.success(successMessage);
    });
  }

  function handleSave() {
    if (!savePayload) return;

    startTransition(async () => {
      const result = await saveResult(savePayload);
      if (result.success) {
        setSaved(true);
        toast.success(tc("saved"));
        return;
      }
      if ("code" in result && result.code === "already_saved") {
        setSaved(true);
        toast.info(t("alreadySaved"));
        return;
      }
      toast.error(result.error);
    });
  }

  const showSave = canSaveHistory && savePayload;
  if (!canDownloadResume && !showSave) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {canDownloadResume && (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="gap-1.5"
            onClick={() =>
              exportResume("application/pdf", exportResumePdf, tr("pdfDownloaded"))
            }
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportPdf")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="gap-1.5"
            onClick={() =>
              exportResume(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                exportResumeWord,
                tr("wordDownloaded")
              )
            }
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportWord")}
          </Button>
        </>
      )}
      {showSave &&
        (saved ? (
          <Button variant="secondary" size="sm" disabled>
            {t("alreadySaved")}
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled={isPending} onClick={handleSave}>
            {t("saveToSaved")}
          </Button>
        ))}
    </div>
  );
}
