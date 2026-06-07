import { ResumeForm } from "@/components/tools/resume-form";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { getEntitlements } from "@/lib/auth/entitlements";
import { getUserProfile } from "@/lib/quota/usage-service";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Resume Builder",
  description: "Build professional resumes with AI.",
  path: "/app/resume",
});

export default async function ResumeAppPage() {
  const profile = await getUserProfile();
  const entitlements = getEntitlements({ plan: profile?.plan ?? "free" });

  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader namespace="tools.resume" />
      <ResumeForm
        canExportPdf={entitlements.canExportPdf}
        canSave={entitlements.canSaveHistory}
      />
    </div>
  );
}
