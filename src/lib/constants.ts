import { Shop } from "@/types/database";

export const SHOPS: Shop[] = [
  {
    slug: "zalando",
    name: "Zalando",
    logo: "/shops/zalando.svg",
    url: "https://www.zalando.de",
    color: "#FF6900",
    activeDeals: 0,
  },
  {
    slug: "aboutyou",
    name: "About You",
    logo: "/shops/aboutyou.svg",
    url: "https://www.aboutyou.de",
    color: "#1A1A1A",
    activeDeals: 0,
  },
  {
    slug: "snipes",
    name: "Snipes",
    logo: "/shops/snipes.svg",
    url: "https://www.snipes.com",
    color: "#E30613",
    activeDeals: 0,
  },
  {
    slug: "nike",
    name: "Nike",
    logo: "/shops/nike.svg",
    url: "https://www.nike.com/de",
    color: "#111111",
    activeDeals: 0,
  },
  {
    slug: "adidas",
    name: "Adidas",
    logo: "/shops/adidas.svg",
    url: "https://www.adidas.de",
    color: "#000000",
    activeDeals: 0,
  },
  {
    slug: "footlocker",
    name: "Foot Locker",
    logo: "/shops/footlocker.svg",
    url: "https://www.footlocker.de",
    color: "#CE1126",
    activeDeals: 0,
  },
  {
    slug: "jdsports",
    name: "JD Sports",
    logo: "/shops/jdsports.svg",
    url: "https://www.jdsports.de",
    color: "#000000",
    activeDeals: 0,
  },
  {
    slug: "asphaltgold",
    name: "Asphaltgold",
    logo: "/shops/asphaltgold.svg",
    url: "https://www.asphaltgold.com",
    color: "#D4AF37",
    activeDeals: 0,
  },
  {
    slug: "bstn",
    name: "BSTN",
    logo: "/shops/bstn.svg",
    url: "https://www.bstn.com",
    color: "#222222",
    activeDeals: 0,
  },
  {
    slug: "solebox",
    name: "Solebox",
    logo: "/shops/solebox.svg",
    url: "https://www.solebox.com",
    color: "#1B1B1B",
    activeDeals: 0,
  },
];

export const SIZE_OPTIONS = [
  36, 36.5, 37, 37.5, 38, 38.5, 39, 40, 40.5, 41, 42, 42.5, 43, 44, 44.5, 45, 46,
];

export const BRAND_OPTIONS: string[] = [
  "Nike",
  "Adidas",
  "New Balance",
  "Puma",
  "Reebok",
  "Asics",
  "Converse",
  "Vans",
  "Jordan",
  "Yeezy",
  "On",
  "Salomon",
  "Hoka",
];

export const CATEGORY_OPTIONS = ["Lifestyle", "Running", "Basketball", "Skateboarding", "Training"];

export function getShopBySlug(slug: string): Shop | undefined {
  return SHOPS.find(s => s.slug === slug);
}

export function getShopColor(site: string): string {
  return getShopBySlug(site)?.color ?? "#666666";
}

export function getShopName(site: string): string {
  return getShopBySlug(site)?.name ?? site;
}
