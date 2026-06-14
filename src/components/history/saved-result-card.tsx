"use client";

import { useState } from "react";
import { HistoryOutputPreview } from "@/components/history/output-preview";
import { SavedResultActions } from "@/components/history/saved-result-actions";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SavedResult, Tool } from "@/types";

export function SavedResultCard({
  item,
  canExportPdf,
}: {
  item: SavedResult;
  canExportPdf: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { locale, messages } = useLocale();
  const { t } = useTranslations("history");

  const dateLocale =
    locale === "ar" ? "ar" : locale === "fr" ? "fr" : locale === "ru" ? "ru" : locale === "de" ? "de" : "en";

  const showExpandToggle =
    item.tool === "resume" ||
    item.tool === "product_description" ||
    item.tool === "social_media" ||
    item.tool === "video_ad_script";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className="mb-2">
          {messages.tools.labels[item.tool as Tool] ?? item.tool}
        </Badge>
        <HistoryOutputPreview tool={item.tool} output={item.content} expanded={expanded} />
        <time className="text-xs text-muted-foreground mt-2 block">
          {new Date(item.created_at).toLocaleString(dateLocale)}
        </time>
        <SavedResultActions item={item} canExportPdf={canExportPdf} />
        {showExpandToggle && (
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
              {expanded ? t("collapse") : t("viewFull")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
