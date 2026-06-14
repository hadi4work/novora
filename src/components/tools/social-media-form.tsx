"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { QuotaRewardDialog } from "@/components/ads/quota-reward-dialog";
import { OutputCard } from "@/components/tools/output-card";
import { generateSocialMediaAction } from "@/actions/generate";
import { useQuotaReward } from "@/hooks/use-quota-reward";
import { saveResult } from "@/actions/save";
import {
  socialMediaSchema,
  type SocialMediaInput,
  type SocialMediaOutput,
} from "@/lib/validations/social-media";
import { useTranslations } from "@/components/providers/locale-provider";
import { SOCIAL_MEDIA_TONES, SOCIAL_PLATFORMS } from "@/lib/constants";
import type { SocialMediaTone, SocialPlatform } from "@/types";

export function SocialMediaForm({
  allowedPlatforms,
  allowedTones,
  canSave,
}: {
  allowedPlatforms: SocialPlatform[] | "all";
  allowedTones: SocialMediaTone[];
  canSave: boolean;
}) {
  const [output, setOutput] = useState<SocialMediaOutput | null>(null);
  const [generationId, setGenerationId] = useState<string>("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    quotaDialogOpen,
    setQuotaDialogOpen,
    adRewardsRemaining,
    handleQuotaError,
    onRewardGranted,
  } = useQuotaReward();
  const { t } = useTranslations("tools.socialMedia");
  const { t: tc } = useTranslations("common");

  const platforms =
    allowedPlatforms === "all"
      ? SOCIAL_PLATFORMS
      : SOCIAL_PLATFORMS.filter((p) => allowedPlatforms.includes(p.value));

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SocialMediaInput>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      platform: platforms[0]?.value ?? "instagram",
      tone: "professional",
    },
  });

  const platform = watch("platform");
  const tone = watch("tone") ?? "professional";

  const toneOptions: { value: SocialMediaTone; label: string }[] = [
    { value: "professional", label: t("toneProfessional") },
    { value: "casual", label: t("toneCasual") },
    { value: "playful", label: t("tonePlayful") },
    { value: "inspirational", label: t("toneInspirational") },
  ];

  const hasLockedTones = allowedTones.length < SOCIAL_MEDIA_TONES.length;

  function onSubmit(data: SocialMediaInput) {
    startTransition(async () => {
      setOutput(null);
      setSaved(false);
      const result = await generateSocialMediaAction(data);

      if (!result.success) {
        if (handleQuotaError(result)) return;
        if (result.code === "quota_exceeded") {
          toast.error(result.error, {
            action: { label: "Upgrade", onClick: () => window.location.href = "/pricing" },
          });
        } else {
          toast.error(result.error);
        }
        return;
      }

      setOutput(result.data);
      setGenerationId(result.generationId);
      setRemaining(result.remaining);
      toast.success(t("generated"));
    });
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
        <div className="space-y-2">
          <Label htmlFor="businessType">{t("businessType")}</Label>
          <Input id="businessType" {...register("businessType")} placeholder={t("businessPlaceholder")} />
          {errors.businessType && <p className="text-sm text-destructive">{errors.businessType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="productDescription">{t("product")}</Label>
          <Textarea id="productDescription" {...register("productDescription")} rows={3} placeholder={t("productPlaceholder")} />
          {errors.productDescription && <p className="text-sm text-destructive">{errors.productDescription.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetAudience">{t("audience")}</Label>
          <Input id="targetAudience" {...register("targetAudience")} placeholder={t("audiencePlaceholder")} />
          {errors.targetAudience && <p className="text-sm text-destructive">{errors.targetAudience.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentGoal">{t("goal")}</Label>
          <Input id="contentGoal" {...register("contentGoal")} placeholder={t("goalPlaceholder")} />
          {errors.contentGoal && <p className="text-sm text-destructive">{errors.contentGoal.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("platform")}</Label>
            <Select value={platform} onValueChange={(v) => setValue("platform", v as SocialPlatform)}>
              <SelectTrigger>
                {platforms.find((p) => p.value === platform)?.label ?? platform}
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("tone")}</Label>
            <Select
              value={tone}
              onValueChange={(v) => setValue("tone", v as SocialMediaInput["tone"])}
            >
              <SelectTrigger>
                {toneOptions.find((option) => option.value === tone)?.label ?? tone}
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => {
                  const locked = !allowedTones.includes(option.value);
                  return (
                    <SelectItem key={option.value} value={option.value} disabled={locked}>
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
        </div>
        <Button type="submit" disabled={isPending} className="w-full gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isPending ? tc("generating") : tc("generate")}
        </Button>
        {remaining !== null && (
          <p className="text-xs text-center text-muted-foreground">{tc("remaining", { count: remaining })}</p>
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
            {output.variations.map((v, i) => (
              <OutputCard key={i} title={t("variation", { n: i + 1 })} content={v.caption}>
                {v.hook && <p className="text-xs text-muted-foreground mb-2">Hook: {v.hook}</p>}
              </OutputCard>
            ))}
            <OutputCard title={t("hashtags")} content={output.hashtags.join(" ")} />
            <OutputCard title={t("ctas")} content={output.ctas.join("\n")} />
            {canSave && !saved && (
              <Button
                variant="outline"
                onClick={() =>
                  startTransition(async () => {
                    const result = await saveResult({
                      tool: "social_media",
                      title: `${platform} post`,
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
