import { getDealsWithDiscount, getEvents, getActiveDealCountBySite } from "@/lib/queries";
import { SHOPS } from "@/lib/constants";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const [deals, events, dealCounts] = await Promise.all([
    getDealsWithDiscount(),
    getEvents(),
    getActiveDealCountBySite(),
  ]);

  // Merge real deal counts into shop data
  const shopsWithCounts = SHOPS.map((shop) => ({
    ...shop,
    activeDeals: dealCounts[shop.slug] ?? 0,
  }));

  return (
    <HomeClient
      deals={deals}
      events={events}
      shops={shopsWithCounts}
    />
  );
}
