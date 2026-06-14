"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clapperboard, ExternalLink, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchProductFromUrlAction } from "@/actions/fetch-product-url";
import { generateVideoAdScriptAction } from "@/actions/generate";
import { saveResult } from "@/actions/save";
import { QuotaRewardDialog } from "@/components/ads/quota-reward-dialog";
import { OutputCard } from "@/components/tools/output-card";
import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useQuotaReward } from "@/hooks/use-quota-reward";
import {
  VIDEO_AD_DURATIONS,
  VIDEO_AD_PLATFORMS,
  VIDEO_AD_TONES,
} from "@/lib/constants";
import {
  buildProductPrefillFromVideoScript,
  saveProductPrefill,
} from "@/lib/tools/product-prefill";
import {
  videoAdScriptSchema,
  type VideoAdScriptInput,
  type VideoAdScriptOutput,
} from "@/lib/validations/video-ad-script";
import type { VideoAdTone } from "@/types";

export function VideoAdScriptForm({
  allowedTones,
  allowedDurations,
  canImportProductUrl,
  canSave,
}: {
  allowedTones: VideoAdTone[];
  allowedDurations: number[];
  canImportProductUrl: boolean;
  canSave: boolean;
}) {
  const [output, setOutput] = useState<VideoAdScriptOutput | null>(null);
  const [lastInput, setLastInput] = useState<VideoAdScriptInput | null>(null);
  const [generationId, setGenerationId] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [importedImage, setImportedImage] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isFetching, startFetch] = useTransition();
  const router = useRouter();
  const {
    quotaDialogOpen,
    setQuotaDialogOpen,
    adRewardsRemaining,
    handleQuotaError,
    onRewardGranted,
  } = useQuotaReward();
  const { t } = useTranslations("tools.videoAdScript");
  const { t: tc } = useTranslations("common");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VideoAdScriptInput>({
    resolver: zodResolver(videoAdScriptSchema),
    defaultValues: {
      platform: "tiktok",
      tone: "energetic",
      durationSeconds: 30,
    },
  });

  const platform = watch("platform");
  const tone = watch("tone") ?? "energetic";
  const durationSeconds = watch("durationSeconds") ?? 30;
  const productName = watch("productName");
  const productFeatures = watch("productFeatures");
  const targetAudience = watch("targetAudience");

  useEffect(() => {
    if (!allowedTones.includes(tone)) {
      setValue("tone", allowedTones[0] ?? "energetic");
    }
  }, [allowedTones, tone, setValue]);

  useEffect(() => {
    if (!allowedDurations.includes(durationSeconds)) {
      setValue("durationSeconds", (allowedDurations[0] ?? 30) as VideoAdScriptInput["durationSeconds"]);
    }
  }, [allowedDurations, durationSeconds, setValue]);

  const toneOptions: { value: VideoAdTone; label: string }[] = [
    { value: "energetic", label: t("toneEnergetic") },
    { value: "professional", label: t("toneProfessional") },
    { value: "emotional", label: t("toneEmotional") },
    { value: "humorous", label: t("toneHumorous") },
    { value: "luxury", label: t("toneLuxury") },
    { value: "storytelling", label: t("toneStorytelling") },
  ];

  const durationOptions = VIDEO_AD_DURATIONS.map((seconds) => ({
    value: seconds,
    label: t("durationSeconds", { seconds }),
  }));

  const hasLockedTones = allowedTones.length < VIDEO_AD_TONES.length;
  const hasLockedDurations = allowedDurations.length < VIDEO_AD_DURATIONS.length;

  function onSubmit(data: VideoAdScriptInput) {
    startTransition(async () => {
      setOutput(null);
      setSaved(false);
      const result = await generateVideoAdScriptAction(data);

      if (!result.success) {
        if (handleQuotaError(result)) return;
        toast.error(result.error, {
          action:
            result.code === "quota_exceeded"
              ? { label: tc("upgrade"), onClick: () => (window.location.href = "/pricing") }
              : undefined,
        });
        return;
      }

      setOutput(result.data);
      setLastInput(data);
      setGenerationId(result.generationId);
      setRemaining(result.remaining);
      toast.success(t("generated"));
    });
  }

  function handleFetchProduct() {
    if (!productUrl.trim()) {
      toast.error(t("urlRequired"));
      return;
    }

    startFetch(async () => {
      const result = await fetchProductFromUrlAction(productUrl.trim());
      if (!result.success) {
        toast.error(result.error, {
          action:
            result.code === "quota_exceeded"
              ? { label: tc("upgrade"), onClick: () => (window.location.href = "/pricing") }
              : undefined,
        });
        return;
      }

      setValue("productName", result.data.productName);
      setValue("productFeatures", result.data.productFeatures);
      setValue("sourceUrl", result.data.sourceUrl);
      setImportedImage(result.data.imageUrl);
      toast.success(t("productImported"));
    });
  }

  function handleOpenProductDescription() {
    if (!lastInput) return;
    const prefill = buildProductPrefillFromVideoScript(lastInput);
    saveProductPrefill(prefill);
    router.push("/app/product-description");
  }

  return (
    <>
      <QuotaRewardDialog
        open={quotaDialogOpen}
        onOpenChange={setQuotaDialogOpen}
        adRewardsRemaining={adRewardsRemaining}
        onRewardGranted={onRewardGranted}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">{t("manualTab")}</TabsTrigger>
              <TabsTrigger value="url" disabled={!canImportProductUrl}>
                {t("urlTab")} {!canImportProductUrl ? `(${t("proOnly")})` : ""}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="productUrl">{t("productUrl")}</Label>
                <Input
                  id="productUrl"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder={t("productUrlPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">{t("supportedSites")}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={isFetching || !canImportProductUrl}
                onClick={handleFetchProduct}
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {isFetching ? t("fetchingProduct") : t("fetchProduct")}
              </Button>
              {!canImportProductUrl && (
                <p className="text-xs text-muted-foreground">
                  <Link href="/pricing" className="text-primary underline">
                    {tc("upgrade")} Pro
                  </Link>{" "}
                  — {t("upgradeUrlImport")}
                </p>
              )}
            </TabsContent>

            <TabsContent value="manual" className="pt-2" />
          </Tabs>

          {importedImage && (
            <div className="rounded-lg border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={importedImage}
                alt={productName || t("importedProduct")}
                className="mx-auto max-h-32 rounded object-contain"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="productName">{t("productName")}</Label>
            <Input
              id="productName"
              {...register("productName")}
              placeholder={t("productNamePlaceholder")}
            />
            {errors.productName && (
              <p className="text-sm text-destructive">{errors.productName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="productFeatures">{t("productFeatures")}</Label>
            <Textarea
              id="productFeatures"
              {...register("productFeatures")}
              rows={4}
              placeholder={t("productFeaturesPlaceholder")}
            />
            {errors.productFeatures && (
              <p className="text-sm text-destructive">{errors.productFeatures.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">{t("audience")}</Label>
            <Input
              id="targetAudience"
              {...register("targetAudience")}
              placeholder={t("audiencePlaceholder")}
            />
            {errors.targetAudience && (
              <p className="text-sm text-destructive">{errors.targetAudience.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("platform")}</Label>
              <Select
                value={platform}
                onValueChange={(v) =>
                  setValue("platform", v as VideoAdScriptInput["platform"])
                }
              >
                <SelectTrigger>
                  {VIDEO_AD_PLATFORMS.find((p) => p.value === platform)?.label ?? platform}
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_AD_PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("duration")}</Label>
              <Select
                value={String(durationSeconds)}
                onValueChange={(v) =>
                  setValue(
                    "durationSeconds",
                    Number(v) as VideoAdScriptInput["durationSeconds"]
                  )
                }
              >
                <SelectTrigger>
                  {durationOptions.find((d) => d.value === durationSeconds)?.label}
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => {
                    const locked = !allowedDurations.includes(option.value);
                    return (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                        disabled={locked}
                      >
                        {option.label}
                        {locked ? ` (${t("proOnly")})` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {hasLockedDurations && (
                <p className="text-xs text-muted-foreground">
                  <Link href="/pricing" className="text-primary underline">
                    {tc("upgrade")} Pro
                  </Link>{" "}
                  — {t("upgradeDurations")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("tone")}</Label>
            <Select
              value={tone}
              onValueChange={(v) => setValue("tone", v as VideoAdScriptInput["tone"])}
            >
              <SelectTrigger>
                {toneOptions.find((option) => option.value === tone)?.label ?? tone}
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => {
                  const locked = !allowedTones.includes(option.value);
                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={locked}
                    >
                      {option.label}
                      {locked ? ` (${t("proOnly")})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {hasLockedTones && (
              <p className="text-xs text-muted-foreground">
                <Link href="/pricing" className="text-primary underline">
                  {tc("upgrade")} Pro
                </Link>{" "}
                — {t("upgradeTones")}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clapperboard className="h-4 w-4" />
            )}
            {isPending ? tc("generating") : t("generateScript")}
          </Button>
          {remaining !== null && (
            <p className="text-xs text-center text-muted-foreground">
              {tc("remaining", { count: remaining })}
            </p>
          )}
        </form>

        <div className="space-y-4">
          {!output && !isPending && (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
              {t("outputPlaceholder")}
            </div>
          )}
          {isPending && (
            <div className="flex h-64 items-center justify-center rounded-lg border">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {output && (
            <>
              <OutputCard title={t("hook")} content={output.hook} />
              <OutputCard title={t("suggestedDuration", { seconds: output.suggestedDurationSeconds })}>
                <p className="text-sm text-muted-foreground">{t("timeline")}</p>
                <div className="mt-3 space-y-3">
                  {output.script.map((line, index) => (
                    <div key={index} className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs font-medium text-primary">
                        {line.startSeconds}s – {line.endSeconds}s
                      </p>
                      <p className="mt-1 text-sm">{line.text}</p>
                      {line.visualSuggestion && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t("visual")}: {line.visualSuggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </OutputCard>
              <OutputCard title={t("cta")} content={output.cta} />
              {output.bRollSuggestions.length > 0 && (
                <OutputCard
                  title={t("bRoll")}
                  content={output.bRollSuggestions.map((item) => `• ${item}`).join("\n")}
                />
              )}
              {output.musicMood && (
                <OutputCard title={t("musicMood")} content={output.musicMood} />
              )}
              {output.alternativeHooks && output.alternativeHooks.length > 0 && (
                <OutputCard
                  title={t("alternativeHooks")}
                  content={output.alternativeHooks.map((item) => `• ${item}`).join("\n")}
                />
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleOpenProductDescription}
              >
                <Sparkles className="h-4 w-4" />
                {t("openProductDescription")}
              </Button>

              {canSave && !saved && (
                <Button
                  variant="outline"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await saveResult({
                        tool: "video_ad_script",
                        title: `${productName || t("saveTitle")} — ${t("saveSuffix")}`,
                        content: output as unknown as Record<string, unknown>,
                        generationId,
                      });
                      if (result.success) {
                        setSaved(true);
                        toast.success(tc("saved"));
                      } else if ("code" in result && result.code === "already_saved") {
                        setSaved(true);
                        toast.info(tc("alreadySaved"));
                      } else {
                        toast.error(result.error);
                      }
                    })
                  }
                >
                  {t("saveResult")}
                </Button>
              )}
              {canSave && saved && (
                <Button variant="secondary" disabled>
                  {tc("alreadySaved")}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
