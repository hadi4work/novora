"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "@/components/providers/locale-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, locales, localeLabels, isPending } = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label="Change language"
        className={cn(
          buttonVariants({
            variant: "ghost",
            size: compact ? "icon-sm" : "sm",
          }),
          "gap-1.5"
        )}
      >
        <Globe className="h-4 w-4" />
        {!compact && (
          <span className="hidden sm:inline">{localeLabels[locale]}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => setLocale(code as Locale)}
            className={locale === code ? "bg-accent" : undefined}
          >
            {localeLabels[code as Locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
