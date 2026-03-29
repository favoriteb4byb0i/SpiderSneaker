"use client";

import { useState } from "react";
import { Settings, Bell, MessageCircle, Palette, Info, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [digestTime, setDigestTime] = useState("09:00");
  const [telegramChatId, setTelegramChatId] = useState("");

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Account */}
          <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">
              <LogOut className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Account</h2>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                </div>
              </div>
              <button className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/20">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="flex flex-col divide-y divide-neutral-800">
              {/* Price drop alerts */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Price Drop Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified when tracked sneakers drop in price
                  </p>
                </div>
                <Switch
                  checked={priceDropAlerts}
                  onCheckedChange={setPriceDropAlerts}
                />
              </div>

              {/* Promo alerts */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Promo Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts for promo codes and flash sales
                  </p>
                </div>
                <Switch
                  checked={promoAlerts}
                  onCheckedChange={setPromoAlerts}
                />
              </div>

              {/* Daily digest */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Daily Digest</p>
                  <p className="text-xs text-muted-foreground">
                    Summary of the best deals, delivered daily
                  </p>
                </div>
                <Switch
                  checked={dailyDigest}
                  onCheckedChange={setDailyDigest}
                />
              </div>

              {/* Digest time */}
              {dailyDigest && (
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Digest Time</p>
                    <p className="text-xs text-muted-foreground">
                      When to send the daily summary
                    </p>
                  </div>
                  <input
                    type="time"
                    value={digestTime}
                    onChange={(e) => setDigestTime(e.target.value)}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Telegram */}
          <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Telegram</h2>
            </div>
            <div className="p-5">
              <p className="mb-3 text-xs text-muted-foreground">
                Connect your Telegram account to receive alerts directly in chat.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter Telegram Chat ID"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
                />
                <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Connect
                </button>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Theme</p>
                <p className="text-xs text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* About */}
          <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">About</h2>
            </div>
            <div className="flex flex-col divide-y divide-neutral-800">
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-sm font-medium text-foreground">Version</p>
                <p className="text-sm tabular-nums text-muted-foreground">1.0.0</p>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-sm font-medium text-foreground">Source</p>
                <a
                  href="https://github.com/SpiderSneaker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  GitHub
                </a>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-sm font-medium text-foreground">Privacy Policy</p>
                <a
                  href="#"
                  className="text-sm text-primary hover:underline"
                >
                  View
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
