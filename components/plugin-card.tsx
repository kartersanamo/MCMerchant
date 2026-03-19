import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/star-rating";

export type PluginCardData = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  cover_image_url?: string | null;
  seller_username: string;
  rating: number;
  price_cents: number;
  total_downloads: number;
};

function formatPrice(priceCents: number) {
  if ((priceCents ?? 0) <= 0) return "Free";
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function PluginCard({ plugin }: { plugin: PluginCardData }) {
  return (
    <div className="group rounded-xl border border-gray-800 bg-gray-900/40 p-4 transition hover:border-gray-700">
      <Link href={`/plugin/${plugin.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-950">
          {plugin.cover_image_url ? (
            <Image
              src={plugin.cover_image_url}
              alt={`${plugin.name} cover`}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-gray-950" />
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-semibold text-gray-100">
              {plugin.name}
            </h3>
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-gray-400">
            {plugin.tagline ?? ""}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              by{" "}
              <span className="font-medium text-gray-100">
                {plugin.seller_username}
              </span>
            </div>
            <span className="rounded-full border border-gray-800 bg-gray-950 px-2 py-0.5 text-xs text-gray-200">
              {formatPrice(plugin.price_cents)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <StarRating rating={plugin.rating} />
            <div className="text-xs text-gray-400">
              {plugin.total_downloads.toLocaleString()} downloads
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

