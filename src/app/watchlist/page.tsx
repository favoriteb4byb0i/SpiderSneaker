"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Plus, Heart } from "lucide-react";
import { MOCK_MODELS, MOCK_SNAPSHOTS, MOCK_PRICE_HISTORY } from "@/lib/constants";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { formatPrice } from "@/lib/utils";

interface WatchlistEntry {
  id: string;
  model_id: string;
  max_price: number;
  size_eu: number;
}

const INITIAL_WATCHLIST: WatchlistEntry[] = [
  { id: "w1", model_id: "1", max_price: 95, size_eu: 42 },
  { id: "w2", model_id: "2", max_price: 100, size_eu: 43 },
  { id: "w3", model_id: "3", max_price: 85, size_eu: 41 },
];

function getPriceStatus(currentPrice: number, maxPrice: number) {
  if (currentPrice <= maxPrice) {
    return { label: "Below target", bg: "bg-success/10", text: "text-success", border: "border-success/20" };
  }
  const pctAbove = ((currentPrice - maxPrice) / maxPrice) * 100;
  if (pctAbove <= 10) {
    return { label: "Almost there", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" };
  }
  return { label: "Above target", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>(INITIAL_WATCHLIST);

  const removeItem = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
              <p className="text-sm text-muted-foreground">
                {watchlist.length} {watchlist.length === 1 ? "sneaker" : "sneakers"} tracked
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </div>

        {/* List */}
        {watchlist.length > 0 ? (
          <div className="flex flex-col gap-4">
            {watchlist.map((entry) => {
              const model = MOCK_MODELS.find((m) => m.id === entry.model_id);
              const snapshot = MOCK_SNAPSHOTS.find((s) => s.model_id === entry.model_id);
              const currentPrice = snapshot?.price ?? 0;
              const status = getPriceStatus(currentPrice, entry.max_price);

              return (
                <div
                  key={entry.id}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 backdrop-blur-sm transition-colors hover:border-neutral-700"
                >
                  <div className="flex items-start gap-4">
                    {/* Product image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                      {model?.image_url && (
                        <img
                          src={model.image_url}
                          alt={model.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {model?.brand}
                          </p>
                          <h3 className="text-base font-semibold text-foreground">
                            {model?.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeItem(entry.id)}
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                          aria-label="Remove from watchlist"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price comparison */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold tabular-nums text-foreground">
                          {formatPrice(currentPrice)}
                        </span>
                        <span className="text-sm text-muted-foreground">/</span>
                        <span className="text-sm tabular-nums text-muted-foreground">
                          Target: {formatPrice(entry.max_price)}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${status.bg} ${status.text} ${status.border} border`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-300">
                          EU {entry.size_eu}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini sparkline */}
                  <div className="mt-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/50 px-2 pt-1">
                    <PriceHistoryChart data={MOCK_PRICE_HISTORY} height={60} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/40 px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800">
              <Heart className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              No sneakers in your watchlist yet
            </h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Start tracking your favorite sneakers and get notified when prices drop.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Browse Deals
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
