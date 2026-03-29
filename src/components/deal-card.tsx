"use client";

import Image from "next/image";
import { ExternalLink, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import type { Model, SiteName } from "@/types/database";
import { DiscountBadge } from "@/components/discount-badge";

interface DealCardProps {
  model: Model;
  price: number;
  originalPrice: number;
  discountPct: number;
  site: SiteName;
  url: string;
  imageUrl: string;
  onWatchlistToggle?: () => void;
  isWatchlisted?: boolean;
}

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

const siteColors: Record<SiteName, string> = {
  zalando: "#FF6900",
  aboutyou: "#DC143C",
  snipes: "#E30613",
  nike: "#111111",
  adidas: "#000000",
  footlocker: "#CE1126",
  jdsports: "#000000",
  asphaltgold: "#D4AF37",
  bstn: "#222222",
  solebox: "#1B1B1B",
};

export function DealCard({
  model,
  price,
  originalPrice,
  discountPct,
  site,
  url,
  imageUrl,
  onWatchlistToggle,
  isWatchlisted = false,
}: DealCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl",
        "bg-[#1A1A1A] border border-neutral-800",
        "transition-all hover:border-neutral-600 hover:-translate-y-0.5",
      )}
    >
      {/* Image section */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
        <Image
          src={imageUrl}
          alt={`${model.brand} ${model.name}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Watchlist heart - top left */}
        {onWatchlistToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onWatchlistToggle();
            }}
            className={cn(
              "absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full",
              "bg-black/40 backdrop-blur-sm transition-all active:scale-90",
              "hover:bg-black/60",
            )}
            aria-label={
              isWatchlisted ? "Remove from watchlist" : "Add to watchlist"
            }
          >
            <Heart
              size={18}
              className={cn(
                "transition-colors",
                isWatchlisted
                  ? "fill-red-500 text-red-500"
                  : "fill-none text-white/80",
              )}
            />
          </button>
        )}

        {/* Discount badge - top right */}
        {discountPct > 0 && (
          <div className="absolute right-3 top-3 z-10">
            <DiscountBadge percent={discountPct} size="md" />
          </div>
        )}

        {/* Shop indicator - bottom left */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
            style={{ backgroundColor: `${siteColors[site]}CC` }}
          >
            {siteLabels[site]}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            {model.brand}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold leading-tight text-white line-clamp-2">
            {model.name}
          </h3>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 tabular-nums">
          <span className="text-xs text-neutral-500 line-through">
            {formatPrice(originalPrice)}
          </span>
          <span className="text-lg font-bold text-white">
            {formatPrice(price)}
          </span>
        </div>

        {/* CTA */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-auto flex items-center justify-center gap-2 rounded-xl py-2.5",
            "bg-blue-600 text-sm font-semibold text-white",
            "transition-colors hover:bg-blue-500",
          )}
        >
          Go to Deal
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
