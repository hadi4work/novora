"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslations("common");

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2 text-muted-foreground"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "..." : t("signOut")}
    </Button>
  );
}
