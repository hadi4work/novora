"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  History,
  LayoutDashboard,
  Settings,
  Share2,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/components/providers/locale-provider";
import type { Plan } from "@/types";

const navItems = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/app/social-media", key: "socialMedia", icon: Share2 },
  { href: "/app/product-description", key: "productDescriptions", icon: ShoppingBag },
  { href: "/app/resume", key: "resumeBuilder", icon: FileText },
  { href: "/history", key: "history", icon: History },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export function Sidebar({ plan }: { plan: Plan }) {
  const pathname = usePathname();
  const { t } = useTranslations("nav");
  const { t: tc } = useTranslations("common");

  return (
    <aside className="dashboard-sidebar relative hidden w-64 shrink-0 border-r bg-muted/20 lg:flex lg:flex-col lg:min-h-screen">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Logo href="/dashboard" size="sm" />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {t(item.key)}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4 lg:w-56">
        <div className="rounded-lg border bg-card p-3 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{tc("currentPlan")}</span>
            <Badge variant={plan === "free" ? "secondary" : "default"} className="capitalize">
              {tc(plan)}
            </Badge>
          </div>
          {plan === "free" && (
            <Button asChild size="sm" className="w-full mt-2">
              <Link href="/pricing">{tc("upgrade")}</Link>
            </Button>
          )}
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
