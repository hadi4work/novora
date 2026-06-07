"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelUserSubscription, openBillingPortal } from "@/actions/subscription";
import { useTranslations } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BillingActions({
  isPaidPlan,
  planExpiresAt,
}: {
  isPaidPlan: boolean;
  planExpiresAt?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();
  const { t } = useTranslations("settings");

  const canConfirmCancel = confirmText.trim().toLowerCase() === "yes";

  const daysUntilExpiry = planExpiresAt
    ? Math.ceil(
        (new Date(planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const showRenew = daysUntilExpiry !== null && daysUntilExpiry <= 7;

  function handleCancelDialogChange(open: boolean) {
    setCancelOpen(open);
    if (!open) setConfirmText("");
  }

  if (!isPaidPlan) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-2">
        {showRenew && (
          <Button asChild size="sm">
            <Link href="/pricing">{t("renewSubscription")}</Link>
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await openBillingPortal();
              if (result.error) {
                toast.error(result.error);
                return;
              }
              if (result.url) {
                if (result.url.startsWith("http")) {
                  window.location.href = result.url;
                } else {
                  router.push(result.url);
                }
              }
            })
          }
        >
          {t("managePlan")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => setCancelOpen(true)}
        >
          {t("cancelSubscription")}
        </Button>
      </div>

      {showRenew && (
        <p className="text-xs text-amber-600 dark:text-amber-400 pt-1">
          {t("expiresIn", { days: daysUntilExpiry ?? 0 })}
        </p>
      )}

      <Dialog open={cancelOpen} onOpenChange={handleCancelDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancelTitle")}</DialogTitle>
            <DialogDescription>{t("cancelDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-cancel">{t("typeYes")}</Label>
            <Input
              id="confirm-cancel"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="yes"
              autoComplete="off"
              disabled={isPending}
            />
          </div>
          <DialogFooter className="border-t-0 bg-transparent p-0 pt-2 sm:justify-end">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => handleCancelDialogChange(false)}
            >
              {t("keepSubscription")}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || !canConfirmCancel}
              onClick={() =>
                startTransition(async () => {
                  const result = await cancelUserSubscription();
                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(t("canceled"));
                  handleCancelDialogChange(false);
                  router.refresh();
                })
              }
            >
              {isPending ? t("canceling") : t("confirmCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
