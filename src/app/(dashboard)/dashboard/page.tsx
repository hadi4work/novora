import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { getUserProfile, getUsageInfo } from "@/lib/quota/usage-service";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Your Novora dashboard.",
  path: "/dashboard",
});

export default async function DashboardPage() {
  const profile = await getUserProfile();
  const usage = profile ? await getUsageInfo(profile) : null;

  return (
    <DashboardHome
      firstName={profile?.full_name?.split(" ")[0]}
      usage={usage}
      isFree={profile?.plan === "free"}
    />
  );
}
