import { createHash } from "crypto";
import { headers } from "next/headers";
import { createClient, createServiceClient } from "@/lib/auth/supabase-server";

function hashIp(ip: string): string {
  const salt = process.env.AUDIT_IP_SALT ?? "novora-default-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

async function getIpHash(): Promise<string | null> {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip");
    return ip ? hashIp(ip) : null;
  } catch {
    return null;
  }
}

export async function logAuditEvent(params: {
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
}) {
  try {
    const ipHash = await getIpHash();
    let userId = params.userId;

    if (!userId) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    }

    const serviceClient = createServiceClient();
    await serviceClient.from("audit_logs").insert({
      user_id: userId ?? null,
      action: params.action,
      resource_type: params.resourceType ?? null,
      resource_id: params.resourceId ?? null,
      ip_hash: ipHash,
      metadata: params.metadata ?? {},
    });
  } catch {
    // Audit logging should not break user flows
  }
}
