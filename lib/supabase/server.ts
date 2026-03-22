import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createSupabaseServerClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
  }

  const cookieStore = cookies();

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as any);
          });
        } catch {
          // Server Components cannot mutate cookies. Supabase may try to clear the
          // session after a failed refresh (e.g. stale or revoked refresh_token).
        }
      }
    }
  });
}

export async function getAuthedUserId() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

export type AuthedUser = {
  id: string;
  email: string;
  displayName: string;
  /** False when Supabase allows sign-in before email confirmation (project setting). */
  emailVerified: boolean;
};

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;
  const userId = authData.user.id;
  const email = authData.user.email ?? "";
  const emailVerified = !!(authData.user.email_confirmed_at ?? authData.user.confirmed_at);
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();
  const displayName =
    profile?.username ??
    authData.user.user_metadata?.full_name ??
    authData.user.user_metadata?.name ??
    email.split("@")[0] ??
    "User";
  return { id: userId, email, displayName, emailVerified };
}

