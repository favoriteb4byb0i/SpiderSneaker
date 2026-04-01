"use client";

import Link from "next/link";
import { Zap, Bell, Package } from "lucide-react";
import { DealCard } from "@/components/deal-card";
import { ShopGrid } from "@/components/shop-grid";
import { SaleEventCard } from "@/components/sale-event-card";
import { PromoCard } from "@/components/promo-card";
import type { Model, PriceSnapshot, SaleEvent, Shop, ActivePromo } from "@/types/database";

interface HomeClientProps {
  deals: (PriceSnapshot & { model: Model })[];
  events: SaleEvent[];
  shops: Shop[];
  promos: ActivePromo[];
}

export function HomeClient({ deals, events, shops, promos }: HomeClientProps) {
  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Mobile Header */}
      <header className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-blue-500" />
          <span className="text-lg font-bold text-white">SneakerDeal</span>
        </div>
        <Link
          href="/notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A] border border-neutral-800 transition-colors hover:border-neutral-600"
        >
          <Bell size={20} className="text-neutral-300" />
        </Link>
      </header>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA3KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-40" />
        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Spring Sale is Here
          </h1>
          <p className="max-w-md text-base text-blue-100 md:text-lg">
            Up to 50% off on top brands
          </p>
          <Link
            href="/deals"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 transition-transform hover:scale-105 active:scale-95"
          >
            Explore Deals
          </Link>
        </div>
      </div>

      {/* Hot Deals Today */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">
          Hot Deals Today 🔥
        </h2>
        {deals.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {deals.map((snapshot) => (
              <div key={snapshot.id} className="w-56 shrink-0">
                <DealCard
                  model={snapshot.model}
                  price={Number(snapshot.price)}
                  originalPrice={Number(snapshot.original_price ?? snapshot.price)}
                  discountPct={Number(snapshot.discount_pct ?? 0)}
                  site={snapshot.site}
                  url={snapshot.url}
                  imageUrl={snapshot.model?.image_url ?? ""}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-[#1A1A1A] py-12">
            <Package size={40} className="text-neutral-600 mb-3" />
            <p className="text-base font-semibold text-neutral-400">
              Prices are being collected...
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* Aktuelle Aktionen (Current Promotions) */}
      {promos.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">
            Aktuelle Aktionen
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-2 md:overflow-x-visible">
            {promos.slice(0, 4).map((promo) => (
              <div key={promo.id} className="w-72 shrink-0 md:w-auto">
                <PromoCard promo={promo} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shops */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Shops</h2>
        <ShopGrid shops={shops} />
      </section>

      {/* Upcoming Sales */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Upcoming Sales</h2>
        {events.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <SaleEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-[#1A1A1A] py-12">
            <p className="text-base font-semibold text-neutral-400">
              No upcoming sales yet
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              We&apos;ll post new events as they&apos;re announced
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
