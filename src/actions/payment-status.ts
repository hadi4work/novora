"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth/supabase-server";
import { getPaymentStatus } from "@/lib/payments/payment-service";

export async function checkPaymentStatus(paymentRef: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const result = await getPaymentStatus(paymentRef, user.id);

  if (result.status === "succeeded") {
    revalidatePath("/dashboard");
    revalidatePath("/settings");
  }

  return result;
}
