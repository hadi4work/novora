import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
