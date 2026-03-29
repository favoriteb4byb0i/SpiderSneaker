"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Store, Heart, Settings, Bell, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/deals", label: "Deals", icon: Flame },
  { href: "/shops", label: "Shops", icon: Store },
  { href: "/watchlist", label: "Watchlist", icon: Heart },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <Zap className="h-6 w-6 text-primary fill-primary" />
        <span className="text-xl font-extrabold tracking-tight">SneakerDeal</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <ThemeToggle />
      </div>
    </aside>
  );
}
