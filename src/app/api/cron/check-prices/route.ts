import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const CRON_SECRET = process.env.CRON_SECRET;

const RATE_LIMIT_MS = { min: 2000, max: 5000 };

function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

interface ScrapedPrice {
  model_id: string;
  site: string;
  price: number | null;
  original_price: number | null;
  discount_pct: number | null;
  url: string;
}

async function scrapeZalando(url: string, modelId: string): Promise<ScrapedPrice | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Look for structured price data in JSON-LD
    let price: number | null = null;
    let originalPrice: number | null = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "");
        if (data["@type"] === "Product" && data.offers) {
          const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          price = parseFloat(offer.price);
          if (offer.priceSpecification?.price) {
            originalPrice = parseFloat(offer.priceSpecification.price);
          }
        }
      } catch {
        // skip invalid JSON-LD
      }
    });

    // Fallback: look for price elements
    if (!price) {
      const priceText = $('[data-testid="price"] span, .z-price, .price__amount').first().text();
      const match = priceText.match(/[\d,.]+/);
      if (match) {
        price = parseFloat(match[0].replace(",", "."));
      }
    }

    if (!originalPrice) {
      const origText = $('[data-testid="original-price"], .z-price--original, .price__original')
        .first()
        .text();
      const match = origText.match(/[\d,.]+/);
      if (match) {
        originalPrice = parseFloat(match[0].replace(",", "."));
      }
    }

    let discountPct: number | null = null;
    if (price && originalPrice && originalPrice > price) {
      discountPct = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    return {
      model_id: modelId,
      site: "zalando",
      price,
      original_price: originalPrice,
      discount_pct: discountPct,
      url,
    };
  } catch (error) {
    console.error(`[Zalando] Error scraping ${url}:`, error);
    return null;
  }
}

async function checkRobotsTxt(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`${domain}/robots.txt`);
    if (!res.ok) return true; // If no robots.txt, allow
    const text = await res.text();
    // Basic check: if Disallow: / for all user agents, skip
    if (text.includes("User-agent: *") && text.includes("Disallow: /\n")) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: ScrapedPrice[] = [];

  // In production, you would:
  // 1. Fetch all tracked models + their URLs from Supabase
  // 2. Group by domain
  // 3. Scrape each with rate limiting
  // 4. Store results in price_snapshots table
  // 5. Compare with previous snapshot and trigger alerts

  // Example: scrape Zalando URLs
  const zalandoAllowed = await checkRobotsTxt("https://www.zalando.de");

  if (zalandoAllowed) {
    // In production, these would come from the database
    const urls = [
      { modelId: "1", url: "https://www.zalando.de/nike-air-max-90.html" },
    ];

    for (const { modelId, url } of urls) {
      await randomDelay(RATE_LIMIT_MS.min, RATE_LIMIT_MS.max);
      const result = await scrapeZalando(url, modelId);
      if (result) {
        results.push(result);
      }
    }
  }

  // TODO: Store in Supabase
  // const supabase = createServerSupabaseClient();
  // for (const result of results) {
  //   await supabase.from("price_snapshots").insert({
  //     ...result,
  //     checked_at: new Date().toISOString(),
  //   });
  // }

  // TODO: Compare with previous prices and send notifications
  // for (const result of results) {
  //   const { data: prev } = await supabase
  //     .from("price_snapshots")
  //     .select("price")
  //     .eq("model_id", result.model_id)
  //     .eq("site", result.site)
  //     .order("checked_at", { ascending: false })
  //     .limit(1)
  //     .single();
  //   if (prev && result.price && prev.price > result.price) {
  //     // Trigger notification
  //   }
  // }

  return NextResponse.json({
    success: true,
    checked: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
