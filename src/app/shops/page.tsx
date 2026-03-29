"use client";

import { ShopGrid } from "@/components/shop-grid";
import { SaleEventCard } from "@/components/sale-event-card";
import { SHOPS, MOCK_EVENTS } from "@/lib/constants";

export default function ShopsPage() {
  return (
    <div className="flex flex-col gap-10 px-4 py-8 md:px-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Shops</h1>
        <p className="mt-2 text-neutral-400">
          Browse all supported shops and find the best sneaker deals.
        </p>
      </div>

      {/* Shop grid */}
      <ShopGrid shops={SHOPS} />

      {/* Featured Promotions */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Featured Promotions
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {MOCK_EVENTS.map((event) => (
            <SaleEventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
