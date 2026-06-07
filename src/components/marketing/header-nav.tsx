"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/locale/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { useTranslations } from "@/components/providers/locale-provider";

const navHrefs = [
  { href: "/features", key: "features" },
  { href: "/pricing", key: "pricing" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
] as const;

export function HeaderNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t } = useTranslations("nav");
  const { t: tc } = useTranslations("common");

  return (
    <div className="flex flex-1 items-center justify-between gap-4 ms-4">
      <nav className="hidden items-center gap-6 md:flex">
        {navHrefs.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t(link.key)}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 ms-auto">
        <ThemeToggle />
        <LanguageSwitcher compact />
        {isLoggedIn ? (
          <Button asChild size="sm">
            <Link href="/dashboard">{t("dashboard")}</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">{tc("getStarted")}</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
