import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { APP_NAME } from "@/lib/constants";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${APP_NAME}. Learn how we collect, use, and protect your data.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <Breadcrumbs items={[{ name: "Privacy Policy", href: "/privacy-policy" }]} />
      <h1>Privacy Policy</h1>
      <p>Last updated: June 2026</p>
      <h2>Information We Collect</h2>
      <p>
        We collect information you provide directly (email, name, content inputs) and usage data
        (generations, plan type) to operate the service.
      </p>
      <h2>How We Use Your Data</h2>
      <p>
        Your data is used to provide AI generation services, manage your account, process payments,
        and improve our platform. We do not sell your personal data.
      </p>
      <h2>Advertising</h2>
      <p>
        Free-plan users may see ads served by Adsterra. Third-party ad partners may use cookies
        to serve ads based on your visits to this site and other sites on the Internet.
      </p>
      <h2>AI Processing</h2>
      <p>
        Content you submit for generation is sent to our AI provider (xAI Grok) with server-side
        storage disabled. We retain generation history in your account per your plan.
      </p>
      <h2>Data Security</h2>
      <p>
        We use industry-standard encryption, secure authentication, and row-level database security
        to protect your information.
      </p>
      <h2>Your Rights</h2>
      <p>
        You may request access, correction, or deletion of your data by contacting
        support@novora-ai.com.
      </p>
      <h2>Contact</h2>
      <p>Questions? Email support@novora-ai.com.</p>
    </div>
  );
}
