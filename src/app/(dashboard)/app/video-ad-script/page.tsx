import { VideoAdScriptForm } from "@/components/tools/video-ad-script-form";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { getEntitlements } from "@/lib/auth/entitlements";
import { getUserProfile } from "@/lib/quota/usage-service";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Video Ad Script Generator",
  description: "Generate professional video ad scripts with hooks, timestamps, and visual cues.",
  path: "/app/video-ad-script",
});

export default async function VideoAdScriptAppPage() {
  const profile = await getUserProfile();
  const entitlements = getEntitlements({ plan: profile?.plan ?? "free" });

  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader namespace="tools.videoAdScript" />
      <VideoAdScriptForm
        allowedTones={entitlements.videoAdTones}
        allowedDurations={entitlements.videoAdDurations}
        canImportProductUrl={entitlements.canImportProductUrl}
        canSave={entitlements.canSaveHistory}
      />
    </div>
  );
}
