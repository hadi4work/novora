import { NextResponse } from "next/server";
import {
  handleSubscriptionEvent,
  verifyWebhook,
} from "@/lib/payments/payment-service";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("btcpay-sig") ?? "";

  try {
    const event = verifyWebhook("btcpay", payload, signature);

    if (event.type === "payment.ignored") {
      return NextResponse.json({ received: true, ignored: true });
    }

    await handleSubscriptionEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("BTCPay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
