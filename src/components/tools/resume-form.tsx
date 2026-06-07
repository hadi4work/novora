"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useFieldArray, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Plus, Trash2, Download, Upload, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuotaRewardDialog } from "@/components/ads/quota-reward-dialog";
import { ResumePreview } from "@/components/tools/resume-preview";
import { generateResumeAction } from "@/actions/generate";
import { useQuotaReward } from "@/hooks/use-quota-reward";
import { useTranslations } from "@/components/providers/locale-provider";
import { saveResult } from "@/actions/save";
import { exportResumePdf, exportResumeWord } from "@/actions/export-resume";
import { LANGUAGE_LEVELS, type LanguageLevel } from "@/lib/resume/types";
import type { ResumeTemplateId } from "@/lib/resume/types";

const TEMPLATE_LABEL_KEYS: Record<
  Exclude<ResumeTemplateId, "professional">,
  | "templateExecutive"
  | "templateModern"
  | "templateCreative"
  | "templateCorporate"
  | "templateClassic"
  | "templateAts"
> = {
  executive: "templateExecutive",
  modern: "templateModern",
  creative: "templateCreative",
  corporate: "templateCorporate",
  classic: "templateClassic",
  ats: "templateAts",
};
import {
  resumeSchema,
  type ResumeInput,
  type ResumeOutput,
} from "@/lib/validations/resume";

function firstValidationMessage(errors: FieldErrors<ResumeInput>): string {
  for (const value of Object.values(errors)) {
    if (!value) continue;
    if ("message" in value && typeof value.message === "string") {
      return value.message;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (!item) continue;
        for (const nested of Object.values(item)) {
          if (
            nested &&
            typeof nested === "object" &&
            "message" in nested &&
            typeof nested.message === "string"
          ) {
            return nested.message;
          }
        }
      }
    }
  }
  return "";
}

export function ResumeForm({
  canExportPdf,
  canSave,
}: {
  canExportPdf: boolean;
  canSave: boolean;
}) {
  const [activeTab, setActiveTab] = useState("form");
  const [output, setOutput] = useState<ResumeOutput | null>(null);
  const [generationId, setGenerationId] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    quotaDialogOpen,
    setQuotaDialogOpen,
    adRewardsRemaining,
    handleQuotaError,
    onRewardGranted,
  } = useQuotaReward();
  const { t } = useTranslations("tools.resume");
  const { t: tc } = useTranslations("common");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResumeInput>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      template: "executive",
      experience: [{ company: "", title: "", startDate: "", description: "" }],
      education: [{ institution: "", degree: "" }],
      skills: [],
      languages: [],
      photoUrl: undefined,
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience",
  });
  const { fields: eduFields, append: appendEdu } = useFieldArray({
    control,
    name: "education",
  });
  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({
    control,
    name: "languages",
  });

  const template = watch("template");

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("photoInvalid"));
      return;
    }

    if (file.size > 1_000_000) {
      toast.error(t("photoTooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setValue("photoUrl", result, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhotoPreview(null);
    setValue("photoUrl", undefined, { shouldValidate: false });
  }

  useEffect(() => {
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setValue("skills", skills, { shouldValidate: false });
  }, [skillsText, setValue]);

  function onSubmit(data: ResumeInput) {
    startTransition(async () => {
      setOutput(null);
      setSaved(false);
      const result = await generateResumeAction(data);

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
      setActiveTab("preview");
      toast.success(t("generated"));
    });
  }

  function onInvalid(formErrors: FieldErrors<ResumeInput>) {
    toast.error(firstValidationMessage(formErrors) || t("fillRequired"));
  }

  function downloadFile(
    mime: string,
    exportFn: (data: ResumeOutput) => Promise<{
      success?: boolean;
      base64?: string;
      filename?: string;
      error?: string;
    }>,
    successMessage: string
  ) {
    if (!output) return;

    startTransition(async () => {
      const result = await exportFn(output);

      if (!result.success || !result.base64) {
        toast.error(result.error ?? t("exportFailed"));
        return;
      }

      const link = document.createElement("a");
      link.href = `data:${mime};base64,${result.base64}`;
      link.download = result.filename ?? "Resume";
      link.click();
      toast.success(successMessage);
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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="form">{t("build")}</TabsTrigger>
        <TabsTrigger value="preview" disabled={!output}>
          {t("preview")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form">
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-6 max-w-2xl"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("fullName")}</Label>
              <Input {...register("fullName")} placeholder={t("namePlaceholder")} />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input {...register("email")} type="email" placeholder={t("emailPlaceholder")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("phone")}</Label>
              <Input {...register("phone")} placeholder={t("phonePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("location")}</Label>
              <Input {...register("location")} placeholder={t("locationPlaceholder")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("summary")}</Label>
            <Textarea {...register("summary")} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>{t("photo")}</Label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt=""
                    className="h-20 w-20 rounded-full object-cover border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -end-2 h-6 w-6"
                    onClick={removePhoto}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border border-dashed text-muted-foreground hover:bg-muted/50">
                  <Upload className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">{t("photoHint")}</p>
            </div>
            {errors.photoUrl && (
              <p className="text-sm text-destructive">{errors.photoUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("template")}</Label>
            <Select
              value={template}
              onValueChange={(v) => setValue("template", v as ResumeInput["template"])}
            >
              <SelectTrigger className="w-full">
                {template && template !== "professional"
                  ? t(TEMPLATE_LABEL_KEYS[template as keyof typeof TEMPLATE_LABEL_KEYS])
                  : template === "professional"
                    ? t("templateClassic")
                    : null}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">{t("templateExecutive")}</SelectItem>
                <SelectItem value="modern">{t("templateModern")}</SelectItem>
                <SelectItem value="creative">{t("templateCreative")}</SelectItem>
                <SelectItem value="corporate">{t("templateCorporate")}</SelectItem>
                <SelectItem value="classic">{t("templateClassic")}</SelectItem>
                <SelectItem value="ats">{t("templateAts")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t(
                (`templateDesc_${template}`) as
                  | "templateDesc_executive"
                  | "templateDesc_modern"
                  | "templateDesc_creative"
                  | "templateDesc_corporate"
                  | "templateDesc_classic"
                  | "templateDesc_ats"
                  | "templateDesc_professional"
              )}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t("experience")}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  appendExp({ company: "", title: "", startDate: "", description: "" })
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.experience?.message && (
              <p className="text-sm text-destructive mb-2">{errors.experience.message}</p>
            )}
            {expFields.map((field, i) => (
              <div key={field.id} className="rounded-lg border p-4 mb-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input {...register(`experience.${i}.title`)} placeholder={`${t("jobTitle")} *`} />
                    {errors.experience?.[i]?.title && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.experience[i]?.title?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input {...register(`experience.${i}.company`)} placeholder={`${t("company")} *`} />
                    {errors.experience?.[i]?.company && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.experience[i]?.company?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input {...register(`experience.${i}.startDate`)} placeholder={`${t("startDate")} *`} />
                    {errors.experience?.[i]?.startDate && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.experience[i]?.startDate?.message}
                      </p>
                    )}
                  </div>
                  <Input {...register(`experience.${i}.endDate`)} placeholder={t("endDate")} />
                </div>
                <div>
                  <Textarea
                    {...register(`experience.${i}.description`)}
                    placeholder={`${t("roleDescription")} *`}
                    rows={2}
                  />
                  {errors.experience?.[i]?.description && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.experience[i]?.description?.message}
                    </p>
                  )}
                </div>
                {expFields.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeExp(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t("education")}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => appendEdu({ institution: "", degree: "" })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.education?.message && (
              <p className="text-sm text-destructive mb-2">{errors.education.message}</p>
            )}
            {eduFields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <Input {...register(`education.${i}.institution`)} placeholder={`${t("institution")} *`} />
                  {errors.education?.[i]?.institution && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.education[i]?.institution?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input {...register(`education.${i}.degree`)} placeholder={`${t("degree")} *`} />
                  {errors.education?.[i]?.degree && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.education[i]?.degree?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>{t("skills")} *</Label>
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder={t("skillsPlaceholder")}
            />
            {errors.skills && (
              <p className="text-sm text-destructive">{errors.skills.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t("languages")}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => appendLang({ name: "", level: "intermediate" })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {langFields.length === 0 && (
              <p className="text-xs text-muted-foreground mb-2">{t("languagesHint")}</p>
            )}
            {langFields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-[1fr_160px_auto] gap-2 mb-2">
                <Input
                  {...register(`languages.${i}.name`)}
                  placeholder={t("languageNamePlaceholder")}
                />
                <Select
                  value={watch(`languages.${i}.level`)}
                  onValueChange={(v) =>
                    setValue(`languages.${i}.level`, v as LanguageLevel)
                  }
                >
                  <SelectTrigger>
                    {watch(`languages.${i}.level`)
                      ? t(`level_${watch(`languages.${i}.level`)}` as "level_native")
                      : t("languageLevel")}
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {t(`level_${level}` as "level_native")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLang(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isPending ? t("generating") : t("generate")}
          </Button>
          {remaining !== null && (
            <p className="text-xs text-muted-foreground">
              {tc("remaining", { count: remaining })}
            </p>
          )}
        </form>
      </TabsContent>

      <TabsContent value="preview">
        {output && (
          <div className="space-y-4">
            <ResumePreview data={output} />
            <div className="flex gap-2 justify-center">
              {canExportPdf ? (
                <>
                  <Button
                    onClick={() =>
                      downloadFile(
                        "application/pdf",
                        exportResumePdf,
                        t("pdfDownloaded")
                      )
                    }
                    disabled={isPending}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isPending ? t("exporting") : t("exportPdf")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadFile(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        exportResumeWord,
                        t("wordDownloaded")
                      )
                    }
                    disabled={isPending}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isPending ? t("exportingWord") : t("exportWord")}
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("pdfRequiresPro")}{" "}
                    <Link href="/pricing" className="text-primary underline">
                      {tc("upgrade")}
                    </Link>
                  </p>
                </div>
              )}
              {canSave && !saved && (
                <Button
                  variant="outline"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await saveResult({
                        tool: "resume",
                        title: output.sections.header.name + t("resumeSuffix"),
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
                  {t("saveBtn")}
                </Button>
              )}
              {canSave && saved && (
                <Button variant="secondary" disabled>
                  {tc("alreadySaved")}
                </Button>
              )}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
    </>
  );
}
