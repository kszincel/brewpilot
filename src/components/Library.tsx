"use client";

import { useState } from "react";
import { BREW_METHODS, KNOWN_GRINDERS, type CoffeeProfile, type UserPreferences } from "@/lib/constants";

interface LibraryProps {
  coffees: CoffeeProfile[];
  prefs: UserPreferences;
  onSelect: (coffee: CoffeeProfile) => void;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string, favorite: boolean) => void;
}

export function Library({ coffees, prefs, onSelect, onDelete, onToggleFavorite }: LibraryProps) {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string | null>(null);

  const grinder = KNOWN_GRINDERS.find((g) => g.id === prefs.grinder_id);

  const filtered = coffees.filter((c) => {
    const matchesSearch = [c.name, c.roaster, c.origin, ...(c.notes || [])].some((s) =>
      s?.toLowerCase().includes(search.toLowerCase())
    );
    const matchesMethod = !filterMethod || c.brew_method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  // Recent extractions: last 3 coffees
  const recentExtractions = coffees.slice(0, 3);

  if (coffees.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">local_library</span>
        <p className="text-sm text-on-surface-variant">No coffees saved yet. Scan your first bag!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editorial header */}
      <div>
        <h2 className="text-5xl font-black text-primary tracking-tight">Coffee<br/>Library</h2>
        <p className="text-sm text-on-surface-variant mt-2">Your curated collection of brews.</p>
      </div>

      {/* Search bar */}
      <div className="bg-surface-container-low rounded-[2rem] p-2 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-surface-container-lowest rounded-full px-4 py-2.5">
          <span className="material-symbols-outlined text-outline text-xl">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roaster, origin..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder-outline focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            showFilter || filterMethod ? "bg-primary text-accent" : "bg-surface-container-lowest text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-xl">tune</span>
        </button>
      </div>

      {/* Filter pills */}
      {showFilter && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterMethod(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !filterMethod ? "bg-primary text-accent" : "bg-surface-container-high text-on-surface-variant"
            }`}
          >
            All
          </button>
          {BREW_METHODS.filter((m) => m.id !== "other").map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMethod(m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                filterMethod === m.id ? "bg-primary text-accent" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-xs">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Coffee cards */}
      <div className="space-y-3">
        {filtered.map((coffee) => {
          const method = BREW_METHODS.find((m) => m.id === coffee.brew_method);
          return (
            <div
              key={coffee.id}
              onClick={() => onSelect(coffee)}
              className="bg-surface-container-lowest rounded-[1.5rem] p-4 cursor-pointer hover:shadow-[0_32px_64px_-12px_rgba(43,22,17,0.1)] transition-all shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)] relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-12">
                  <div className="font-bold text-on-surface">{coffee.name}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{coffee.roaster} - {coffee.origin}</div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {method && (
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] rounded-full font-medium flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">{method.icon}</span>
                        {method.label}
                      </span>
                    )}
                    {coffee.roast && (
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                        coffee.roast.toLowerCase().includes("light")
                          ? "bg-accent/20 text-primary"
                          : "bg-primary text-accent"
                      }`}>
                        {coffee.roast}
                      </span>
                    )}
                    {coffee.notes?.slice(0, 2).map((n) => (
                      <span key={n} className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] rounded-full font-medium">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-center min-w-[48px]">
                  <div className="text-3xl font-black text-primary leading-none tracking-tight">
                    {coffee.final_grind ?? coffee.grind}
                  </div>
                  <div className="text-[9px] text-on-surface-variant mt-1 font-bold uppercase tracking-wide">
                    {grinder?.name.split(" ").slice(-1)[0] || prefs.grinder_custom_name || "grind"}
                  </div>
                </div>
              </div>
              {/* Favorite heart */}
              {onToggleFavorite && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(coffee.id, !coffee.favorite); }}
                  className="absolute top-3 right-3 transition-all"
                >
                  <span className={`material-symbols-outlined text-xl ${coffee.favorite ? "filled text-accent" : "text-outline-variant"}`}>
                    favorite
                  </span>
                </button>
              )}
              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(coffee.id); }}
                className="absolute bottom-3 right-3 text-outline-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Recent Extractions */}
      {recentExtractions.length > 0 && (
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant mb-3">Recent Extractions</h3>
          <div className="bg-surface-container-lowest rounded-[1.5rem] divide-y divide-outline-variant shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
            {recentExtractions.map((coffee) => {
              const method = BREW_METHODS.find((m) => m.id === coffee.brew_method);
              return (
                <div key={coffee.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent text-lg">{method?.icon || "coffee"}</span>
                    <div>
                      <div className="text-sm font-medium text-on-surface">{coffee.name}</div>
                      <div className="text-[10px] text-on-surface-variant">
                        {method?.label} - {coffee.dose}g:{coffee.water}ml - {coffee.time_target}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-on-surface-variant">
                    {new Date(coffee.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
