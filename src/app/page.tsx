"use client";

import Link from "next/link";
import { Zap, Bell } from "lucide-react";
import { DealCard } from "@/components/deal-card";
import { ShopGrid } from "@/components/shop-grid";
import { SaleEventCard } from "@/components/sale-event-card";
import { MOCK_SNAPSHOTS, SHOPS, MOCK_EVENTS } from "@/lib/constants";

export default function HomePage() {
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
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {MOCK_SNAPSHOTS.map((snapshot) => (
            <div key={snapshot.id} className="w-56 shrink-0">
              <DealCard
                model={snapshot.model!}
                price={snapshot.price}
                originalPrice={snapshot.original_price ?? snapshot.price}
                discountPct={snapshot.discount_pct ?? 0}
                site={snapshot.site}
                url={snapshot.url}
                imageUrl={snapshot.model!.image_url ?? ""}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Shops */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Shops</h2>
        <ShopGrid shops={SHOPS} />
      </section>

      {/* Upcoming Sales */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Upcoming Sales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {MOCK_EVENTS.map((event) => (
            <SaleEventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
