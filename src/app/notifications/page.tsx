"use client";

import { Bell, ExternalLink, TrendingDown } from "lucide-react";
import { MOCK_ALERTS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

const SITE_COLORS: Record<string, string> = {
  zalando: "#FF6900",
  aboutyou: "#9333EA",
  snipes: "#FFD700",
  snkrs: "#3B82F6",
};

function getRelativeTime(dateString: string): string {
  const now = new Date("2026-03-29T12:00:00Z");
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function getDateGroup(dateString: string): string {
  const now = new Date("2026-03-29T12:00:00Z");
  const date = new Date(dateString);

  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor(
    (nowDay.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

function groupAlerts(alerts: typeof MOCK_ALERTS) {
  const groups: Record<string, typeof MOCK_ALERTS> = {};
  const order = ["Today", "Yesterday", "Earlier"];

  for (const alert of alerts) {
    const group = getDateGroup(alert.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(alert);
  }

  return order
    .filter((g) => groups[g]?.length)
    .map((label) => ({ label, alerts: groups[label] }));
}

export default function NotificationsPage() {
  const grouped = groupAlerts(MOCK_ALERTS);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
            <p className="text-sm text-muted-foreground">
              {MOCK_ALERTS.length} price drop notifications
            </p>
          </div>
        </div>

        {/* Grouped alerts */}
        <div className="flex flex-col gap-8">
          {grouped.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h2>
              <div className="flex flex-col gap-3">
                {group.alerts.map((alert) => {
                  const savings = alert.old_price - alert.new_price;
                  const siteColor = SITE_COLORS[alert.site] ?? "#6B7280";

                  return (
                    <div
                      key={alert.id}
                      className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 backdrop-blur-sm transition-colors hover:border-neutral-700"
                    >
                      <div className="flex items-start gap-4">
                        {/* Site indicator */}
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <span
                            className="block h-3 w-3 rounded-full ring-2 ring-neutral-800"
                            style={{ backgroundColor: siteColor }}
                          />
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {alert.site}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              {alert.model?.brand} {alert.model?.name}
                            </h3>
                            <span className="flex-shrink-0 text-xs text-muted-foreground">
                              {getRelativeTime(alert.created_at)}
                            </span>
                          </div>

                          {/* Price drop */}
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <TrendingDown className="h-4 w-4 text-success" />
                              <span className="text-sm tabular-nums text-muted-foreground line-through">
                                {formatPrice(alert.old_price)}
                              </span>
                              <span className="text-muted-foreground">&rarr;</span>
                              <span className="text-base font-bold tabular-nums text-foreground">
                                {formatPrice(alert.new_price)}
                              </span>
                            </div>
                            <span className="inline-flex items-center rounded-lg border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                              -{alert.discount_pct}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Save {formatPrice(savings)}
                            </span>
                          </div>

                          {/* CTA */}
                          <a
                            href={alert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-700 hover:text-white"
                          >
                            View Deal
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
