"use client";

import { useState, useTransition } from "react";
import { deleteGeneration } from "@/actions/history";
import { GenerationActions } from "@/components/history/generation-actions";
import { HistoryOutputPreview } from "@/components/history/output-preview";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Generation, Tool } from "@/types";

function statusLabel(status: string, t: (key: string) => string) {
  if (status === "completed") return t("statusCompleted");
  if (status === "failed") return t("statusFailed");
  if (status === "rate_limited") return t("statusRateLimited");
  return status;
}

export function GenerationCard({
  generation,
  canExportPdf,
  canSaveHistory,
  isSaved,
}: {
  generation: Generation;
  canExportPdf: boolean;
  canSaveHistory: boolean;
  isSaved: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { locale, messages } = useLocale();
  const { t } = useTranslations("history");

  const dateLocale =
    locale === "ar" ? "ar" : locale === "fr" ? "fr" : locale === "ru" ? "ru" : locale === "de" ? "de" : "en";

  const showExpandToggle =
    generation.status === "completed" &&
    (generation.tool === "resume" ||
      generation.tool === "product_description" ||
      generation.tool === "social_media");

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            {messages.tools.labels[generation.tool as Tool] ?? generation.tool}
          </CardTitle>
          <Badge variant="secondary">{statusLabel(generation.status, t)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <HistoryOutputPreview
          tool={generation.tool}
          output={generation.output_data}
          expanded={expanded}
        />
        <time className="text-xs text-muted-foreground mt-2 block">
          {new Date(generation.created_at).toLocaleString(dateLocale)}
          {generation.latency_ms ? ` · ${generation.latency_ms}ms` : ""}
        </time>
        <GenerationActions
          generation={generation}
          canExportPdf={canExportPdf}
          canSaveHistory={canSaveHistory}
          initiallySaved={isSaved}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {showExpandToggle && (
            <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? t("collapse") : t("viewFull")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteGeneration(generation.id);
              })
            }
          >
            {t("delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
