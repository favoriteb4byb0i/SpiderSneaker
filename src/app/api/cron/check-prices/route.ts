import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { scrapePrice } from "@/lib/scrapers";
import { randomDelay } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CRON_SECRET = process.env.CRON_SECRET;

// Rate-limit bounds per same-domain request (ms)
const DELAY_MIN = 2000;
const DELAY_MAX = 5000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductUrlRow {
  id: string;
  model_id: string;
  site: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  // 1. Verify CRON_SECRET from Authorization header
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  // 2. Fetch all active product_urls
  const { data: productUrls, error: urlsError } = await supabase
    .from("product_urls")
    .select("id, model_id, site, url")
    .eq("active", true);

  if (urlsError) {
    console.error("[cron/check-prices] Failed to fetch product_urls:", urlsError);
    return NextResponse.json(
      { error: "Failed to fetch product URLs", details: urlsError.message },
      { status: 500 },
    );
  }

  const urls: ProductUrlRow[] = productUrls ?? [];

  if (urls.length === 0) {
    return NextResponse.json({
      success: true,
      checked: 0,
      succeeded: 0,
      alerts_generated: 0,
      message: "No active product URLs to check",
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Group URLs by site so we can rate-limit per domain
  const grouped: Record<string, ProductUrlRow[]> = {};
  for (const row of urls) {
    const site = row.site.toLowerCase();
    if (!grouped[site]) grouped[site] = [];
    grouped[site].push(row);
  }

  // 4. Process each site group concurrently; within a group, scrape sequentially
  let checked = 0;
  let succeeded = 0;
  let alertsGenerated = 0;

  const sitePromises = Object.entries(grouped).map(
    async ([site, siteUrls]) => {
      for (let i = 0; i < siteUrls.length; i++) {
        const row = siteUrls[i];
        checked++;

        // Rate-limit: delay between requests to the same domain (skip before first)
        if (i > 0) {
          await randomDelay(DELAY_MIN, DELAY_MAX);
        }

        try {
          const result = await scrapePrice(site, row.url);

          if (!result || result.price === null) {
            console.warn(
              `[cron/check-prices] No price found for ${site} ${row.url}`,
            );
            continue;
          }

          succeeded++;

          // Insert new price snapshot
          const { error: insertError } = await supabase
            .from("price_snapshots")
            .insert({
              model_id: row.model_id,
              site,
              price: result.price,
              original_price: result.original_price,
              discount_pct: result.discount_pct,
              url: row.url,
              checked_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error(
              `[cron/check-prices] Failed to insert snapshot for ${row.url}:`,
              insertError,
            );
            continue;
          }

          // Fetch the previous price for this model+site (the one before our new insert)
          const { data: prevSnapshots } = await supabase
            .from("price_snapshots")
            .select("price")
            .eq("model_id", row.model_id)
            .eq("site", site)
            .order("checked_at", { ascending: false })
            .limit(2); // first is the one we just inserted, second is the previous

          const previousPrice =
            prevSnapshots && prevSnapshots.length >= 2
              ? Number(prevSnapshots[1].price)
              : null;

          // If price dropped, create deal alerts for matching watchlist users
          if (
            previousPrice !== null &&
            result.price < previousPrice
          ) {
            const dropPct = Math.round(
              ((previousPrice - result.price) / previousPrice) * 100,
            );

            // Find users watching this model whose max_price >= new price
            const { data: watchers } = await supabase
              .from("watchlist")
              .select("user_id")
              .eq("model_id", row.model_id)
              .or(`max_price.gte.${result.price},max_price.is.null`);

            if (watchers && watchers.length > 0) {
              const alerts = watchers.map((w) => ({
                user_id: w.user_id,
                model_id: row.model_id,
                site,
                old_price: previousPrice,
                new_price: result.price!,
                discount_pct: dropPct,
                url: row.url,
                read: false,
              }));

              const { error: alertError } = await supabase
                .from("deal_alerts")
                .insert(alerts);

              if (alertError) {
                console.error(
                  `[cron/check-prices] Failed to insert deal alerts:`,
                  alertError,
                );
              } else {
                alertsGenerated += alerts.length;
              }
            }
          }
        } catch (err) {
          console.error(
            `[cron/check-prices] Error processing ${site} ${row.url}:`,
            err,
          );
        }
      }
    },
  );

  await Promise.all(sitePromises);

  // 7. Return summary
  return NextResponse.json({
    success: true,
    checked,
    succeeded,
    alerts_generated: alertsGenerated,
    timestamp: new Date().toISOString(),
  });
}
