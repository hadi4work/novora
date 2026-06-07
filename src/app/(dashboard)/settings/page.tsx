import { SettingsPageContent } from "@/components/settings/settings-page-content";
import { getUserProfile } from "@/lib/quota/usage-service";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Settings",
  description: "Manage your Novora account settings.",
  path: "/settings",
});

export default async function SettingsPage() {
  const profile = await getUserProfile();

  return (
    <SettingsPageContent
      profile={
        profile
          ? {
              full_name: profile.full_name,
              email: profile.email,
              plan: profile.plan,
              plan_expires_at: profile.plan_expires_at,
            }
          : null
      }
    />
  );
}
