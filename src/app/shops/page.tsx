import { getActiveDealCountBySite, getEvents } from "@/lib/queries";
import { SHOPS } from "@/lib/constants";
import { ShopsClient } from "./shops-client";

export default async function ShopsPage() {
  const [dealCounts, events] = await Promise.all([
    getActiveDealCountBySite(),
    getEvents(),
  ]);

  const shopsWithCounts = SHOPS.map((shop) => ({
    ...shop,
    activeDeals: dealCounts[shop.slug] ?? 0,
  }));

  return <ShopsClient shops={shopsWithCounts} events={events} />;
}
