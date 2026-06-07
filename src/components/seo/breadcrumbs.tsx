import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const allItems = [{ name: "Home", href: "/" }, ...items];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(allItems)} />
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        {allItems.map((item, index) => (
          <span key={item.href} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3 w-3" />}
            {index === allItems.length - 1 ? (
              <span className="text-foreground">{item.name}</span>
            ) : (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.name}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
