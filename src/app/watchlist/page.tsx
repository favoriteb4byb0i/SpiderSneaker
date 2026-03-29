"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Plus, Heart, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { formatPrice } from "@/lib/utils";
import { getShopName, getShopColor } from "@/lib/constants";
import type { WatchlistItem, PriceSnapshot } from "@/types/database";

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
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [priceHistories, setPriceHistories] = useState<Record<string, { date: string; price: number }[]>>({});
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      // Fetch watchlist with model data
      const { data: items } = await supabase
        .from("watchlist")
        .select("*, model:models(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!items || items.length === 0) {
        setWatchlist([]);
        setLoading(false);
        return;
      }

      // Fetch latest price snapshot for each model
      const modelIds = items.map((i: WatchlistItem) => i.model_id);
      const { data: snapshots } = await supabase
        .from("price_snapshots")
        .select("*")
        .in("model_id", modelIds)
        .order("checked_at", { ascending: false });

      // Attach the latest price to each watchlist item
      const enriched: WatchlistItem[] = items.map((item: WatchlistItem) => {
        const latestSnap = snapshots?.find((s: PriceSnapshot) => s.model_id === item.model_id) ?? null;
        return { ...item, latest_price: latestSnap };
      });

      setWatchlist(enriched);

      // Fetch price history for sparklines
      const histories: Record<string, { date: string; price: number }[]> = {};
      for (const mid of modelIds) {
        const { data: hist } = await supabase
          .from("price_snapshots")
          .select("checked_at, price")
          .eq("model_id", mid)
          .order("checked_at", { ascending: true })
          .limit(30);

        if (hist) {
          histories[mid] = hist.map((h: { checked_at: string; price: number }) => ({
            date: h.checked_at,
            price: h.price,
          }));
        }
      }
      setPriceHistories(histories);
      setLoading(false);
    }

    load();
  }, []);

  const removeItem = async (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
    const supabase = createClient();
    await supabase.from("watchlist").delete().eq("id", id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/40 px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800">
              <Heart className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              Sign in to create your watchlist
            </h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Track your favorite sneakers and get notified when prices drop below your target.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to Settings to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              const model = entry.model;
              const currentPrice = entry.latest_price?.price ?? 0;
              const maxPrice = entry.max_price ?? 0;
              const status = getPriceStatus(currentPrice, maxPrice);
              const siteName = entry.latest_price?.site ? getShopName(entry.latest_price.site) : null;
              const siteColor = entry.latest_price?.site ? getShopColor(entry.latest_price.site) : undefined;
              const history = priceHistories[entry.model_id] ?? [];

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
                          Target: {formatPrice(maxPrice)}
                        </span>
                        {maxPrice > 0 && (
                          <span
                            className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${status.bg} ${status.text} ${status.border} border`}
                          >
                            {status.label}
                          </span>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {entry.size_eu && (
                          <span className="inline-flex items-center rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-300">
                            EU {entry.size_eu}
                          </span>
                        )}
                        {siteName && (
                          <span
                            className="inline-flex items-center rounded-lg border border-neutral-700 px-2 py-0.5 text-xs font-medium"
                            style={{ color: siteColor }}
                          >
                            {siteName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mini sparkline */}
                  {history.length > 1 && (
                    <div className="mt-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/50 px-2 pt-1">
                      <PriceHistoryChart data={history} height={60} />
                    </div>
                  )}
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
