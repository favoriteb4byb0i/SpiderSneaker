"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  isActive: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}

const sizeStyles = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
} as const;

const iconSizes = {
  sm: 16,
  md: 20,
} as const;

export function WatchlistButton({
  isActive,
  onToggle,
  size = "md",
}: WatchlistButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-200",
        "bg-black/40 backdrop-blur-sm hover:bg-black/60",
        "active:scale-90",
        sizeStyles[size],
      )}
      aria-label={isActive ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          "transition-colors duration-200",
          isActive
            ? "fill-red-500 text-red-500"
            : "fill-none text-white/80 hover:text-white",
        )}
      />
    </button>
  );
}
