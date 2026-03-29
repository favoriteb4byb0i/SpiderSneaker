export type Brand =
  | "Nike"
  | "Adidas"
  | "New Balance"
  | "Puma"
  | "Reebok"
  | "Asics"
  | "Converse"
  | "Vans"
  | "Jordan"
  | "Yeezy"
  | "Other";

export type SiteName = "zalando" | "aboutyou" | "snipes" | "snkrs";

export interface Model {
  id: string;
  name: string;
  brand: Brand;
  image_url: string | null;
  category: string | null;
  created_by: string;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  model_id: string;
  max_price: number | null;
  size_eu: number | null;
  created_at: string;
  model?: Model;
  latest_price?: PriceSnapshot | null;
}

export interface PriceSnapshot {
  id: string;
  model_id: string;
  site: SiteName;
  price: number;
  original_price: number | null;
  discount_pct: number | null;
  url: string;
  checked_at: string;
}

export interface SaleEvent {
  id: string;
  title: string;
  date: string;
  description: string | null;
  site: SiteName | null;
}

export interface NotificationSetting {
  id: string;
  user_id: string;
  telegram_chat_id: string | null;
  web_push_enabled: boolean;
  daily_digest_time: string | null;
  price_drop_alert: boolean;
  promo_alert: boolean;
}

export interface DealAlert {
  id: string;
  user_id: string;
  model_id: string;
  site: SiteName;
  old_price: number;
  new_price: number;
  discount_pct: number;
  url: string;
  created_at: string;
  model?: Model;
}

export interface Shop {
  slug: SiteName;
  name: string;
  logo: string;
  url: string;
  color: string;
  activeDeals?: number;
}
