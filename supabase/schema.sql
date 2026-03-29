-- SneakerDeal Database Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Models table
create table if not exists public.models (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text not null,
  image_url text,
  category text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Watchlist table
create table if not exists public.watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model_id uuid not null references public.models(id) on delete cascade,
  max_price decimal(10,2),
  size_eu decimal(4,1),
  created_at timestamptz default now(),
  unique(user_id, model_id)
);

-- Price snapshots table
create table if not exists public.price_snapshots (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid not null references public.models(id) on delete cascade,
  site text not null check (site in ('zalando', 'aboutyou', 'snipes', 'snkrs')),
  price decimal(10,2) not null,
  original_price decimal(10,2),
  discount_pct integer,
  url text not null,
  checked_at timestamptz default now()
);

-- Sale events table
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date date not null,
  description text,
  site text check (site in ('zalando', 'aboutyou', 'snipes', 'snkrs')),
  created_at timestamptz default now()
);

-- Notification settings table
create table if not exists public.notification_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  telegram_chat_id text,
  web_push_enabled boolean default false,
  daily_digest_time time,
  price_drop_alert boolean default true,
  promo_alert boolean default true,
  created_at timestamptz default now()
);

-- Deal alerts table
create table if not exists public.deal_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model_id uuid not null references public.models(id) on delete cascade,
  site text not null,
  old_price decimal(10,2) not null,
  new_price decimal(10,2) not null,
  discount_pct integer not null,
  url text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_watchlist_user on public.watchlist(user_id);
create index if not exists idx_price_snapshots_model on public.price_snapshots(model_id, checked_at desc);
create index if not exists idx_price_snapshots_site on public.price_snapshots(site, checked_at desc);
create index if not exists idx_deal_alerts_user on public.deal_alerts(user_id, created_at desc);
create index if not exists idx_events_date on public.events(date);

-- Row Level Security
alter table public.models enable row level security;
alter table public.watchlist enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.events enable row level security;
alter table public.notification_settings enable row level security;
alter table public.deal_alerts enable row level security;

-- Models: anyone can read, authenticated users can create
create policy "Models are viewable by everyone" on public.models
  for select using (true);
create policy "Authenticated users can create models" on public.models
  for insert with check (auth.uid() is not null);

-- Watchlist: users can only access their own
create policy "Users can view own watchlist" on public.watchlist
  for select using (auth.uid() = user_id);
create policy "Users can manage own watchlist" on public.watchlist
  for all using (auth.uid() = user_id);

-- Price snapshots: anyone can read, only service role can write
create policy "Price snapshots are viewable by everyone" on public.price_snapshots
  for select using (true);

-- Events: anyone can read
create policy "Events are viewable by everyone" on public.events
  for select using (true);

-- Notification settings: users can only access their own
create policy "Users can view own notification settings" on public.notification_settings
  for select using (auth.uid() = user_id);
create policy "Users can manage own notification settings" on public.notification_settings
  for all using (auth.uid() = user_id);

-- Deal alerts: users can only view their own
create policy "Users can view own alerts" on public.deal_alerts
  for select using (auth.uid() = user_id);
