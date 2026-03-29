"use client";

import { cn } from "@/lib/utils";
import type { Shop } from "@/types/database";

interface ShopBadgeProps {
  shop: Shop;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-3 py-1 text-xs gap-1.5",
  lg: "px-4 py-1.5 text-sm gap-2",
} as const;

const dotSizes = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
} as const;

export function ShopBadge({ shop, size = "md" }: ShopBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        "bg-white/10 text-neutral-300",
        sizeStyles[size],
      )}
    >
      <span
        className={cn("shrink-0 rounded-full", dotSizes[size])}
        style={{ backgroundColor: shop.color }}
      />
      {shop.name}
    </span>
  );
}
