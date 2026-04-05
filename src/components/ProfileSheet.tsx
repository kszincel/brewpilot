"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { KNOWN_GRINDERS, BREW_METHODS, type UserPreferences } from "@/lib/constants";

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
  prefs: UserPreferences;
  onUpdatePrefs: (prefs: UserPreferences) => void;
  userEmail: string;
}

export function ProfileSheet({ open, onClose, prefs, onUpdatePrefs, userEmail }: ProfileSheetProps) {
  const [grinderId, setGrinderId] = useState(prefs.grinder_id);
  const [defaultMethod, setDefaultMethod] = useState(prefs.default_brew_method);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const currentGrinder = KNOWN_GRINDERS.find((g) => g.id === grinderId);
  const grinderName = currentGrinder?.name ?? prefs.grinder_custom_name ?? "Custom";

  async function handleSave() {
    setSaving(true);
    const updated = { ...prefs, grinder_id: grinderId, default_brew_method: defaultMethod };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_preferences").update({
        grinder_id: grinderId,
        default_brew_method: defaultMethod,
      }).eq("id", user.id);
    }

    onUpdatePrefs(updated);
    setSaving(false);
    onClose();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-[#fff8f6] rounded-t-[2rem] p-6 pb-10 shadow-[0_-12px_40px_rgba(43,22,17,0.12)] animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#d3c3c0] rounded-full mx-auto mb-6" />

        <h2 className="text-2xl font-black text-[#271310] tracking-tight mb-6">Profile</h2>

        {/* Email */}
        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#504442] block mb-1">Email</label>
          <p className="text-[#271310] font-medium">{userEmail}</p>
        </div>

        {/* Grinder */}
        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#504442] block mb-2">Grinder</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {KNOWN_GRINDERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGrinderId(g.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  grinderId === g.id
                    ? "bg-[#271310] text-[#ffba38]"
                    : "bg-white border border-[#d3c3c0] text-[#504442]"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Default brew method */}
        <div className="mb-8">
          <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-[#504442] block mb-2">Default brew method</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {BREW_METHODS.filter((m) => m.id !== "other").map((m) => (
              <button
                key={m.id}
                onClick={() => setDefaultMethod(m.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  defaultMethod === m.id
                    ? "bg-[#271310] text-[#ffba38]"
                    : "bg-white border border-[#d3c3c0] text-[#504442]"
                }`}
              >
                <span className="material-symbols-outlined text-base">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-full bg-[#ffba38] text-[#271310] font-bold text-sm uppercase tracking-widest disabled:opacity-40 transition-all"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 rounded-full border border-[#d3c3c0] text-[#504442] font-medium text-sm hover:bg-[#ffe9e4] transition-all"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
