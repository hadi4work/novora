import { SocialMediaForm } from "@/components/tools/social-media-form";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { getEntitlements } from "@/lib/auth/entitlements";
import { getUserProfile } from "@/lib/quota/usage-service";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Social Media Generator",
  description: "Generate social media posts with AI.",
  path: "/app/social-media",
});

export default async function SocialMediaAppPage() {
  const profile = await getUserProfile();
  const entitlements = getEntitlements({ plan: profile?.plan ?? "free" });

  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader namespace="tools.socialMedia" />
      <SocialMediaForm
        allowedPlatforms={entitlements.allowedPlatforms}
        allowedTones={entitlements.socialMediaTones}
        canSave={entitlements.canSaveHistory}
      />
    </div>
  );
}
