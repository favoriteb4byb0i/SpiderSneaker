import { getDealsWithDiscount } from "@/lib/queries";
import { DealsClient } from "./deals-client";

export default async function DealsPage() {
  const deals = await getDealsWithDiscount();

  return <DealsClient deals={deals} />;
}
