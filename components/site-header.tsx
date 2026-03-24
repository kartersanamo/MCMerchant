"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AccountDropdown } from "@/components/account-dropdown";
import { AddDropdown } from "@/components/add-dropdown";
import { useAuthedUser } from "@/lib/auth/use-authed-user";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-6 w-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export function SiteHeader() {
  const authedUser = useAuthedUser();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onResize() {
      if (window.matchMedia("(min-width: 768px)").matches) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinkClass = "block rounded-md py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-gray-100 md:inline md:py-0 md:hover:bg-transparent";
  const navLinkClassDesktop = "hover:text-gray-100";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:min-h-16 sm:gap-4 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Image
            src="/MCMerchantMono.png"
            alt="MCMerchant"
            width={36}
            height={36}
            className="h-8 w-auto sm:h-9"
            priority
            unoptimized
          />
          <span className="truncate text-sm font-semibold text-gray-50">MCMerchant</span>
        </Link>

        <nav
          className="hidden items-center gap-x-5 gap-y-1 text-sm text-gray-300 md:flex md:flex-wrap"
          aria-label="Main"
        >
          <Link href="/browse" className={navLinkClassDesktop} title="Marketplace catalog">
            Marketplace
          </Link>
          <Link href="/docs/loader" className={navLinkClassDesktop}>
            Loader
          </Link>
          {authedUser ? (
            <Link href="/account/licenses" className={navLinkClassDesktop}>
              Licenses
            </Link>
          ) : null}
          {authedUser && !authedUser.emailVerified ? (
            <Link
              href={`/check-email?email=${encodeURIComponent(authedUser.email)}&reason=verify_email`}
              className="text-amber-400/90 hover:text-amber-300"
            >
              Verify email
            </Link>
          ) : null}
          <Link href="/docs" className={navLinkClassDesktop}>
            Docs
          </Link>
          <Link href="/dashboard" className={navLinkClassDesktop}>
            Dashboard
          </Link>
          {authedUser?.emailVerified ? (
            <Link href="/dashboard/storefront" className={navLinkClassDesktop}>
              Storefront
            </Link>
          ) : null}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {authedUser ? (
            <>
              {authedUser.emailVerified ? <AddDropdown /> : null}
              <AccountDropdown user={authedUser} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-md border border-gray-800 bg-gray-950 px-2.5 py-1.5 text-xs text-gray-100 hover:border-gray-700 sm:px-3 sm:text-sm"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-md bg-brand-500 px-2.5 py-1.5 text-xs font-medium text-gray-950 hover:brightness-110 sm:px-3 sm:text-sm"
              >
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-800 text-gray-200 hover:bg-gray-900 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="site-mobile-nav"
          className="max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto border-t border-gray-800 bg-gray-950 px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-0.5" aria-label="Mobile">
            <Link href="/browse" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Marketplace
            </Link>
            <Link href="/docs/loader" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Loader
            </Link>
            {authedUser ? (
              <Link href="/account/licenses" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Licenses
              </Link>
            ) : null}
            {authedUser && !authedUser.emailVerified ? (
              <Link
                href={`/check-email?email=${encodeURIComponent(authedUser.email)}&reason=verify_email`}
                className={`${navLinkClass} text-amber-400/90`}
                onClick={() => setMenuOpen(false)}
              >
                Verify email
              </Link>
            ) : null}
            <Link href="/docs" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Docs
            </Link>
            <Link href="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            {authedUser?.emailVerified ? (
              <Link href="/dashboard/storefront" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Storefront
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
