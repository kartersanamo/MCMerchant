import Link from "next/link";
import Image from "next/image";

export function SiteFooter({ authedUserId }: { authedUserId: string | null }) {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/40">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Image
            src="/MCMerchantMono.png"
            alt=""
            width={20}
            height={20}
            className="h-5 w-auto opacity-80"
          />
          <span className="font-medium">© {new Date().getFullYear()} MCMerchant</span>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Product</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <Link href="/browse" className="hover:text-gray-100">
                      Marketplace
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs" className="hover:text-gray-100">
                      Docs
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-gray-100">
                      Dashboard
                    </Link>
                  </li>
                  {authedUserId ? (
                    <li>
                      <Link href="/dashboard/storefront" className="hover:text-gray-100">
                        Storefront
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">For developers</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <Link href="/docs#quickstart" className="hover:text-gray-100">
                      Quick start
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs#config" className="hover:text-gray-100">
                      mcmerchant.yml config
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs#commands" className="hover:text-gray-100">
                      Commands (/pdex)
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs#troubleshooting" className="hover:text-gray-100">
                      Troubleshooting
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Seller workflow</p>
                <ul className="space-y-2 text-sm text-gray-300">
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
                  <li>
                    <Link href="/docs#seller-versions" className="hover:text-gray-100">
                      Managing versions
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs#release-checklist" className="hover:text-gray-100">
                      Release checklist
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Account</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  {authedUserId ? (
                    <li>
                      <Link href="/dashboard" className="hover:text-gray-100">
                        Go to dashboard
                      </Link>
                    </li>
                  ) : (
                    <>
                      <li>
                        <Link href="/login" className="hover:text-gray-100">
                          Log in
                        </Link>
                      </li>
                      <li>
                        <Link href="/signup" className="hover:text-gray-100">
                          Sign up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Need help?</p>
                <p className="text-sm text-gray-300">
                  Start with{" "}
                  <Link href="/docs#debug-console" className="underline underline-offset-4 hover:text-gray-100">
                    debugging checklist
                  </Link>{" "}
                  or jump straight to{" "}
                  <Link href="/docs#api" className="underline underline-offset-4 hover:text-gray-100">
                    API endpoint details
                  </Link>
                  .
                </p>
              </div>
            </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-500">
            MCMerchant helps Minecraft developers sell under their own brand—marketplace discovery, storefronts, licensing, and
            verified loader updates.
          </p>
          <div className="flex w-full flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
            <a className="hover:text-gray-300" href="https://github.com/">
              GitHub
            </a>
            <a className="hover:text-gray-300" href="mailto:support@mcmmerchant.net">
              support@mcmmerchant.net
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

