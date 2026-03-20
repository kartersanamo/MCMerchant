import Link from "next/link";
import Image from "next/image";
import { AccountDropdown } from "@/components/account-dropdown";
import { AddDropdown } from "@/components/add-dropdown";
import type { AuthedUser } from "@/lib/supabase/server";

export function SiteHeader({ authedUser }: { authedUser: AuthedUser | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/MCMerchantMono.png"
            alt="MCMerchant"
            width={36}
            height={36}
            className="h-9 w-auto"
            priority
          />
          <span className="text-sm font-semibold text-gray-50">MCMerchant</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-300">
          <Link href="/browse" className="hover:text-gray-100" title="Marketplace catalog">
            Marketplace
          </Link>
          <Link href="/docs/loader" className="hover:text-gray-100">
            Loader
          </Link>
          {authedUser ? (
            <Link href="/account/licenses" className="hover:text-gray-100">
              Licenses
            </Link>
          ) : null}
          <Link href="/docs" className="hover:text-gray-100">
            Docs
          </Link>
          <Link href="/dashboard" className="hover:text-gray-100">
            Dashboard
          </Link>
          {authedUser ? (
            <Link href="/dashboard/storefront" className="hover:text-gray-100">
              Storefront
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {authedUser ? (
            <>
              <AddDropdown />
              <AccountDropdown user={authedUser} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-gray-800 bg-gray-950 px-3 py-1.5 text-gray-100 hover:border-gray-700"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand-500 px-3 py-1.5 font-medium text-gray-950 hover:brightness-110"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

