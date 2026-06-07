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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { QuotaRewardDialog } from "@/components/ads/quota-reward-dialog";
import { OutputCard } from "@/components/tools/output-card";
import { generateProductDescriptionAction } from "@/actions/generate";
import { useQuotaReward } from "@/hooks/use-quota-reward";
import { saveResult } from "@/actions/save";
import { useTranslations } from "@/components/providers/locale-provider";
import {
  productDescriptionSchema,
  type ProductDescriptionInput,
  type ProductDescriptionOutput,
} from "@/lib/validations/product-description";

export function ProductDescriptionForm({
  allowedFormats,
  canSave,
}: {
  allowedFormats: ("short" | "long" | "seo")[];
  canSave: boolean;
}) {
  const [output, setOutput] = useState<ProductDescriptionOutput | null>(null);
  const [generationId, setGenerationId] = useState("");
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
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["short"]);
  const { t } = useTranslations("tools.product");
  const { t: tc } = useTranslations("common");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductDescriptionInput>({
    resolver: zodResolver(productDescriptionSchema),
    defaultValues: { formats: ["short"], tone: "professional" },
  });

  const tone = watch("tone") ?? "professional";
  const toneLabels: Record<NonNullable<ProductDescriptionInput["tone"]>, string> = {
    professional: t("toneProfessional"),
    friendly: t("toneFriendly"),
    luxury: t("toneLuxury"),
    playful: t("tonePlayful"),
  };

  function toggleFormat(format: string) {
    const updated = selectedFormats.includes(format)
      ? selectedFormats.filter((f) => f !== format)
      : [...selectedFormats, format];
    if (updated.length === 0) return;
    setSelectedFormats(updated);
    setValue("formats", updated as ProductDescriptionInput["formats"]);
  }

  function onSubmit(data: ProductDescriptionInput) {
    startTransition(async () => {
      setOutput(null);
      setSaved(false);
      const result = await generateProductDescriptionAction({
        ...data,
        formats: selectedFormats as ProductDescriptionInput["formats"],
      });

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
      setGenerationId(result.generationId);
      setRemaining(result.remaining);
      toast.success(t("generated"));
    });
  }

  const formatOptions = [
    { value: "short", label: t("short"), pro: false },
    { value: "long", label: t("long"), pro: true },
    { value: "seo", label: t("seo"), pro: true },
  ];

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
            <Label htmlFor="features">{t("features")}</Label>
            <Textarea
              id="features"
              {...register("features")}
              rows={4}
              placeholder={t("featuresPlaceholder")}
            />
            {errors.features && (
              <p className="text-sm text-destructive">{errors.features.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience">{t("audience")}</Label>
            <Input
              id="targetAudience"
              {...register("targetAudience")}
              placeholder={t("audiencePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("tone")}</Label>
            <Select
              value={tone}
              onValueChange={(v) => setValue("tone", v as ProductDescriptionInput["tone"])}
            >
              <SelectTrigger>{toneLabels[tone]}</SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">{t("toneProfessional")}</SelectItem>
                <SelectItem value="friendly">{t("toneFriendly")}</SelectItem>
                <SelectItem value="luxury">{t("toneLuxury")}</SelectItem>
                <SelectItem value="playful">{t("tonePlayful")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("formats")}</Label>
            <div className="space-y-2">
              {formatOptions.map((fmt) => {
                const disabled =
                  fmt.pro && !allowedFormats.includes(fmt.value as "long" | "seo");
                return (
                  <div key={fmt.value} className="flex items-center gap-2">
                    <Checkbox
                      id={fmt.value}
                      checked={selectedFormats.includes(fmt.value)}
                      disabled={disabled}
                      onCheckedChange={() => toggleFormat(fmt.value)}
                    />
                    <Label htmlFor={fmt.value} className={disabled ? "text-muted-foreground" : ""}>
                      {fmt.label}
                      {disabled && ` (${t("proOnly")})`}
                    </Label>
                  </div>
                );
              })}
            </div>
            {allowedFormats.length === 1 && (
              <p className="text-xs text-muted-foreground">
                <Link href="/pricing" className="text-primary underline">
                  {tc("upgrade")} Pro
                </Link>{" "}
                — {t("upgradeFormats")}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isPending} className="w-full gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isPending ? tc("generating") : tc("generate")}
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
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          {output && (
            <>
              {output.short && (
                <OutputCard
                  title={t("shortWithChars", { chars: output.short.length })}
                  content={output.short}
                />
              )}
              {output.long && (
                <OutputCard title={t("longDescription")} content={output.long} />
              )}
              {output.seo && (
                <OutputCard title={t("seoTitle")}>
                  <p className="text-sm font-medium">{output.seo.title}</p>
                  <p className="text-sm text-muted-foreground mt-2">{output.seo.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("seoChars", { count: output.seo.description.length })}
                  </p>
                  <p className="text-xs mt-2">{output.seo.keywords.join(", ")}</p>
                </OutputCard>
              )}
              {canSave && !saved && (
                <Button
                  variant="outline"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await saveResult({
                        tool: "product_description",
                        title: t("saveTitle"),
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
