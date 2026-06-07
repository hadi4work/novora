import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/auth/env";
import type { User } from "@supabase/supabase-js";

type MiddlewareSupabaseClient = ReturnType<typeof createServerClient>;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return {
      supabaseResponse,
      user: null as User | null,
      supabase: null as MiddlewareSupabaseClient | null,
    };
  }

  const supabase = createServerClient(getSupabaseUrl()!, getSupabaseAnonKey()!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabaseResponse, user, supabase };
  } catch {
    return {
      supabaseResponse,
      user: null as User | null,
      supabase: null as MiddlewareSupabaseClient | null,
    };
  }
}
