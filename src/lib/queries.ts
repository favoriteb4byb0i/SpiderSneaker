import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Model, PriceSnapshot, SaleEvent, ProductUrl, ActivePromo } from "@/types/database";

export async function getModels(): Promise<Model[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("models")
    .select("*")
    .order("brand", { ascending: true });
  return data ?? [];
}

export async function getModelById(id: string): Promise<Model | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("models")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function getLatestPrices(): Promise<(PriceSnapshot & { model: Model })[]> {
  const supabase = createServerSupabaseClient();
  // Get the latest price snapshot per model per site
  const { data } = await supabase
    .from("price_snapshots")
    .select("*, model:models(*)")
    .order("checked_at", { ascending: false })
    .limit(200);
  return (data as (PriceSnapshot & { model: Model })[]) ?? [];
}

export async function getLatestPricesForModel(modelId: string): Promise<PriceSnapshot[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("price_snapshots")
    .select("*")
    .eq("model_id", modelId)
    .order("checked_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function getPriceHistory(
  modelId: string,
  site?: string
): Promise<{ date: string; price: number }[]> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("price_snapshots")
    .select("price, checked_at")
    .eq("model_id", modelId)
    .order("checked_at", { ascending: true });
  if (site) query = query.eq("site", site);
  const { data } = await query.limit(100);
  return (
    data?.map((d) => ({
      date: new Date(d.checked_at).toLocaleDateString("de-DE", {
        month: "short",
        day: "numeric",
      }),
      price: Number(d.price),
    })) ?? []
  );
}

export async function getDealsWithDiscount(): Promise<
  (PriceSnapshot & { model: Model })[]
> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("price_snapshots")
    .select("*, model:models(*)")
    .not("discount_pct", "is", null)
    .gt("discount_pct", 0)
    .order("discount_pct", { ascending: false })
    .limit(50);
  return (data as (PriceSnapshot & { model: Model })[]) ?? [];
}

export async function getDealsBySite(
  site: string
): Promise<(PriceSnapshot & { model: Model })[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("price_snapshots")
    .select("*, model:models(*)")
    .eq("site", site)
    .order("checked_at", { ascending: false })
    .limit(50);
  return (data as (PriceSnapshot & { model: Model })[]) ?? [];
}

export async function getEvents(): Promise<SaleEvent[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true });
  return data ?? [];
}

export async function getProductUrls(modelId: string): Promise<ProductUrl[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("product_urls")
    .select("*")
    .eq("model_id", modelId)
    .eq("active", true);
  return data ?? [];
}

export async function getAllProductUrls(): Promise<ProductUrl[]> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("product_urls")
    .select("*")
    .eq("active", true);
  return data ?? [];
}

export async function getActiveDealCountBySite(): Promise<Record<string, number>> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("price_snapshots")
    .select("site")
    .not("discount_pct", "is", null)
    .gt("discount_pct", 0);
  const counts: Record<string, number> = {};
  data?.forEach((d) => {
    counts[d.site] = (counts[d.site] || 0) + 1;
  });
  return counts;
}

export async function getActivePromos(site?: string): Promise<ActivePromo[]> {
  const supabase = createServerSupabaseClient();
  let query = supabase
    .from("active_promos")
    .select("*")
    .or(`valid_until.gte.${new Date().toISOString().split("T")[0]},valid_until.is.null`)
    .order("created_at", { ascending: false });
  if (site) query = query.eq("site", site);
  const { data } = await query;
  return (data as ActivePromo[]) ?? [];
}

export async function getPromosBySite(site: string): Promise<ActivePromo[]> {
  return getActivePromos(site);
}
