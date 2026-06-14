"use client";

import { useTranslations } from "@/components/providers/locale-provider";

const BRANDS = [
  { name: "Google", logo: "/Google.svg", width: 36, height: 36, colored: true },
  { name: "BTCPay", logo: "/trusted/btcpay.svg", width: 120, height: 32, colored: false },
  { name: "Supabase", logo: "/trusted/supabase.svg", width: 140, height: 32, colored: false },
  { name: "Cloudflare", logo: "/trusted/cloudflare.svg", width: 150, height: 32, colored: false },
  { name: "Groq", logo: "/trusted/groq.svg", width: 90, height: 32, colored: false },
] as const;

function BrandLogo({ brand }: { brand: (typeof BRANDS)[number] }) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-center px-8 opacity-80 transition-opacity hover:opacity-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brand.logo}
        alt={brand.name}
        width={brand.width}
        height={brand.height}
        className={
          brand.colored
            ? "h-8 w-auto"
            : "h-7 w-auto opacity-70 dark:invert"
        }
      />
    </div>
  );
}

export function TrustedByMarquee() {
  const { t } = useTranslations("marketing");

  return (
    <section className="border-y bg-muted/20 py-10" aria-label={t("trustedByTitle")}>
      <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
        {t("trustedByTitle")}
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-marquee gap-4">
          {[...BRANDS, ...BRANDS].map((brand, index) => (
            <BrandLogo key={`${brand.name}-${index}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
}
