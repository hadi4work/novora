import { ProductDescriptionForm } from "@/components/tools/product-description-form";
import { ToolPageHeader } from "@/components/tools/tool-page-header";
import { getEntitlements } from "@/lib/auth/entitlements";
import { getUserProfile } from "@/lib/quota/usage-service";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Product Description Generator",
  description: "Generate product descriptions with AI.",
  path: "/app/product-description",
});

export default async function ProductDescriptionAppPage() {
  const profile = await getUserProfile();
  const entitlements = getEntitlements({ plan: profile?.plan ?? "free" });

  return (
    <div className="mx-auto max-w-6xl">
      <ToolPageHeader namespace="tools.product" />
      <ProductDescriptionForm
        allowedFormats={entitlements.productDescriptionFormats}
        canSave={entitlements.canSaveHistory}
      />
    </div>
  );
}
