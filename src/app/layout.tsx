import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import localFont from "next/font/local";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics/google-analytics";
import { AdSenseScript } from "@/components/ads/adsense";
import { JsonLd, organizationJsonLd } from "@/components/seo/json-ld";
import { getServerLocale } from "@/lib/i18n/server";
import { isRtlLocale } from "@/lib/i18n/config";
import { defaultMetadata } from "@/lib/seo/metadata";
import "./globals.css";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const delight = localFont({
  src: [
    {
      path: "../../public/fonts/delight-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/delight-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/delight-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/delight-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/delight-bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/delight-extrabold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/delight-black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-delight",
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${delight.variable} ${notoArabic.variable} h-full`}
    >
      <body className={`${delight.className} min-h-full flex flex-col antialiased`}>
        <JsonLd data={organizationJsonLd()} />
        <LocaleProvider locale={locale}>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </LocaleProvider>
        <Analytics />
        <AdSenseScript />
      </body>
    </html>
  );
}
