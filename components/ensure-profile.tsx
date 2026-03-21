"use client";


import { useRef, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function deriveUsernameFromEmail(email: string | null | undefined): string {
  const local = (email ?? "").split("@")[0] ?? "";
  const normalized = local
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 32);
  return normalized || "user";
}

export function EnsureProfile() {
  const tried = useRef(false);
  useEffect(() => {
    let cancelled = false;
    async function tryEnsureProfile(retries = 0) {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user || !user.id) {
        if (retries < 10 && !cancelled) {
          setTimeout(() => tryEnsureProfile(retries + 1), 500);
        }
        return;
      }
      // Only create profile if email is verified
      const isVerified = !!(user.email_confirmed_at || user.confirmed_at);
      if (!isVerified) return;
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!profile) {
        const username = deriveUsernameFromEmail(user.email);
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          username,
          display_name: username
        });
        if (error) {
          console.error("ensure-profile upsert failed:", error.message);
        }
      }
    }
    if (!tried.current) {
      tried.current = true;
      tryEnsureProfile();
    }
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
