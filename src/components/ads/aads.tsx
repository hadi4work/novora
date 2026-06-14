import { AADS_UNIT } from "@/lib/ads/aads-config";

export function AAdsBlogUnit({ className }: { className?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-3xl ${className ?? ""}`}
      aria-label="Advertisement"
    >
      <iframe
        data-aa={AADS_UNIT.id}
        src={AADS_UNIT.src}
        title="Advertisement"
        style={{
          border: 0,
          padding: 0,
          width: "100%",
          height: "100%",
          minHeight: 90,
          overflow: "hidden",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
