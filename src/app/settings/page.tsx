"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Bell,
  MessageCircle,
  Palette,
  Info,
  LogOut,
  Mail,
  Loader2,
  User,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth form state
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Settings state (local for now)
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [digestTime, setDigestTime] = useState("09:00");
  const [telegramChatId, setTelegramChatId] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }

    loadUser();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/api/auth/callback",
      },
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    const supabase = createClient();

    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/api/auth/callback",
        },
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthSuccess("Check your email for a confirmation link.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setUser(data.user);
        setEmail("");
        setPassword("");
      }
    }

    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              <User className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Account</h2>
            </div>
            <div className="flex flex-col gap-4 p-5">
              {user ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Not signed in
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sign in to sync your watchlist and receive alerts.
                    </p>
                  </div>

                  {/* Google Sign In */}
                  <button
                    onClick={handleGoogleSignIn}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-neutral-600 hover:bg-neutral-700"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-neutral-800" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="h-px flex-1 bg-neutral-800" />
                  </div>

                  {/* Email Sign In / Sign Up */}
                  <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
                    />

                    {authError && (
                      <p className="text-xs text-red-400">{authError}</p>
                    )}
                    {authSuccess && (
                      <p className="text-xs text-success">{authSuccess}</p>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {authLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      {authMode === "signin"
                        ? "Sign In with Email"
                        : "Create Account"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === "signin" ? "signup" : "signin");
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {authMode === "signin"
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </section>

          {/* Notifications */}
          <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 border-b border-neutral-800 px-5 py-4">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Notifications
              </h2>
            </div>
            <div className="flex flex-col divide-y divide-neutral-800">
              {/* Price drop alerts */}
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Price Drop Alerts
                  </p>
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
                  <p className="text-sm font-medium text-foreground">
                    Promo Alerts
                  </p>
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
                  <p className="text-sm font-medium text-foreground">
                    Daily Digest
                  </p>
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
                    <p className="text-sm font-medium text-foreground">
                      Digest Time
                    </p>
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
              <h2 className="text-sm font-semibold text-foreground">
                Appearance
              </h2>
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
                <p className="text-sm tabular-nums text-muted-foreground">
                  1.0.0
                </p>
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
                <p className="text-sm font-medium text-foreground">
                  Privacy Policy
                </p>
                <a href="#" className="text-sm text-primary hover:underline">
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
