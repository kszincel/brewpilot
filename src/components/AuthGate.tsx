"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<unknown>(null);
  const [checking, setChecking] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-on-surface-variant font-medium">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Left branding panel */}
      <div className="md:w-1/2 bg-primary-container relative flex items-center justify-center p-8 md:p-12 min-h-[200px] md:min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary-container/80" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="material-symbols-outlined text-accent text-4xl">coffee</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">brewpilot</h1>
          </div>
          <p className="text-tertiary-fixed text-sm md:text-base font-medium tracking-wide">
            Your coffee, dialed in.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo (hidden on desktop where branding panel shows) */}
          <div className="md:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-accent text-2xl">coffee</span>
              <h1 className="text-2xl font-black text-primary tracking-tighter">brewpilot</h1>
            </div>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-accent text-5xl">mark_email_read</span>
              <h2 className="text-lg font-bold text-on-surface">Check your email</h2>
              <p className="text-sm text-on-surface-variant">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-secondary underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full p-3.5 rounded-2xl border border-outline-variant bg-surface-container-lowest font-medium text-on-surface flex items-center justify-center gap-3 hover:border-outline transition-all text-[11px] uppercase tracking-wide"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-outline">or use email</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              <form onSubmit={handleMagicLink} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full p-3.5 rounded-2xl bg-surface-container-highest text-on-surface placeholder-outline border-b-2 border-transparent focus:border-accent focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full p-3.5 rounded-full bg-primary-container text-white font-semibold disabled:opacity-40 transition-all shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]"
                >
                  {loading ? "Sending..." : "Send magic link"}
                </button>
              </form>

              {error && (
                <p className="text-sm text-error text-center">{error}</p>
              )}

              <p className="text-center text-sm text-on-surface-variant pt-2">
                Don&apos;t have an archive yet?{" "}
                <button onClick={() => {}} className="text-accent font-semibold">
                  Create Account
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Floating bottom nav */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-6 text-[10px] uppercase tracking-[0.1em] font-bold text-outline">
          <a href="#" className="hover:text-on-surface-variant transition-colors">Privacy</a>
          <a href="#" className="hover:text-on-surface-variant transition-colors">Terms</a>
        </div>
      </div>
    </div>
  );
}
