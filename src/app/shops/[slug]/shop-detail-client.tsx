"use client";

import { ExternalLink } from "lucide-react";
import { SaleEventCard } from "@/components/sale-event-card";
import { DealCard } from "@/components/deal-card";
import { PromoCard } from "@/components/promo-card";
import type { Shop, SaleEvent, PriceSnapshot, Model, SiteName, ActivePromo } from "@/types/database";

interface ShopDetailClientProps {
  shop: Shop;
  events: SaleEvent[];
  deals: (PriceSnapshot & { model: Model })[];
  promos: ActivePromo[];
}

export function ShopDetailClient({ shop, events, deals, promos }: ShopDetailClientProps) {
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

      {/* Aktive Aktionen (Active Promos) */}
      {promos.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Aktive Aktionen
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {promos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        </section>
      )}

      {/* Current Promotions */}
      {events.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Current Promotions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <SaleEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Deals from shop */}
      {deals.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Deals from {shop.name}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                model={deal.model}
                price={deal.price}
                originalPrice={deal.original_price ?? deal.price}
                discountPct={deal.discount_pct ?? 0}
                site={deal.site as SiteName}
                url={deal.url}
                imageUrl={deal.model?.image_url ?? ""}
              />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Deals from {shop.name}
          </h2>
          <div className="rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-8 text-center">
            <p className="text-neutral-400">
              No deals found for {shop.name} yet. Check back soon!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
