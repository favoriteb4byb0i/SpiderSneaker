import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { scrapePrice } from "@/lib/scrapers";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

// Hobby plan has 10s function timeout — process a small batch each run
const BATCH_SIZE = 3;

interface ProductUrlRow {
  id: string;
  model_id: string;
  site: string;
  url: string;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const isAuthorized =
    authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET;
  if (CRON_SECRET && !isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  // Get the offset from query param (for manual batch cycling) or pick randomly
  const offsetParam = searchParams.get("offset");

  // Fetch all active product_urls
  const { data: allUrls, error: urlsError } = await supabase
    .from("product_urls")
    .select("id, model_id, site, url")
    .eq("active", true)
    .order("id", { ascending: true });

  if (urlsError || !allUrls) {
    return NextResponse.json(
      { error: "Failed to fetch product URLs", details: urlsError?.message },
      { status: 500 },
    );
  }

  if (allUrls.length === 0) {
    return NextResponse.json({ success: true, checked: 0, succeeded: 0, message: "No URLs" });
  }

  // Pick a batch: use offset or a rotating window based on current hour
  const totalUrls = allUrls.length;
  const offset = offsetParam
    ? parseInt(offsetParam, 10)
    : (Math.floor(Date.now() / 3600000) * BATCH_SIZE) % totalUrls;

  const batch: ProductUrlRow[] = [];
  for (let i = 0; i < BATCH_SIZE && i < totalUrls; i++) {
    batch.push(allUrls[(offset + i) % totalUrls]);
  }

  let succeeded = 0;
  let alertsGenerated = 0;

  // Process batch concurrently (different sites, no need for delays)
  await Promise.allSettled(
    batch.map(async (row) => {
      try {
        const result = await scrapePrice(row.site, row.url);

        if (!result || result.price === null) {
          console.warn(`[cron] No price: ${row.site} ${row.url}`);
          return;
        }

        succeeded++;

        // Update model image if we got one and model doesn't have one
        if (result.image_url) {
          await supabase
            .from("models")
            .update({ image_url: result.image_url })
            .eq("id", row.model_id)
            .is("image_url", null);
        }

        // Insert price snapshot
        const { error: insertError } = await supabase
          .from("price_snapshots")
          .insert({
            model_id: row.model_id,
            site: row.site,
            price: result.price,
            original_price: result.original_price,
            discount_pct: result.discount_pct,
            url: row.url,
            checked_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error(`[cron] Insert error: ${row.url}`, insertError.message);
          return;
        }

        // Check for price drop vs previous snapshot
        const { data: prevSnapshots } = await supabase
          .from("price_snapshots")
          .select("price")
          .eq("model_id", row.model_id)
          .eq("site", row.site)
          .order("checked_at", { ascending: false })
          .limit(2);

        const prevPrice =
          prevSnapshots && prevSnapshots.length >= 2
            ? Number(prevSnapshots[1].price)
            : null;

        if (prevPrice !== null && result.price < prevPrice) {
          const dropPct = Math.round(((prevPrice - result.price) / prevPrice) * 100);
          const { data: watchers } = await supabase
            .from("watchlist")
            .select("user_id")
            .eq("model_id", row.model_id)
            .or(`max_price.gte.${result.price},max_price.is.null`);

          if (watchers && watchers.length > 0) {
            const alerts = watchers.map((w) => ({
              user_id: w.user_id,
              model_id: row.model_id,
              site: row.site,
              old_price: prevPrice,
              new_price: result.price!,
              discount_pct: dropPct,
              url: row.url,
              read: false,
            }));
            const { error: alertErr } = await supabase.from("deal_alerts").insert(alerts);
            if (!alertErr) alertsGenerated += alerts.length;
          }
        }
      } catch (err) {
        console.error(`[cron] Error: ${row.site} ${row.url}`, err);
      }
    }),
  );

  return NextResponse.json({
    success: true,
    batch_offset: offset,
    total_urls: totalUrls,
    checked: batch.length,
    succeeded,
    alerts_generated: alertsGenerated,
    timestamp: new Date().toISOString(),
  });
}
