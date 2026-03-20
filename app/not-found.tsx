import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-50">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-gray-300">
        The page you’re looking for doesn’t exist on MCMerchant.
      </p>

      <div className="mt-6">
        <Link
          href="/"
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-gray-950 shadow-sm transition hover:brightness-110"
        >
          Go to home
        </Link>
      </div>
    </div>
  );
}

