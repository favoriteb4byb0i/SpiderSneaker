"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { PriceTag } from "@/components/price-tag";
import { DiscountBadge } from "@/components/discount-badge";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { formatPrice } from "@/lib/utils";
import type { Model, PriceSnapshot, ProductUrl, SiteName } from "@/types/database";

const siteLabels: Record<SiteName, string> = {
  zalando: "Zalando",
  aboutyou: "About You",
  snipes: "Snipes",
  nike: "Nike",
  adidas: "Adidas",
  footlocker: "Foot Locker",
  jdsports: "JD Sports",
  asphaltgold: "Asphaltgold",
  bstn: "BSTN",
  solebox: "Solebox",
};

interface ModelDetailClientProps {
  model: Model;
  prices: PriceSnapshot[];
  priceHistory: { date: string; price: number }[];
  productUrls: ProductUrl[];
}

export function ModelDetailClient({
  model,
  prices,
  priceHistory,
  productUrls,
}: ModelDetailClientProps) {
  // Deduplicate prices: keep only the latest snapshot per site
  const latestBySite = new Map<SiteName, PriceSnapshot>();
  for (const snap of prices) {
    const existing = latestBySite.get(snap.site);
    if (!existing || new Date(snap.checked_at) > new Date(existing.checked_at)) {
      latestBySite.set(snap.site, snap);
    }
  }
  const uniquePrices = Array.from(latestBySite.values());

  const bestDeal = uniquePrices.length
    ? uniquePrices.reduce((min, s) => (s.price < min.price ? s : min), uniquePrices[0])
    : null;

  return (
    <div className="flex flex-col gap-8 px-4 py-8 md:px-8">
      {/* Hero: image + info */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {/* Product image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-neutral-900 md:aspect-square md:w-1/2">
          {model.image_url ? (
            <Image
              src={model.image_url}
              alt={`${model.brand} ${model.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="text-5xl text-neutral-700">👟</div>
                <p className="mt-2 text-sm text-neutral-500">No image available</p>
              </div>
            </div>
          )}
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
            {model.sku && (
              <p className="mt-1 text-xs text-neutral-500">SKU: {model.sku}</p>
            )}
          </div>

          {/* Current best price */}
          {bestDeal ? (
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
                at {siteLabels[bestDeal.site] ?? bestDeal.site}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Price Status
              </p>
              <p className="text-sm text-neutral-400">
                Collecting prices... Check back soon.
              </p>
            </div>
          )}

          {/* Product URL links */}
          {productUrls.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                Available at
              </p>
              <div className="flex flex-wrap gap-2">
                {productUrls.map((pu) => (
                  <a
                    key={pu.id}
                    href={pu.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-neutral-600 hover:bg-neutral-700"
                  >
                    {siteLabels[pu.site] ?? pu.site}
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price comparison table */}
      {uniquePrices.length > 0 ? (
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
                {uniquePrices.map((snap) => (
                  <tr
                    key={snap.id}
                    className="border-b border-neutral-800 last:border-b-0"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-white">
                      {siteLabels[snap.site] ?? snap.site}
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
      ) : (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Price Comparison
          </h2>
          <div className="rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-8 text-center">
            <p className="text-neutral-400">
              Collecting prices... No price data available yet.
            </p>
          </div>
        </section>
      )}

      {/* Price History chart */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Price History
        </h2>
        <div className="rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-5">
          {priceHistory.length > 0 ? (
            <PriceHistoryChart data={priceHistory} height={280} />
          ) : (
            <div className="flex h-[280px] items-center justify-center">
              <p className="text-neutral-400">
                No price history yet. Data will appear as prices are tracked.
              </p>
            </div>
          )}
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
