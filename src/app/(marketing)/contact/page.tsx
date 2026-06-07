import { ContactForm } from "@/components/marketing/contact-form";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Contact",
  description: "Get in touch with the Novora team. We'd love to hear from you.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Breadcrumbs items={[{ name: "Contact", href: "/contact" }]} />
      <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
      <p className="mt-4 text-muted-foreground">
        Have a question or feedback? Send us a message and we&apos;ll get back to you.
      </p>
      <ContactForm />
    </div>
  );
}
