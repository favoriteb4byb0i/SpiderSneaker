"use client";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface PriceTagProps {
  original: number;
  sale: number;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { original: "text-xs", sale: "text-sm" },
  md: { original: "text-sm", sale: "text-lg" },
  lg: { original: "text-base", sale: "text-2xl" },
} as const;

export function PriceTag({ original, sale, size = "md" }: PriceTagProps) {
  const styles = sizeStyles[size];

  return (
    <div className="flex items-baseline gap-2 tabular-nums">
      <span
        className={cn(
          styles.original,
          "text-neutral-500 line-through dark:text-neutral-400",
        )}
      >
        {formatPrice(original)}
      </span>
      <span
        className={cn(
          styles.sale,
          "font-bold text-white",
        )}
      >
        {formatPrice(sale)}
      </span>
    </div>
  );
}
