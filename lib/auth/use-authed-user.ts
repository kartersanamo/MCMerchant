"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthedUser } from "@/lib/authed-user";

export function useAuthedUser(): AuthedUser | null {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<AuthedUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user: u }
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!u) {
        setUser(null);
        return;
      }
      const email = u.email ?? "";
      const emailVerified = !!(u.email_confirmed_at ?? u.confirmed_at);

      const { data: profile } = await supabase.from("profiles").select("username").eq("id", u.id).maybeSingle();
      if (cancelled) return;

      const displayName =
        profile?.username ??
        (u.user_metadata?.full_name as string | undefined) ??
        (u.user_metadata?.name as string | undefined) ??
        email.split("@")[0] ??
        "User";

      setUser({ id: u.id, email, displayName, emailVerified });
    }

    void load();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return user;
}
