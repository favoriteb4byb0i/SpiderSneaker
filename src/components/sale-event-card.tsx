"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaleEvent } from "@/types/database";

interface SaleEventCardProps {
  event: SaleEvent;
}

const siteColors: Record<string, string> = {
  zalando: "#FF6900",
  aboutyou: "#1A1A1A",
  snipes: "#E30613",
  snkrs: "#111111",
};

const siteLabels: Record<string, string> = {
  zalando: "Zalando",
  aboutyou: "About You",
  snipes: "Snipes",
  snkrs: "SNKRS",
};

function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CardContent({ event }: SaleEventCardProps) {
  return (
    <>
      {/* Site color accent bar */}
      {event.site && (
        <div
          className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
          style={{ backgroundColor: siteColors[event.site] ?? "#6B7280" }}
        />
      )}

      <div className="flex flex-col gap-2 pl-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-white">{event.title}</h3>
          {event.site && (
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white"
              style={{ backgroundColor: siteColors[event.site] ?? "#6B7280" }}
            >
              {siteLabels[event.site] ?? event.site}
            </span>
          )}
        </div>

        <time className="text-xs font-medium text-neutral-400">
          {formatEventDate(event.date)}
        </time>

        {event.description && (
          <p className="mt-1 text-sm leading-relaxed text-neutral-400">
            {event.description}
          </p>
        )}

        {event.site && (
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
            View Shop
            <ExternalLink size={12} />
          </span>
        )}
      </div>
    </>
  );
}

export function SaleEventCard({ event }: SaleEventCardProps) {
  const cardClasses = cn(
    "group relative overflow-hidden rounded-2xl p-5",
    "bg-[#1A1A1A] border border-neutral-800",
    "transition-colors hover:border-neutral-700",
  );

  if (event.site) {
    return (
      <Link href={`/shops/${event.site}`} className={cn(cardClasses, "block")}>
        <CardContent event={event} />
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      <CardContent event={event} />
    </div>
  );
}
