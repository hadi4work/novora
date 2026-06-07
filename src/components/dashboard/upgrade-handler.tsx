"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkPaymentStatus } from "@/actions/payment-status";
import { completeManualUpgrade } from "@/actions/subscription";

export function UpgradeHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const checkout = searchParams.get("checkout");
    const paymentRef = searchParams.get("payment");
    const upgraded = searchParams.get("upgraded");
    const plan = searchParams.get("plan") as "pro" | "business" | null;

    if (checkout === "pending" && paymentRef) {
      handled.current = true;
      toast.info("Confirming your payment...", {
        description: "This usually takes a few seconds.",
      });

      let attempts = 0;
      const maxAttempts = 10;

      const poll = async () => {
        attempts += 1;
        const result = await checkPaymentStatus(paymentRef);

        if ("error" in result) {
          toast.error(result.error);
          router.replace("/dashboard");
          return;
        }

        if (result.status === "succeeded") {
          toast.success("Payment confirmed!", {
            description: `Welcome to ${result.plan ?? "Pro"}!`,
          });
          router.replace("/dashboard");
          return;
        }

        if (result.status === "failed") {
          toast.error("Payment failed", {
            description: "Please try again from the pricing page.",
          });
          router.replace("/pricing");
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          toast.info("Payment still processing", {
            description: "Your plan will activate once NexaPay confirms payment.",
          });
          router.replace("/dashboard");
        }
      };

      poll();
      return;
    }

    if (checkout === "success") {
      handled.current = true;
      toast.success("Payment received!", {
        description: "Your plan will update shortly after confirmation.",
      });
      router.replace("/dashboard");
      return;
    }

    if (upgraded === "true" && plan) {
      handled.current = true;

      completeManualUpgrade(plan).then((result) => {
        if (result.success) {
          toast.success(`Welcome to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`, {
            description: "Your plan has been upgraded successfully.",
          });
        } else if (result.error) {
          toast.error(result.error);
        }
        router.replace("/dashboard");
      });
    }
  }, [searchParams, router]);

  return null;
}
