"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useTranslations } from "@/components/providers/locale-provider";

export function Footer() {
  const { t } = useTranslations("marketing.footer");
  const { t: tc } = useTranslations("common");

  const footerLinks = {
    product: [
      { href: "/social-media-generator", label: t("socialMedia") },
      { href: "/product-description-generator", label: t("productDescriptions") },
      { href: "/resume-builder", label: t("resumeBuilder") },
      { href: "/pricing", label: t("pricing") },
    ],
    company: [
      { href: "/about", label: t("about") },
      { href: "/blog", label: t("blog") },
      { href: "/contact", label: t("contact") },
    ],
    legal: [
      { href: "/privacy-policy", label: t("privacy") },
      { href: "/terms", label: t("terms") },
    ],
  };

  const categories: Record<string, string> = {
    product: t("product"),
    company: t("company"),
    legal: t("legal"),
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo size="md" className="mb-2" />
            <p className="text-sm text-muted-foreground">{tc("tagline")}</p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-medium mb-3 text-sm">{categories[category]}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
