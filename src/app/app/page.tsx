"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AuthGate } from "@/components/AuthGate";
import { Onboarding } from "@/components/Onboarding";
import { Scanner } from "@/components/Scanner";
import { CoffeeResult } from "@/components/CoffeeResult";
import { Library } from "@/components/Library";
import { BottomNav } from "@/components/BottomNav";
import type { UserPreferences, CoffeeProfile } from "@/lib/constants";

type View = "scan" | "result" | "library";

function BrewpilotApp() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("scan");
  const [currentCoffee, setCurrentCoffee] = useState<Partial<CoffeeProfile> | null>(null);
  const [coffees, setCoffees] = useState<CoffeeProfile[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: prefData } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prefData && prefData.onboarded) {
        setPrefs(prefData as UserPreferences);
        setOnboarded(true);
      } else {
        setOnboarded(false);
      }

      const { data: coffeeData } = await supabase
        .from("coffees")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (coffeeData) setCoffees(coffeeData as CoffeeProfile[]);
    }

    loadUser();
  }, []);

  const handleOnboarding = useCallback(async (newPrefs: UserPreferences) => {
    if (!userId) return;

    await supabase.from("user_preferences").upsert({
      id: userId,
      ...newPrefs,
      onboarded: true,
    });

    setPrefs(newPrefs);
    setOnboarded(true);
  }, [userId]);

  const handleScanResult = useCallback((coffee: Partial<CoffeeProfile>) => {
    setCurrentCoffee(coffee);
    setView("result");
  }, []);

  const handleSave = useCallback(async (coffee: Partial<CoffeeProfile>) => {
    if (!userId) return;

    const { data } = await supabase
      .from("coffees")
      .insert({
        user_id: userId,
        name: coffee.name,
        roaster: coffee.roaster,
        origin: coffee.origin,
        process: coffee.process,
        roast: coffee.roast,
        notes: coffee.notes,
        grind: coffee.grind,
        grind_range: coffee.grind_range,
        final_grind: coffee.final_grind ?? coffee.grind,
        brew_temp: coffee.brew_temp,
        dose: coffee.dose,
        water: coffee.water,
        time_target: coffee.time_target,
        brew_method: coffee.brew_method,
        grinder_id: coffee.grinder_id,
        reasoning: coffee.reasoning,
        technique: coffee.technique,
        image_url: coffee.image_url,
        favorite: false,
      })
      .select()
      .single();

    if (data) {
      setCoffees((prev) => [data as CoffeeProfile, ...prev]);
      setView("library");
      setCurrentCoffee(null);
    }
  }, [userId]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from("coffees").delete().eq("id", id);
    setCoffees((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleToggleFavorite = useCallback(async (id: string, favorite: boolean) => {
    await supabase.from("coffees").update({ favorite }).eq("id", id);
    setCoffees((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite } : c))
    );
    // Also update currentCoffee if it's the same
    setCurrentCoffee((prev) => (prev && prev.id === id ? { ...prev, favorite } : prev));
  }, []);

  const handleSelectFromLibrary = useCallback((coffee: CoffeeProfile) => {
    setCurrentCoffee(coffee);
    setView("result");
  }, []);

  const handleNavigate = useCallback((newView: View) => {
    if (newView === "scan") {
      setCurrentCoffee(null);
    }
    setView(newView);
  }, []);

  // Loading state
  if (onboarded === null) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-on-surface-variant font-medium">Loading...</div>
      </div>
    );
  }

  // Onboarding
  if (!onboarded || !prefs) {
    return <Onboarding onComplete={handleOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 pb-28">
        {/* Header */}
        <header className="py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-accent text-xl">coffee</span>
            <h1 className="text-xl font-black text-primary tracking-tighter">brewpilot</h1>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="flex items-center gap-1 text-xs text-outline hover:text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
          </button>
        </header>

        {/* Content */}
        {view === "scan" && <Scanner prefs={prefs} onResult={handleScanResult} />}
        {view === "result" && currentCoffee && (
          <CoffeeResult
            coffee={currentCoffee}
            prefs={prefs}
            onSave={handleSave}
            onBack={() => { setView("scan"); setCurrentCoffee(null); }}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {view === "library" && (
          <Library
            coffees={coffees}
            prefs={prefs}
            onSelect={handleSelectFromLibrary}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </div>

      {/* Bottom nav */}
      <BottomNav activeView={view} onNavigate={handleNavigate} />
    </div>
  );
}

export default function Home() {
  return (
    <AuthGate>
      <BrewpilotApp />
    </AuthGate>
  );
}
