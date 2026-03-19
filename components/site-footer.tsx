import Link from "next/link";
import Image from "next/image";

export function SiteFooter({ authedUserId }: { authedUserId: string | null }) {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/40">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Image
              src="/PlugdexMono.png"
              alt=""
              width={20}
              height={20}
              className="h-5 w-auto opacity-80"
            />
            <span>© {new Date().getFullYear()} Plugdex</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-300">
            {authedUserId ? (
              <Link href="/account/licenses" className="hover:text-gray-100">
                Licenses
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-gray-100">
                  Log in
                </Link>
                <Link href="/signup" className="hover:text-gray-100">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

