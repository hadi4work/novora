"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Share2, ShoppingBag, FileText, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

const navItems = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/app/social-media", key: "socialMedia", icon: Share2 },
  { href: "/app/product-description", key: "productDescriptions", icon: ShoppingBag },
  { href: "/app/resume", key: "resumeBuilder", icon: FileText },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslations("nav");

  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <Logo size="sm" className="mb-6" />
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t pt-4">
          <SignOutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
