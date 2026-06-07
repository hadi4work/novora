"use client";

import Link from "next/link";
import { GenerationCard } from "@/components/history/generation-card";
import { SavedResultCard } from "@/components/history/saved-result-card";
import { useTranslations } from "@/components/providers/locale-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Generation, SavedResult } from "@/types";

export function HistoryPageContent({
  generations,
  saved,
  canExportPdf,
  canSaveHistory,
  savedGenerationIds,
}: {
  generations: Generation[];
  saved: SavedResult[];
  canExportPdf: boolean;
  canSaveHistory: boolean;
  savedGenerationIds: string[];
}) {
  const savedSet = new Set(savedGenerationIds);
  const { t } = useTranslations("history");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-8">{t("subtitle")}</p>

      <Tabs defaultValue="generations">
        <TabsList>
          <TabsTrigger value="generations">
            {t("generations")} ({generations.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
            {t("saved")} ({saved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generations" className="mt-6 space-y-3">
          {generations.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              <p>{t("noGenerations")}</p>
              <Link href="/dashboard" className="text-primary underline mt-2 inline-block">
                {t("startCreating")}
              </Link>
            </div>
          ) : (
            generations.map((gen) => (
              <GenerationCard
                key={gen.id}
                generation={gen}
                canExportPdf={canExportPdf}
                canSaveHistory={canSaveHistory}
                isSaved={savedSet.has(gen.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6 space-y-3">
          {saved.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              <p>{t("noSaved")}</p>
              <p className="text-xs mt-2">{t("saveHint")}</p>
            </div>
          ) : (
            saved.map((item) => (
              <SavedResultCard
                key={item.id}
                item={item}
                canExportPdf={canExportPdf}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
