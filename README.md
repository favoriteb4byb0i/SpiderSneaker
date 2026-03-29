# SneakerDeal

Track sneaker prices and deals across Zalando, About You, Snipes, and SNKRS. Get alerts on price drops and never miss a deal.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Backend:** Supabase (Auth, Database, Realtime)
- **Charts:** Recharts
- **Scraping:** Cheerio
- **Deployment:** Vercel
- **Mobile:** Capacitor-ready (Phase 2)

## Features

- **Deal Feed** — Browse hot deals with discount badges, price comparisons
- **Shop Monitoring** — Track deals from Zalando, About You, Snipes, SNKRS
- **Watchlist** — Add sneaker models with price thresholds and size filters
- **Price History** — Charts showing price trends over time per model
- **Notifications** — Alerts for price drops and new promotions
- **Dark/Light Mode** — Evira-inspired modern UI with theme toggle
- **PWA** — Installable progressive web app with offline support
- **Cron Scraping** — Automated price checks via Vercel Cron (every 4 hours)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- (Optional) Telegram Bot token for notifications

### Setup

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/favoriteb4byb0i/SpiderSneaker.git
   cd SpiderSneaker
   npm install
   ```

2. Copy and configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase URL, anon key, and other secrets.

3. Set up the database — run the SQL in `supabase/schema.sql` in your Supabase SQL Editor.

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/
│   │   ├── auth/callback/  # Supabase OAuth callback
│   │   └── cron/check-prices/ # Vercel Cron price scraper
│   ├── deals/              # All deals listing with filters
│   ├── shops/              # Shops listing
│   │   └── [slug]/         # Shop detail page
│   ├── model/[id]/         # Model detail with price history
│   ├── watchlist/          # User's watchlist
│   ├── notifications/      # Deal alerts feed
│   └── settings/           # User settings & preferences
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── deal-card.tsx       # Product deal card
│   ├── price-tag.tsx       # Price display (original + sale)
│   ├── discount-badge.tsx  # Discount percentage badge
│   ├── watchlist-button.tsx # Heart toggle
│   ├── shop-badge.tsx      # Shop indicator pill
│   ├── shop-grid.tsx       # Shop cards grid
│   ├── price-history-chart.tsx # Recharts area chart
│   ├── sale-event-card.tsx # Upcoming sale event
│   └── theme-toggle.tsx    # Dark/light mode switch
├── lib/
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   ├── constants.ts        # Shops, mock data, options
│   └── utils.ts            # cn(), formatPrice(), calcDiscount()
└── types/
    └── database.ts         # TypeScript types for all entities
```

## Database Schema

See `supabase/schema.sql` for the full schema with RLS policies. Tables:

- `models` — Sneaker models (name, brand, image, category)
- `watchlist` — Per-user tracked models with price thresholds
- `price_snapshots` — Historical price data per model per site
- `events` — Upcoming sale events calendar
- `notification_settings` — User notification preferences
- `deal_alerts` — Price drop alert history

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables from `.env.example`
4. Deploy — cron jobs are auto-configured via `vercel.json`

### Capacitor (Phase 2)

The app is designed mobile-first with:
- Safe area insets
- 72px bottom tab bar
- Pull-to-refresh patterns
- No native-only APIs in the WebView

## License

MIT
