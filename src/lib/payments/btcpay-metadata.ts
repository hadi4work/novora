export interface BtcpayOrderMetadata {
  orderId: string;
  userId: string;
  plan: "pro" | "business";
  email: string;
}

export function encodeBtcpayMetadata(payload: BtcpayOrderMetadata): Record<string, string> {
  return {
    orderId: payload.orderId,
    userId: payload.userId,
    plan: payload.plan,
    email: payload.email,
  };
}

export function parseBtcpayMetadata(
  metadata: unknown
): BtcpayOrderMetadata | null {
  if (!metadata || typeof metadata !== "object") return null;

  const data = metadata as Record<string, unknown>;
  const orderId = data.orderId;
  const userId = data.userId;
  const plan = data.plan;
  const email = data.email;

  if (
    typeof orderId === "string" &&
    typeof userId === "string" &&
    (plan === "pro" || plan === "business") &&
    typeof email === "string"
  ) {
    return { orderId, userId, plan, email };
  }

  return null;
}
