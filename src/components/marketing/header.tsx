import { Logo } from "@/components/brand/logo";
import { HeaderNav } from "@/components/marketing/header-nav";
import { createClient } from "@/lib/auth/supabase-server";
import { isSupabaseConfigured } from "@/lib/auth/env";

export async function Header() {
  let user = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Supabase not configured yet
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo href="/" size="md" />

        <HeaderNav isLoggedIn={!!user} />
      </div>
    </header>
  );
}
