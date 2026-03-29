import * as cheerio from "cheerio";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScrapedResult {
  price: number | null;
  original_price: number | null;
  discount_pct: number | null;
  title: string | null;
  image_url: string | null;
  available: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SCRAPER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Ch-Ua":
    '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a price string in various European and international formats.
 *
 * Handles:
 *  - "149,99 €"  /  "€149,99"  /  "EUR 149,99"
 *  - "149.99"    /  "€149.99"
 *  - "1.249,99 €" (thousands separator dot, decimal comma)
 *  - "1,249.99"   (thousands separator comma, decimal dot)
 *  - Plain "149"
 *
 * Returns the numeric value or null when parsing fails.
 */
export function parseEuroPrice(text: string): number | null {
  if (!text || typeof text !== "string") return null;

  // Strip currency symbols, whitespace, and common labels
  const cleaned = text
    .replace(/[€$£]/g, "")
    .replace(/EUR/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  // Extract the first number-like sequence (digits, dots, commas)
  const match = cleaned.match(/[\d]+(?:[.,]\d{3})*(?:[.,]\d{1,2})?/);
  if (!match) return null;

  let numStr = match[0];

  // Determine format by looking at the last separator
  const lastComma = numStr.lastIndexOf(",");
  const lastDot = numStr.lastIndexOf(".");

  if (lastComma > lastDot) {
    // Comma is the decimal separator (EU format: 1.249,99 or 149,99)
    numStr = numStr.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    // Dot is the decimal separator (US/UK format: 1,249.99 or 149.99)
    numStr = numStr.replace(/,/g, "");
  } else {
    // No mixed separators – just digits or a single separator
    // If single comma with 1-2 trailing digits, treat as decimal
    if (lastComma !== -1 && /,\d{1,2}$/.test(numStr)) {
      numStr = numStr.replace(",", ".");
    }
  }

  const value = parseFloat(numStr);
  if (isNaN(value) || value < 0) return null;
  return Math.round(value * 100) / 100; // round to cents
}

/**
 * Fetch a URL with realistic browser headers. Retries once on network
 * failure. Returns null on HTTP 4xx / 5xx or after exhausting retries.
 */
export async function fetchWithRetry(
  url: string,
  maxRetries = 1,
): Promise<string | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);

      const response = await fetch(url, {
        headers: SCRAPER_HEADERS,
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        // Don't retry on client/server errors – the URL is likely wrong
        return null;
      }

      return await response.text();
    } catch (err: unknown) {
      // On last attempt, give up
      if (attempt >= maxRetries) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[scrapers] fetchWithRetry failed for ${url}: ${msg}`);
        return null;
      }
      // Brief pause before retry
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// JSON-LD helpers
// ---------------------------------------------------------------------------

interface JsonLdProduct {
  "@type"?: string;
  name?: string;
  image?: string | string[] | { url?: string }[];
  offers?:
    | JsonLdOffer
    | JsonLdOffer[]
    | { "@type"?: string; offers?: JsonLdOffer[] };
}

interface JsonLdOffer {
  "@type"?: string;
  price?: number | string;
  priceCurrency?: string;
  availability?: string;
  url?: string;
}

/**
 * Extract Product JSON-LD from the page. Many sites embed structured data
 * that is far more reliable than scraping CSS selectors.
 */
function extractJsonLd($: cheerio.CheerioAPI): JsonLdProduct | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const raw = $(scripts[i]).html();
      if (!raw) continue;

      const data = JSON.parse(raw);

      // Could be a single object or an array
      const items: unknown[] = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const obj = item as Record<string, unknown>;

        // Direct Product type
        if (obj["@type"] === "Product") return obj as unknown as JsonLdProduct;

        // Sometimes wrapped in @graph
        if (Array.isArray(obj["@graph"])) {
          for (const node of obj["@graph"] as Record<string, unknown>[]) {
            if (node?.["@type"] === "Product")
              return node as unknown as JsonLdProduct;
          }
        }
      }
    } catch {
      // Malformed JSON – skip
    }
  }
  return null;
}

/** Normalise offers into a flat array. */
function normalizeOffers(product: JsonLdProduct): JsonLdOffer[] {
  if (!product.offers) return [];

  if (Array.isArray(product.offers)) return product.offers;

  const o = product.offers as Record<string, unknown>;
  if (o["@type"] === "AggregateOffer" && Array.isArray(o.offers)) {
    return o.offers as JsonLdOffer[];
  }

  return [product.offers as JsonLdOffer];
}

/** Get the first image URL from JSON-LD product data. */
function extractImageFromLd(product: JsonLdProduct): string | null {
  if (!product.image) return null;
  if (typeof product.image === "string") return product.image;
  if (Array.isArray(product.image)) {
    const first = product.image[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "url" in first)
      return first.url ?? null;
  }
  return null;
}

/** Check offer availability from JSON-LD. */
function isAvailableFromLd(offers: JsonLdOffer[]): boolean {
  if (offers.length === 0) return true; // assume available if unknown
  return offers.some((o) => {
    const a = (o.availability ?? "").toLowerCase();
    return (
      a.includes("instock") ||
      a.includes("onlineonly") ||
      a.includes("preorder") ||
      a.includes("presale") ||
      !a // no availability field → assume in stock
    );
  });
}

/** Build a ScrapedResult from JSON-LD product data. */
function resultFromJsonLd(product: JsonLdProduct): ScrapedResult | null {
  const offers = normalizeOffers(product);
  if (offers.length === 0) return null;

  // Find the lowest priced offer
  let lowestPrice: number | null = null;
  for (const offer of offers) {
    const p =
      typeof offer.price === "number"
        ? offer.price
        : parseEuroPrice(String(offer.price ?? ""));
    if (p !== null && (lowestPrice === null || p < lowestPrice)) {
      lowestPrice = p;
    }
  }

  if (lowestPrice === null) return null;

  return {
    price: lowestPrice,
    original_price: null, // JSON-LD rarely has strikethrough/original price
    discount_pct: null,
    title: product.name ?? null,
    image_url: extractImageFromLd(product),
    available: isAvailableFromLd(offers),
  };
}

// ---------------------------------------------------------------------------
// Generic fallback helpers
// ---------------------------------------------------------------------------

function firstText($: cheerio.CheerioAPI, selectors: string[]): string | null {
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.text().trim();
      if (text) return text;
    }
  }
  return null;
}

function firstImage($: cheerio.CheerioAPI): string | null {
  const og = $('meta[property="og:image"]').attr("content");
  if (og) return og;
  const twitterImg = $('meta[name="twitter:image"]').attr("content");
  if (twitterImg) return twitterImg;
  return null;
}

function pageTitle($: cheerio.CheerioAPI): string | null {
  const og = $('meta[property="og:title"]').attr("content");
  if (og) return og;
  const title = $("title").text().trim();
  if (title) return title;
  return null;
}

function computeDiscount(
  price: number | null,
  original: number | null,
): number | null {
  if (
    price === null ||
    original === null ||
    original <= 0 ||
    original <= price
  )
    return null;
  return Math.round(((original - price) / original) * 100);
}

/**
 * Last resort: extract any price-like number from raw HTML using regex.
 * Looks for patterns like "149,99", "89.99" near price/currency indicators.
 */
function extractPriceFromHtml(html: string): number | null {
  // Look for price patterns near EUR/€ symbols
  const patterns = [
    /(?:€|EUR)\s*(\d{1,4}[.,]\d{2})/gi,
    /(\d{1,4}[.,]\d{2})\s*(?:€|EUR)/gi,
    /"price"\s*:\s*"?(\d{1,4}\.?\d{0,2})"?/gi,
    /"currentPrice"\s*:\s*"?(\d{1,4}\.?\d{0,2})"?/gi,
    /"salePrice"\s*:\s*"?(\d{1,4}\.?\d{0,2})"?/gi,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) {
      const price = parseEuroPrice(match[1]);
      if (price && price > 10 && price < 2000) return price;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Per-site scrapers
// ---------------------------------------------------------------------------

export async function scrapeZalando(url: string): Promise<ScrapedResult | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    // Strategy 1: Parse __NEXT_DATA__ JSON (most reliable for Zalando)
    const nextDataScript = $("#__NEXT_DATA__").html();
    if (nextDataScript) {
      try {
        const nextData = JSON.parse(nextDataScript);
        const props = nextData?.props?.pageProps;
        if (props) {
          // Navigate through product data structure
          const product = props.product || props.data?.product;
          if (product) {
            const price = product.price?.current?.value ?? product.simplePrice?.current?.value;
            const origPrice = product.price?.original?.value ?? product.simplePrice?.original?.value;
            if (price) {
              return {
                price,
                original_price: origPrice && origPrice > price ? origPrice : null,
                discount_pct: origPrice && origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : null,
                title: product.name ?? product.displayName ?? null,
                image_url: product.images?.[0]?.url ?? product.media?.[0]?.uri ?? null,
                available: true,
              };
            }
          }
        }
      } catch { /* not valid JSON, try next strategy */ }
    }

    // Strategy 2: JSON-LD
    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) {
        if (!result.title) result.title = pageTitle($);
        if (!result.image_url) result.image_url = firstImage($);
        return result;
      }
    }

    // Strategy 3: Regex price extraction from raw HTML
    const regexPrice = extractPriceFromHtml(html);
    if (regexPrice) {
      return {
        price: regexPrice,
        original_price: null,
        discount_pct: null,
        title: pageTitle($),
        image_url: firstImage($),
        available: true,
      };
    }

    return null;
  } catch (err) {
    console.error("[scrapers] scrapeZalando error:", err);
    return null;
  }
}

export async function scrapeNike(url: string): Promise<ScrapedResult | null> {
  try {
    // Strategy 1: Try Nike's public product API using style-color from URL
    // URL format: https://www.nike.com/de/t/air-max-90-schuh-6n5Gx5/CN8490-001
    const styleColorMatch = url.match(/\/([A-Z0-9]+-[A-Z0-9]+)\s*$/i) || url.match(/\/([A-Z]{2}\d{3,}[A-Za-z0-9-]+)/);
    if (styleColorMatch) {
      const styleColor = styleColorMatch[1];
      const apiUrl = `https://api.nike.com/product_feed/threads/v3/?filter=marketplace(DE)&filter=language(de)&filter=productInfo.merchProduct.styleColor(${styleColor})`;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8_000);
        const res = await fetch(apiUrl, {
          headers: { "Accept": "application/json", "User-Agent": SCRAPER_HEADERS["User-Agent"] },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const thread = data?.objects?.[0];
          const productInfo = thread?.productInfo?.[0];
          if (productInfo) {
            const merch = productInfo.merchProduct;
            const price = merch?.currentPrice ?? productInfo.merchPrice?.currentPrice;
            const fullPrice = merch?.fullPrice ?? productInfo.merchPrice?.fullPrice;
            if (price) {
              return {
                price,
                original_price: fullPrice && fullPrice > price ? fullPrice : null,
                discount_pct: fullPrice && fullPrice > price ? Math.round(((fullPrice - price) / fullPrice) * 100) : null,
                title: productInfo.productContent?.title ?? thread?.publishedContent?.properties?.title ?? null,
                image_url: thread?.publishedContent?.properties?.coverCard?.properties?.portraitURL ?? productInfo.imageUrls?.productImageUrl ?? null,
                available: merch?.status === "ACTIVE",
              };
            }
          }
        }
      } catch { /* API failed, try HTML */ }
    }

    // Strategy 2: Fetch HTML and try JSON-LD / regex
    const html = await fetchWithRetry(url);
    if (!html) return null;
    const $ = cheerio.load(html);
    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) return result;
    }
    const regexPrice = extractPriceFromHtml(html);
    if (regexPrice) return { price: regexPrice, original_price: null, discount_pct: null, title: pageTitle($), image_url: firstImage($), available: true };
    return null;
  } catch (err) {
    console.error("[scrapers] scrapeNike error:", err);
    return null;
  }
}

export async function scrapeAdidas(url: string): Promise<ScrapedResult | null> {
  try {
    // Strategy 1: Adidas public product API using SKU from URL
    // URL: https://www.adidas.de/samba-og-schuh/B75806.html → SKU = B75806
    const skuMatch = url.match(/\/([A-Z0-9]{5,12})\.html/i) || url.match(/\/([A-Z]{1,2}\d{4,}[A-Za-z0-9-]*)/);
    if (skuMatch) {
      const sku = skuMatch[1];
      const apiUrl = `https://www.adidas.de/api/products/${sku}`;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8_000);
        const res = await fetch(apiUrl, {
          headers: { "Accept": "application/json", "User-Agent": SCRAPER_HEADERS["User-Agent"] },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          const price = data.pricing_information?.currentPrice ?? data.price;
          const origPrice = data.pricing_information?.standard_price ?? data.pricing_information?.undiscounted_price;
          if (price) {
            return {
              price: typeof price === "string" ? parseFloat(price) : price,
              original_price: origPrice && origPrice > price ? (typeof origPrice === "string" ? parseFloat(origPrice) : origPrice) : null,
              discount_pct: origPrice && origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : null,
              title: data.name ?? data.model_number ?? null,
              image_url: data.view_list?.[0]?.image_url ?? data.image?.src ?? null,
              available: data.availability_status === "IN_STOCK" || data.in_stock === true,
            };
          }
        }
      } catch { /* API failed, try HTML */ }
    }

    // Strategy 2: HTML scraping
    const html = await fetchWithRetry(url);
    if (!html) return null;
    const $ = cheerio.load(html);
    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) return result;
    }
    const regexPrice = extractPriceFromHtml(html);
    if (regexPrice) return { price: regexPrice, original_price: null, discount_pct: null, title: pageTitle($), image_url: firstImage($), available: true };
    return null;
  } catch (err) {
    console.error("[scrapers] scrapeAdidas error:", err);
    return null;
  }
}


export async function scrapeSnipes(url: string): Promise<ScrapedResult | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) {
        const origText = firstText($, [
          ".price-standard",
          ".product-price .price-standard",
        ]);
        if (origText) {
          result.original_price = parseEuroPrice(origText);
          result.discount_pct = computeDiscount(
            result.price,
            result.original_price,
          );
        }
        if (!result.title) result.title = pageTitle($);
        if (!result.image_url) result.image_url = firstImage($);
        return result;
      }
    }

    // Fallback
    const priceText = firstText($, [
      ".price-sales",
      ".product-price .price-sales",
      ".product-price",
    ]);
    const price = priceText ? parseEuroPrice(priceText) : null;

    const origText = firstText($, [
      ".price-standard",
      ".product-price .price-standard",
    ]);
    const originalPrice = origText ? parseEuroPrice(origText) : null;

    return {
      price,
      original_price: originalPrice,
      discount_pct: computeDiscount(price, originalPrice),
      title: pageTitle($),
      image_url: firstImage($),
      available: price !== null,
    };
  } catch (err) {
    console.error("[scrapers] scrapeSnipes error:", err);
    return null;
  }
}

export async function scrapeFootLocker(
  url: string,
): Promise<ScrapedResult | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) {
        const origText = firstText($, [
          ".ProductPrice--original",
          ".ProductPrice--crossed",
          '[data-test="product-price-original"]',
        ]);
        if (origText) {
          result.original_price = parseEuroPrice(origText);
          result.discount_pct = computeDiscount(
            result.price,
            result.original_price,
          );
        }
        if (!result.title) result.title = pageTitle($);
        if (!result.image_url) result.image_url = firstImage($);
        return result;
      }
    }

    // Fallback
    const priceText = firstText($, [
      ".ProductPrice",
      '[data-test="product-price"]',
      ".ProductPrice--sale",
    ]);
    const price = priceText ? parseEuroPrice(priceText) : null;

    const origText = firstText($, [
      ".ProductPrice--original",
      ".ProductPrice--crossed",
      '[data-test="product-price-original"]',
    ]);
    const originalPrice = origText ? parseEuroPrice(origText) : null;

    return {
      price,
      original_price: originalPrice,
      discount_pct: computeDiscount(price, originalPrice),
      title: pageTitle($),
      image_url: firstImage($),
      available: price !== null,
    };
  } catch (err) {
    console.error("[scrapers] scrapeFootLocker error:", err);
    return null;
  }
}

export async function scrapeJdSports(
  url: string,
): Promise<ScrapedResult | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) {
        const wasText = firstText($, [".was", ".was-price", ".price-was"]);
        if (wasText) {
          result.original_price = parseEuroPrice(wasText);
          result.discount_pct = computeDiscount(
            result.price,
            result.original_price,
          );
        }
        if (!result.title) result.title = pageTitle($);
        if (!result.image_url) result.image_url = firstImage($);
        return result;
      }
    }

    // Fallback
    const priceText = firstText($, [".now", ".itemPrice", ".price-now"]);
    const price = priceText ? parseEuroPrice(priceText) : null;

    const wasText = firstText($, [".was", ".was-price", ".price-was"]);
    const originalPrice = wasText ? parseEuroPrice(wasText) : null;

    return {
      price,
      original_price: originalPrice,
      discount_pct: computeDiscount(price, originalPrice),
      title: pageTitle($),
      image_url: firstImage($),
      available: price !== null,
    };
  } catch (err) {
    console.error("[scrapers] scrapeJdSports error:", err);
    return null;
  }
}

export async function scrapeAboutYou(
  url: string,
): Promise<ScrapedResult | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    // About You is heavily JS-rendered. JSON-LD is our best bet.
    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) {
        if (!result.title) result.title = pageTitle($);
        if (!result.image_url) result.image_url = firstImage($);
        return result;
      }
    }

    // Fallback – may not work well due to JS rendering
    const priceText = firstText($, [
      '[data-testid="productPrice"]',
      '[data-testid="finalPrice"]',
      ".product-price",
    ]);
    const price = priceText ? parseEuroPrice(priceText) : null;

    const origText = firstText($, [
      '[data-testid="originalPrice"]',
      '[data-testid="productPrice"] s',
      '[data-testid="productPrice"] del',
    ]);
    const originalPrice = origText ? parseEuroPrice(origText) : null;

    return {
      price,
      original_price: originalPrice,
      discount_pct: computeDiscount(price, originalPrice),
      title: pageTitle($),
      image_url: firstImage($),
      available: price !== null,
    };
  } catch (err) {
    console.error("[scrapers] scrapeAboutYou error:", err);
    return null;
  }
}

export async function scrapeBstn(url: string): Promise<ScrapedResult | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) {
        const origText = firstText($, [
          ".product-price--old",
          ".price--old",
          ".price del",
          ".product-price del",
        ]);
        if (origText) {
          result.original_price = parseEuroPrice(origText);
          result.discount_pct = computeDiscount(
            result.price,
            result.original_price,
          );
        }
        if (!result.title) result.title = pageTitle($);
        if (!result.image_url) result.image_url = firstImage($);
        return result;
      }
    }

    // Fallback
    const priceText = firstText($, [
      ".product-price",
      ".price",
      ".product-price--current",
    ]);
    const price = priceText ? parseEuroPrice(priceText) : null;

    const origText = firstText($, [
      ".product-price--old",
      ".price--old",
      ".price del",
    ]);
    const originalPrice = origText ? parseEuroPrice(origText) : null;

    return {
      price,
      original_price: originalPrice,
      discount_pct: computeDiscount(price, originalPrice),
      title: pageTitle($),
      image_url: firstImage($),
      available: price !== null,
    };
  } catch (err) {
    console.error("[scrapers] scrapeBstn error:", err);
    return null;
  }
}

export async function scrapeAsphaltgold(
  url: string,
): Promise<ScrapedResult | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) {
        const origText = firstText($, [
          ".product-price--old",
          ".product-price del",
          ".price--old",
        ]);
        if (origText) {
          result.original_price = parseEuroPrice(origText);
          result.discount_pct = computeDiscount(
            result.price,
            result.original_price,
          );
        }
        if (!result.title) result.title = pageTitle($);
        if (!result.image_url) result.image_url = firstImage($);
        return result;
      }
    }

    // Fallback
    const priceText = firstText($, [
      ".product-price",
      ".product-price--current",
      ".price",
    ]);
    const price = priceText ? parseEuroPrice(priceText) : null;

    const origText = firstText($, [
      ".product-price--old",
      ".product-price del",
      ".price--old",
    ]);
    const originalPrice = origText ? parseEuroPrice(origText) : null;

    return {
      price,
      original_price: originalPrice,
      discount_pct: computeDiscount(price, originalPrice),
      title: pageTitle($),
      image_url: firstImage($),
      available: price !== null,
    };
  } catch (err) {
    console.error("[scrapers] scrapeAsphaltgold error:", err);
    return null;
  }
}

export async function scrapeSolebox(
  url: string,
): Promise<ScrapedResult | null> {
  const html = await fetchWithRetry(url);
  if (!html) return null;

  try {
    const $ = cheerio.load(html);

    const ld = extractJsonLd($);
    if (ld) {
      const result = resultFromJsonLd(ld);
      if (result && result.price !== null) {
        const origText = firstText($, [
          ".product-price--old",
          ".product-price del",
          ".price--old",
        ]);
        if (origText) {
          result.original_price = parseEuroPrice(origText);
          result.discount_pct = computeDiscount(
            result.price,
            result.original_price,
          );
        }
        if (!result.title) result.title = pageTitle($);
        if (!result.image_url) result.image_url = firstImage($);
        return result;
      }
    }

    // Fallback
    const priceText = firstText($, [
      ".product-price",
      ".product-price--current",
      ".price",
    ]);
    const price = priceText ? parseEuroPrice(priceText) : null;

    const origText = firstText($, [
      ".product-price--old",
      ".product-price del",
      ".price--old",
    ]);
    const originalPrice = origText ? parseEuroPrice(origText) : null;

    return {
      price,
      original_price: originalPrice,
      discount_pct: computeDiscount(price, originalPrice),
      title: pageTitle($),
      image_url: firstImage($),
      available: price !== null,
    };
  } catch (err) {
    console.error("[scrapers] scrapeSolebox error:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

/** Map of site keys to their scraper functions. */
const SCRAPERS: Record<string, (url: string) => Promise<ScrapedResult | null>> =
  {
    zalando: scrapeZalando,
    nike: scrapeNike,
    adidas: scrapeAdidas,
    snipes: scrapeSnipes,
    footlocker: scrapeFootLocker,
    "foot-locker": scrapeFootLocker,
    jdsports: scrapeJdSports,
    "jd-sports": scrapeJdSports,
    aboutyou: scrapeAboutYou,
    "about-you": scrapeAboutYou,
    bstn: scrapeBstn,
    asphaltgold: scrapeAsphaltgold,
    solebox: scrapeSolebox,
  };

/**
 * Main entry point. Routes to the correct scraper based on the site key.
 *
 * @param site  - Short identifier (e.g. "zalando", "nike", "adidas")
 * @param url   - Full product page URL
 * @returns Scraped result or null on failure
 */
export async function scrapePrice(
  site: string,
  url: string,
): Promise<ScrapedResult | null> {
  const key = site.toLowerCase().replace(/[\s_]/g, "");
  const scraper = SCRAPERS[key];

  if (!scraper) {
    // Try to infer scraper from URL hostname as a fallback
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      for (const [scraperKey, scraperFn] of Object.entries(SCRAPERS)) {
        if (hostname.includes(scraperKey.replace("-", ""))) {
          return scraperFn(url);
        }
      }
    } catch {
      // Invalid URL
    }

    console.warn(`[scrapers] No scraper found for site: "${site}"`);
    return null;
  }

  return scraper(url);
}
