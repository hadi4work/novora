import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { LanguageSwitcher } from "@/components/locale/language-switcher";
import { ThemeToggle } from "@/components/providers/theme-toggle";
import { UpgradeHandler } from "@/components/dashboard/upgrade-handler";
import { AdsterraLeaderboard } from "@/components/ads/adsterra";
import { createClient } from "@/lib/auth/supabase-server";
import { getEntitlements } from "@/lib/auth/entitlements";
import type { Profile } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userProfile = (profile as Profile) ?? {
    id: user.id,
    email: user.email ?? "",
    full_name: null,
    avatar_url: null,
    plan: "free" as const,
    role: "user" as const,
    plan_expires_at: null,
    onboarding_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const entitlements = getEntitlements(userProfile);

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={null}>
        <UpgradeHandler />
      </Suspense>
      <Sidebar plan={userProfile.plan} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
          <MobileNav plan={userProfile.plan} />
          <div className="flex items-center gap-2 ms-auto">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {userProfile.full_name ?? userProfile.email}
            </span>
            <LanguageSwitcher compact />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
        {entitlements.showAds && (
          <div className="border-t px-4 py-2">
            <AdsterraLeaderboard />
          </div>
        )}
      </div>
    </div>
  );
}
