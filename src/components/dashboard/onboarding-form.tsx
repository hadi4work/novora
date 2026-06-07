"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, ShoppingBag, FileText } from "lucide-react";
import { completeOnboarding } from "@/actions/profile";

const roles = [
  { id: "creator", label: "Content Creator", icon: Share2 },
  { id: "business", label: "Small Business", icon: ShoppingBag },
  { id: "jobseeker", label: "Job Seeker", icon: FileText },
  { id: "ecommerce", label: "E-commerce Seller", icon: ShoppingBag },
  { id: "freelancer", label: "Freelancer", icon: FileText },
];

const toolMap: Record<string, string> = {
  creator: "/app/social-media",
  business: "/app/social-media",
  jobseeker: "/app/resume",
  ecommerce: "/app/product-description",
  freelancer: "/app/resume",
};

export function OnboardingForm() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleComplete() {
    if (!selected) return;

    startTransition(async () => {
      await completeOnboarding(selected);
      router.push(toolMap[selected] ?? "/dashboard");
    });
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <CardTitle>Welcome to Novora!</CardTitle>
        <CardDescription>What best describes you? We&apos;ll recommend the right tool.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelected(role.id)}
              className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                selected === role.id
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <role.icon className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">{role.label}</span>
            </button>
          ))}
        </div>
        <Button
          className="w-full"
          disabled={!selected || isPending}
          onClick={handleComplete}
        >
          {isPending ? "Setting up..." : "Get started"}
        </Button>
      </CardContent>
    </Card>
  );
}
