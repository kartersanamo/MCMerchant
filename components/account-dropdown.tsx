"use client";

import Link from "next/link";
import { useRef, useEffect, useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuthedUser } from "@/lib/supabase/server";

function DefaultAvatarIcon({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        background:
          "linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 50%, rgba(236, 72, 153, 0.8) 100%)",
      }}
    >
      <svg
        className="h-[60%] w-[60%] text-white/95"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

export function AccountDropdown({ user }: { user: AuthedUser }) {
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      setOpen(false);
      setIsSigningOut(false);
      // Full navigation guarantees all SSR surfaces (header/footer) re-read cleared cookies.
      window.location.href = "/";
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-full"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <span className="flex h-9 w-9 overflow-hidden rounded-full border-2 border-gray-700 bg-gray-800 ring-1 ring-gray-600">
          <DefaultAvatarIcon className="flex h-full w-full items-center justify-center" />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
          <div className="p-3">
            {!user.emailVerified ? (
              <Link
                href={`/check-email?email=${encodeURIComponent(user.email)}&reason=verify_email`}
                className="mb-3 block rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 hover:bg-amber-500/15"
                onClick={() => setOpen(false)}
              >
                Verify your email to sell, upload plugins, download the loader, and post reviews.
              </Link>
            ) : null}
            <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Account
            </div>
            <div className="mt-2 space-y-2 rounded-lg border border-gray-800 bg-gray-950/30 p-3 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <div className="mt-0.5 text-gray-100">{user.displayName}</div>
              </div>
              <div>
                <span className="text-gray-500">Email</span>
                <div className="mt-0.5 text-gray-100 break-all">{user.email}</div>
              </div>
              <div>
                <span className="text-gray-500">Password</span>
                <div className="mt-0.5 text-gray-400">••••••••</div>
              </div>
            </div>
            <Link
              href="/account"
              className="mt-2 block rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-center text-sm text-gray-200 hover:border-gray-600 hover:bg-gray-800/80"
              onClick={() => setOpen(false)}
            >
              Account settings
            </Link>
          </div>

          <div className="border-t border-gray-800 p-2">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
