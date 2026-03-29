"use client";

import { cn } from "@/lib/utils";

interface DiscountBadgeProps {
  percent: number;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
} as const;

export function DiscountBadge({ percent, size = "md" }: DiscountBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold text-white",
        "bg-[#EF4444]",
        sizeStyles[size],
      )}
    >
      -{percent}%
    </span>
  );
}
