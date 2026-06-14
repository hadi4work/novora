"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

const ROTATE_MS = 5000;

export function TestimonialsCarousel() {
  const { messages } = useLocale();
  const { t } = useTranslations("marketing");
  const testimonials = messages.marketing.testimonials;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, ROTATE_MS);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("testimonialsTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("testimonialsSubtitle")}</p>
        </div>

        <div className="relative mt-12 min-h-[220px]">
          {testimonials.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className={cn(
                "absolute inset-0 flex flex-col items-center text-center transition-all duration-700",
                index === active
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-4 opacity-0"
              )}
              aria-hidden={index !== active}
            >
              <Quote className="mb-4 h-8 w-8 text-primary/40" aria-hidden />
              <div className="mb-4 flex gap-1" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-primary text-primary"
                    aria-hidden
                  />
                ))}
              </div>
              <blockquote className="max-w-2xl text-lg leading-relaxed md:text-xl">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <footer className="mt-6">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </footer>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((item, index) => (
            <button
              key={`dot-${item.name}`}
              type="button"
              aria-label={`${t("testimonialsTitle")} ${index + 1}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === active ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
