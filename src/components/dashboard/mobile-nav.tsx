"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import {
  dashboardNavItems,
  isDashboardNavActive,
} from "@/components/dashboard/dashboard-nav-items";
import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Plan } from "@/types";

export function MobileNav({ plan }: { plan: Plan }) {
  const pathname = usePathname();
  const { t } = useTranslations("nav");
  const { t: tc } = useTranslations("common");

  return (
    <Sheet>
      <SheetTrigger
        className="inline-flex lg:hidden h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="flex w-64 flex-col">
        <Logo href="/dashboard" size="sm" className="mb-6" />
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {dashboardNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isDashboardNavActive(pathname, item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t pt-4">
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
      </SheetContent>
    </Sheet>
  );
}
