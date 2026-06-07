import { HistoryPageContent } from "@/components/history/history-page-content";
import { getEntitlements } from "@/lib/auth/entitlements";
import { createClient } from "@/lib/auth/supabase-server";
import { getUserProfile } from "@/lib/quota/usage-service";
import { createMetadata } from "@/lib/seo/metadata";
import type { Generation, SavedResult } from "@/types";

export const metadata = createMetadata({
  title: "History",
  description: "Your generation history and saved results.",
  path: "/history",
});

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = await getUserProfile();
  const entitlements = getEntitlements({ plan: profile?.plan ?? "free" });

  const [{ data: generations }, { data: saved }] = await Promise.all([
    supabase
      .from("generations")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("saved_results")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const savedGenerationIds = (saved ?? [])
    .map((item) => item.generation_id)
    .filter((id): id is string => Boolean(id));

  return (
    <HistoryPageContent
      generations={(generations ?? []) as Generation[]}
      saved={(saved ?? []) as SavedResult[]}
      canExportPdf={entitlements.canExportPdf}
      canSaveHistory={entitlements.canSaveHistory}
      savedGenerationIds={savedGenerationIds}
    />
  );
}
