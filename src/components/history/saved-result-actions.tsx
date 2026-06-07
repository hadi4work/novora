"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportResumePdf, exportResumeWord } from "@/actions/export-resume";
import { useTranslations } from "@/components/providers/locale-provider";
import { downloadBase64File } from "@/lib/downloads/client";
import { resumeOutputSchema } from "@/lib/validations/resume";
import { Button } from "@/components/ui/button";
import type { SavedResult } from "@/types";

export function SavedResultActions({
  item,
  canExportPdf,
}: {
  item: SavedResult;
  canExportPdf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslations("history");
  const { t: tr } = useTranslations("tools.resume");

  if (!canExportPdf || item.tool !== "resume") return null;

  const parsed = resumeOutputSchema.safeParse(item.content);
  if (!parsed.success) return null;
  const resumeData = parsed.data;

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
    startTransition(async () => {
      const result = await exporter(resumeData);
      if (!result.success || !result.base64) {
        toast.error(result.error ?? tr("exportFailed"));
        return;
      }
      downloadBase64File(result.base64, mime, result.filename ?? "Resume");
      toast.success(successMessage);
    });
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
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
    </div>
  );
}
