"use server";

import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/auth/supabase-server";
import { getEntitlements } from "@/lib/auth/entitlements";
import { logAuditEvent } from "@/lib/audit/audit-service";
import { registerResumePdfFonts } from "@/lib/pdf/register-fonts";
import { buildResumePdfDocument } from "@/lib/pdf/resume-document";
import { buildResumeDocxBuffer } from "@/lib/word/resume-document";
import { resumeOutputSchema } from "@/lib/validations/resume";

export async function exportResumePdf(data: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const entitlements = getEntitlements({ plan: profile?.plan ?? "free" });
  if (!entitlements.canExportPdf) {
    return { error: "Upgrade to Pro to export PDF" };
  }

  const parsed = resumeOutputSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid resume data" };
  }

  registerResumePdfFonts();
  const buffer = await renderToBuffer(buildResumePdfDocument(parsed.data));
  const base64 = Buffer.from(buffer).toString("base64");

  await logAuditEvent({
    action: "resume_export",
    resourceType: "resume",
    metadata: { template: parsed.data.template },
  });

  const filename = `${parsed.data.sections.header.name.replace(/\s+/g, "_")}_Resume.pdf`;

  return { success: true, base64, filename };
}

export async function exportResumeWord(data: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const entitlements = getEntitlements({ plan: profile?.plan ?? "free" });
  if (!entitlements.canExportPdf) {
    return { error: "Upgrade to Pro to export Word" };
  }

  const parsed = resumeOutputSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid resume data" };
  }

  const buffer = await buildResumeDocxBuffer(parsed.data);
  const base64 = Buffer.from(buffer).toString("base64");

  await logAuditEvent({
    action: "resume_export",
    resourceType: "resume",
    metadata: { template: parsed.data.template, format: "docx" },
  });

  const filename = `${parsed.data.sections.header.name.replace(/\s+/g, "_")}_Resume.docx`;

  return { success: true, base64, filename };
}
