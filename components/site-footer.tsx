"use client";

import Link from "next/link";
import Image from "next/image";
import { SUPPORT_DISCORD_URL, getPublicSourceRepoUrl } from "@/lib/app-url";
import { useAuthedUser } from "@/lib/auth/use-authed-user";

export function SiteFooter() {
  const authedUser = useAuthedUser();
  const sellerUnlocked = !!(authedUser?.emailVerified);
  const sourceRepoUrl = getPublicSourceRepoUrl();

  return (
    <footer className="border-t border-gray-800 bg-gray-950/40">
      <div className="mx-auto min-w-0 w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <Image
            src="/MCMerchantMono.png"
            alt="MCMerchant"
            width={20}
            height={20}
            className="h-5 w-auto shrink-0 opacity-80"
            unoptimized
          />
          <span className="min-w-0 break-words font-medium">© {new Date().getFullYear()} MCMerchant</span>
        </div>

        <div className="mt-8 grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Product</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/browse" className="hover:text-gray-100">
                  Browse all plugins
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-gray-100">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-gray-100">
                  Open dashboard
                </Link>
              </li>
              {authedUser && sellerUnlocked ? (
                <li>
                  <Link href="/dashboard/storefront" className="hover:text-gray-100">
                    Edit storefront
                  </Link>
                </li>
              ) : null}
              {authedUser && !sellerUnlocked ? (
                <li>
                  <Link
                    href={`/check-email?email=${encodeURIComponent(authedUser.email)}&reason=verify_email`}
                    className="text-amber-400/90 hover:text-amber-300"
                  >
                    Verify email to unlock seller tools
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">For developers</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/docs/loader#overview" className="hover:text-gray-100">
                  Quick start
                </Link>
              </li>
              <li>
                <Link href="/docs/loader#config" className="hover:text-gray-100">
                  mcmerchant.yml config
                </Link>
              </li>
              <li>
                <Link href="/docs/loader#commands" className="hover:text-gray-100">
                  Commands (/pdex)
                </Link>
              </li>
              <li>
                <Link href="/docs/loader#troubleshooting" className="hover:text-gray-100">
                  Troubleshooting
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Seller workflow</p>
            <ul className="space-y-2 text-sm text-gray-300">
              {sellerUnlocked ? (
                <>
                  <li>
                    <Link href="/dashboard/storefront" className="hover:text-gray-100">
                      Storefront settings
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/plugins" className="hover:text-gray-100">
                      Manage plugins
                    </Link>
                  </li>
                </>
              ) : authedUser ? (
                <li>
                  <Link
                    href={`/check-email?email=${encodeURIComponent(authedUser.email)}&reason=verify_email`}
                    className="text-amber-400/90 hover:text-amber-300"
                  >
                    Verify email for seller tools
                  </Link>
                </li>
              ) : (
                <li className="text-gray-500">Log in to manage plugins</li>
              )}
              <li>
                <Link href="/docs/for-sellers#versioning" className="hover:text-gray-100">
                  Managing versions
                </Link>
              </li>
              <li>
                <Link href="/docs/for-sellers#release-playbook" className="hover:text-gray-100">
                  Release checklist
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Account</p>
            <ul className="space-y-2 text-sm text-gray-300">
              {authedUser ? (
                <li>
                  <Link href="/dashboard" className="hover:text-gray-100">
                    Go to dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="hover:text-gray-100">
                      Member sign-in
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="hover:text-gray-100">
                      Register account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="min-w-0 space-y-3 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Need help?</p>
            <p className="text-sm leading-relaxed text-gray-300 break-words text-pretty">
              Start with{" "}
              <Link href="/docs/loader#troubleshooting" className="underline underline-offset-4 hover:text-gray-100">
                debugging checklist
              </Link>{" "}
              or jump straight to{" "}
              <Link href="/docs/loader#api-request" className="underline underline-offset-4 hover:text-gray-100">
                API endpoint details
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-10 flex min-w-0 flex-col gap-4 border-t border-gray-800 pt-6">
          <p className="text-xs leading-relaxed text-gray-500 break-words text-pretty">
            MCMerchant helps Minecraft developers sell under their own brand—marketplace discovery, storefronts, licensing, and
            verified loader updates.
          </p>
          <nav
            className="flex flex-col gap-3 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2"
            aria-label="Legal and social"
          >
            <Link href="/tos" className="w-fit hover:text-gray-300">
              Terms of Service
            </Link>
            <Link href="/privacy" className="w-fit hover:text-gray-300">
              Privacy Policy
            </Link>
            {sourceRepoUrl ? (
              <a
                className="w-fit hover:text-gray-300"
                href={sourceRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open source
              </a>
            ) : null}
            <a
              className="w-fit hover:text-gray-300"
              href={SUPPORT_DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord support
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
