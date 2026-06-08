import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { APP_NAME } from "@/lib/constants";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Terms of Service",
  description: `Terms of service for ${APP_NAME}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-neutral dark:prose-invert">
      <Breadcrumbs items={[{ name: "Terms", href: "/terms" }]} />
      <h1>Terms of Service</h1>
      <p>Last updated: June 2026</p>
      <h2>Acceptance</h2>
      <p>By using {APP_NAME}, you agree to these terms.</p>
      <h2>Service Description</h2>
      <p>
        {APP_NAME} provides AI-powered content generation tools. Outputs are suggestions — you are
        responsible for reviewing and using generated content appropriately.
      </p>
      <h2>Accounts</h2>
      <p>You must provide accurate information and keep your credentials secure.</p>
      <h2>Subscriptions</h2>
      <p>
        Paid plans renew automatically unless canceled. Refunds are handled per our payment
        provider policies.
      </p>
      <h2>Acceptable Use</h2>
      <p>
        You may not use the service for spam, illegal content, or attempts to circumvent usage limits
        or security measures.
      </p>
      <h2>Limitation of Liability</h2>
      <p>
        {APP_NAME} is provided &quot;as is.&quot; We are not liable for damages arising from use of
        AI-generated content.
      </p>
      <h2>Contact</h2>
      <p>Questions? Email support@novora-ai.com.</p>
    </div>
  );
}
