import { getDealsBySite, getEvents } from "@/lib/queries";
import { getShopBySlug } from "@/lib/constants";
import { ShopDetailClient } from "./shop-detail-client";

interface ShopDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const { slug } = await params;
  const shop = getShopBySlug(slug);

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20">
        <h1 className="text-2xl font-bold text-white">Shop not found</h1>
        <a href="/shops" className="text-blue-400 hover:underline">
          Back to Shops
        </a>
      </div>
    );
  }

  const [deals, allEvents] = await Promise.all([
    getDealsBySite(slug),
    getEvents(),
  ]);

  const shopEvents = allEvents.filter((e) => e.site === slug);

  return (
    <ShopDetailClient
      shop={{ ...shop, activeDeals: deals.length }}
      events={shopEvents}
      deals={deals}
    />
  );
}
