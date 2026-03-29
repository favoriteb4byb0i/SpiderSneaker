"use client";

import { useState, useMemo } from "react";
import { DealCard } from "@/components/deal-card";
import { MOCK_SNAPSHOTS, BRAND_OPTIONS, SIZE_OPTIONS } from "@/lib/constants";

export default function DealsPage() {
  const [brand, setBrand] = useState<string>("all");
  const [size, setSize] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const filtered = useMemo(() => {
    return MOCK_SNAPSHOTS.filter((s) => {
      if (brand !== "all" && s.model?.brand !== brand) return false;
      if (maxPrice && s.price > Number(maxPrice)) return false;
      return true;
    });
  }, [brand, size, maxPrice]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          All Deals
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          {filtered.length} deal{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-4">
        {/* Brand Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="brand-filter" className="text-xs font-medium text-neutral-400">
            Brand
          </label>
          <select
            id="brand-filter"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm text-white outline-none transition-colors focus:border-blue-500"
          >
            <option value="all">All Brands</option>
            {BRAND_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Size Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="size-filter" className="text-xs font-medium text-neutral-400">
            Size (EU)
          </label>
          <select
            id="size-filter"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm text-white outline-none transition-colors focus:border-blue-500"
          >
            <option value="all">All Sizes</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={String(s)}>
                EU {s}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price-filter" className="text-xs font-medium text-neutral-400">
            Max Price
          </label>
          <input
            id="price-filter"
            type="number"
            placeholder="e.g. 100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-10 w-28 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-blue-500"
          />
        </div>

        {/* Reset */}
        {(brand !== "all" || size !== "all" || maxPrice !== "") && (
          <button
            type="button"
            onClick={() => {
              setBrand("all");
              setSize("all");
              setMaxPrice("");
            }}
            className="h-10 rounded-xl border border-neutral-700 bg-neutral-800 px-4 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white"
          >
            Reset
          </button>
        )}
      </div>

      {/* Deals Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((snapshot) => (
            <DealCard
              key={snapshot.id}
              model={snapshot.model!}
              price={snapshot.price}
              originalPrice={snapshot.original_price ?? snapshot.price}
              discountPct={snapshot.discount_pct ?? 0}
              site={snapshot.site}
              url={snapshot.url}
              imageUrl={snapshot.model!.image_url ?? ""}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-[#1A1A1A] py-16">
          <p className="text-lg font-semibold text-neutral-400">No deals found</p>
          <p className="mt-1 text-sm text-neutral-500">
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  );
}
