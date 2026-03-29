"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SaleEventCard } from "@/components/sale-event-card";
import { DealCard } from "@/components/deal-card";
import { SHOPS, MOCK_EVENTS, MOCK_SNAPSHOTS } from "@/lib/constants";
import type { SiteName } from "@/types/database";

export default function ShopDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const shop = SHOPS.find((s) => s.slug === slug);

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20">
        <h1 className="text-2xl font-bold text-white">Shop not found</h1>
        <Link href="/shops" className="text-blue-400 hover:underline">
          Back to Shops
        </Link>
      </div>
    );
  }

  const shopEvents = MOCK_EVENTS.filter((e) => e.site === slug);
  const shopSnapshots = MOCK_SNAPSHOTS.filter((s) => s.site === slug);

  return (
    <div className="flex flex-col gap-10 px-4 py-8 md:px-8">
      {/* Shop header / banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-10"
        style={{ backgroundColor: shop.color }}
      >
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold text-white backdrop-blur-sm">
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
              {shop.activeDeals !== undefined && (
                <p className="mt-1 text-sm font-medium text-white/80">
                  {shop.activeDeals} active deal
                  {shop.activeDeals !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <a
            href={shop.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            Visit {shop.name}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Current Promotions */}
      {shopEvents.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Current Promotions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {shopEvents.map((event) => (
              <SaleEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Deals from shop */}
      {shopSnapshots.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Deals from {shop.name}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {shopSnapshots.map((snapshot) => (
              <DealCard
                key={snapshot.id}
                model={snapshot.model!}
                price={snapshot.price}
                originalPrice={snapshot.original_price ?? snapshot.price}
                discountPct={snapshot.discount_pct ?? 0}
                site={snapshot.site as SiteName}
                url={snapshot.url}
                imageUrl={snapshot.model?.image_url ?? ""}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
