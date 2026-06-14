"use client";

import { AADS_BLOG_UNIT } from "@/lib/ads/aads-config";

export function AAdsBlogUnit({ className }: { className?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-3xl ${className ?? ""}`}
      aria-label="Advertisement"
    >
      <iframe
        data-aa={AADS_BLOG_UNIT.id}
        src={AADS_BLOG_UNIT.src}
        title="Advertisement"
        className="mx-auto block w-full max-w-[728px] border-0"
        style={{ minHeight: 90, height: "auto" }}
      />
    </div>
  );
}
