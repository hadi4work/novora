"use client";

import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

type BrandLogoConfig = {
  name: string;
  logo?: string;
  logoLight?: string;
  logoDark?: string;
  className?: string;
};

const BRANDS: BrandLogoConfig[] = [
  { name: "Google", logo: "/trusted/Google_Logo_0.svg", className: "h-8" },
  { name: "BTCPay", logo: "/trusted/BTCPay_Server_idToVRZqZ0_1.svg", className: "h-9" },
  {
    name: "Supabase",
    logoLight: "/trusted/Supabase_id9q7Wa4Ba_0.svg",
    logoDark: "/trusted/Supabase_idZ_4AZztt_0.svg",
    className: "h-7",
  },
  {
    name: "Cloudflare",
    logo: "/trusted/Cloudflare_Logo_0.svg",
    className: "h-7 brightness-0 dark:brightness-100",
  },
  {
    name: "Groq",
    logo: "/trusted/Groq_idNEjj1u3o_0.svg",
    className: "h-7 dark:invert",
  },
  {
    name: "Meta",
    logoLight: "/trusted/Meta_idlf4cVSsS_0.svg",
    logoDark: "/trusted/Meta_idW0736plJ_0.svg",
    className: "h-7",
  },
];

function BrandLogo({ brand }: { brand: BrandLogoConfig }) {
  const imageClass = cn("w-auto max-w-[160px] object-contain", brand.className);

  if (brand.logoLight && brand.logoDark) {
    return (
      <div className="flex h-12 shrink-0 items-center justify-center px-8 opacity-80 transition-opacity hover:opacity-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logoLight}
          alt={brand.name}
          className={cn(imageClass, "dark:hidden")}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logoDark}
          alt={brand.name}
          className={cn(imageClass, "hidden dark:block")}
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 shrink-0 items-center justify-center px-8 opacity-80 transition-opacity hover:opacity-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={brand.logo!} alt={brand.name} className={imageClass} />
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
