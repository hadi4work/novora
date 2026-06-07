"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { useTranslations } from "@/components/providers/locale-provider";

export function ProfileForm({
  fullName,
  email,
}: {
  fullName: string | null;
  email: string;
}) {
  const [name, setName] = useState(fullName ?? "");
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslations("settings");
  const { t: ta } = useTranslations("auth");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const formData = new FormData();
          formData.set("fullName", name);
          const result = await updateProfile(formData);
          if (result.success) toast.success(t("profileUpdated"));
          else toast.error(result.error);
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">{ta("fullName")}</Label>
        <Input
          id="fullName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("yourName")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">{ta("email")}</Label>
        <Input id="email" value={email} disabled className="bg-muted" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
