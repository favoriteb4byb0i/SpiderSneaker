"use client";

import { Tag, Copy, ExternalLink, Clock, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ActivePromo } from "@/types/database";
import { getShopName, getShopColor } from "@/lib/constants";

interface PromoCardProps {
  promo: ActivePromo;
  compact?: boolean;
}

export function PromoCard({ promo, compact = false }: PromoCardProps) {
  const [copied, setCopied] = useState(false);
  const shopColor = getShopColor(promo.site);
  const shopName = getShopName(promo.site);

  const handleCopyCode = () => {
    if (promo.code) {
      navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
        <Tag className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span className="text-xs font-medium text-emerald-400 truncate">
          {promo.discount_text}
          {promo.code && (
            <button
              onClick={handleCopyCode}
              className="ml-1.5 inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
            >
              {promo.code}
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#1A1A1A] p-4 transition-colors hover:border-neutral-700">
      {/* Colored accent */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl" style={{ backgroundColor: shopColor }} />

      <div className="pl-3 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: shopColor }}
              >
                {shopName}
              </span>
              {promo.stackable && (
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                  Kombinierbar
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-sm font-semibold text-white">{promo.title}</h3>
          </div>
          <span className="shrink-0 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-sm font-bold text-emerald-400">
            {promo.discount_text}
          </span>
        </div>

        {/* Code */}
        {promo.code && (
          <button
            onClick={handleCopyCode}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-2.5 font-mono text-sm font-bold transition-all",
              copied
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-neutral-600 bg-neutral-900 text-white hover:border-emerald-500/50"
            )}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Kopiert!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> {promo.code}
              </>
            )}
          </button>
        )}

        {/* Instructions */}
        {promo.instructions && (
          <p className="text-xs leading-relaxed text-neutral-400">
            {promo.instructions}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {promo.valid_until && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-500">
              <Clock className="h-3 w-3" />
              Gültig bis {new Date(promo.valid_until).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
          {promo.url && (
            <a
              href={promo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Zum Shop <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
