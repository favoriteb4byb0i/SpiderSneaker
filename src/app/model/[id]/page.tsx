import {
  getModelById,
  getLatestPricesForModel,
  getPriceHistory,
  getProductUrls,
  getActivePromos,
} from "@/lib/queries";
import { ModelDetailClient } from "./model-detail-client";

interface ModelDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { id } = await params;
  const model = await getModelById(id);

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20">
        <h1 className="text-2xl font-bold text-white">Model not found</h1>
        <a href="/" className="text-blue-400 hover:underline">
          Back to Home
        </a>
      </div>
    );
  }

  const [prices, priceHistory, productUrls, promos] = await Promise.all([
    getLatestPricesForModel(id),
    getPriceHistory(id),
    getProductUrls(id),
    getActivePromos(),
  ]);

  return (
    <ModelDetailClient
      model={model}
      prices={prices}
      priceHistory={priceHistory}
      productUrls={productUrls}
      promos={promos}
    />
  );
}
