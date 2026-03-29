"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types/database";

interface ShopGridProps {
  shops: Shop[];
}

export function ShopGrid({ shops }: ShopGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {shops.map((shop) => (
        <Link
          key={shop.slug}
          href={`/shops/${shop.slug}`}
          className={cn(
            "group relative flex flex-col items-center gap-3 rounded-2xl p-6",
            "bg-[#1A1A1A] border border-neutral-800",
            "transition-all hover:border-neutral-600 hover:-translate-y-0.5",
          )}
        >
          {/* Logo placeholder */}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white"
            style={{ backgroundColor: shop.color }}
          >
            {shop.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
              {shop.name}
            </h3>
            {shop.activeDeals !== undefined && (
              <span className="text-xs text-neutral-500">
                {shop.activeDeals} active deal{shop.activeDeals !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
