"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PriceTag } from "@/components/price-tag";
import { DiscountBadge } from "@/components/discount-badge";
import { PriceHistoryChart } from "@/components/price-history-chart";
import {
  MOCK_MODELS,
  MOCK_SNAPSHOTS,
  MOCK_PRICE_HISTORY,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { SiteName } from "@/types/database";

const siteLabels: Record<SiteName, string> = {
  zalando: "Zalando",
  aboutyou: "About You",
  snipes: "Snipes",
  snkrs: "SNKRS",
};

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();

  const model = MOCK_MODELS.find((m) => m.id === id);

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20">
        <h1 className="text-2xl font-bold text-white">Model not found</h1>
        <Link href="/" className="text-blue-400 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const modelSnapshots = MOCK_SNAPSHOTS.filter((s) => s.model_id === model.id);
  const bestDeal = modelSnapshots.length
    ? modelSnapshots.reduce((min, s) => (s.price < min.price ? s : min), modelSnapshots[0])
    : null;

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8">
      {/* Hero: image + info */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {/* Product image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900 md:aspect-square md:w-1/2">
          <Image
            src={model.image_url ?? ""}
            alt={`${model.brand} ${model.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Model info */}
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <span className="inline-flex rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-300">
              {model.brand}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              {model.name}
            </h1>
            {model.category && (
              <p className="mt-1 text-sm text-neutral-400">{model.category}</p>
            )}
          </div>

          {/* Current best price */}
          {bestDeal && (
            <div className="flex flex-col gap-2 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Current Best Price
              </p>
              <div className="flex items-center gap-3">
                <PriceTag
                  original={bestDeal.original_price ?? bestDeal.price}
                  sale={bestDeal.price}
                  size="lg"
                />
                {bestDeal.discount_pct != null && bestDeal.discount_pct > 0 && (
                  <DiscountBadge percent={bestDeal.discount_pct} size="lg" />
                )}
              </div>
              <p className="text-xs text-neutral-400">
                at {siteLabels[bestDeal.site]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Price comparison table */}
      {modelSnapshots.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Price Comparison
          </h2>
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#1A1A1A]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Shop
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Price
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Discount
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody>
                {modelSnapshots.map((snap) => (
                  <tr
                    key={snap.id}
                    className="border-b border-neutral-800 last:border-b-0"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-white">
                      {siteLabels[snap.site]}
                    </td>
                    <td className="px-5 py-4 text-sm tabular-nums text-white">
                      {formatPrice(snap.price)}
                    </td>
                    <td className="px-5 py-4">
                      {snap.discount_pct != null && snap.discount_pct > 0 ? (
                        <DiscountBadge percent={snap.discount_pct} size="sm" />
                      ) : (
                        <span className="text-sm text-neutral-500">--</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={snap.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300"
                      >
                        Go to deal
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Price History chart */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Price History
        </h2>
        <div className="rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-5">
          <PriceHistoryChart data={MOCK_PRICE_HISTORY} height={280} />
        </div>
      </section>

      {/* Add to Watchlist button - sticky on mobile */}
      <div className="sticky bottom-4 z-20 md:static">
        <button
          type="button"
          className="w-full rounded-2xl bg-blue-600 py-4 text-base font-bold text-white transition-colors hover:bg-blue-500 active:bg-blue-700"
        >
          Add to Watchlist
        </button>
      </div>
    </div>
  );
}
