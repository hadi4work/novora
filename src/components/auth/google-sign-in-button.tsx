"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/providers/locale-provider";

export function GoogleSignInButton({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslations("auth");

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2.5"
      disabled={disabled}
      onClick={onClick}
    >
      <Image src="/Google.svg" alt="" width={18} height={18} className="shrink-0" />
      {t("continueWithGoogle")}
    </Button>
  );
}
