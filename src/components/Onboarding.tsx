"use client";

import { useState } from "react";
import { KNOWN_GRINDERS, BREW_METHODS, type UserPreferences } from "@/lib/constants";

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<"grinder" | "custom" | "method">("grinder");
  const [selectedGrinder, setSelectedGrinder] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(40);
  const [customUnit, setCustomUnit] = useState<"number" | "clicks">("number");
  const [selectedMethod, setSelectedMethod] = useState("v60");

  function handleGrinderSelect(id: string) {
    setSelectedGrinder(id);
    if (id === "custom") {
      setStep("custom");
    } else {
      setStep("method");
    }
  }

  function handleCustomNext() {
    if (!customName.trim() || customMax <= customMin) return;
    setStep("method");
  }

  function handleFinish() {
    const isCustom = selectedGrinder === "custom";
    const prefs: UserPreferences = {
      grinder_id: isCustom ? "custom" : selectedGrinder!,
      ...(isCustom && {
        grinder_custom_name: customName,
        grinder_min: customMin,
        grinder_max: customMax,
        grinder_unit: customUnit,
      }),
      default_brew_method: selectedMethod,
      locale: "pl",
    };
    onComplete(prefs);
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-accent text-3xl">coffee</span>
            <h1 className="text-3xl font-black text-primary tracking-tighter">brewpilot</h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-2 tracking-wide">Precision is personal.</p>
        </div>

        {/* Step: Grinder selection */}
        {step === "grinder" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-on-surface mb-4">What grinder do you use?</h2>
            {KNOWN_GRINDERS.map((g) => (
              <button
                key={g.id}
                onClick={() => handleGrinderSelect(g.id)}
                className={`
                  w-full p-4 rounded-[1rem] text-left transition-all shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]
                  ${selectedGrinder === g.id
                    ? "border-2 border-accent bg-surface-container"
                    : "border border-outline-variant bg-surface-container-lowest hover:border-outline"
                  }
                `}
              >
                <div className="font-semibold text-on-surface">{g.name}</div>
                <div className="text-xs text-on-surface-variant mt-1">
                  Scale {g.min}-{g.max} {g.unit === "clicks" ? "clicks" : ""}
                </div>
              </button>
            ))}
            <button
              onClick={() => handleGrinderSelect("custom")}
              className={`
                w-full p-4 rounded-[1rem] text-left transition-all shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]
                ${selectedGrinder === "custom"
                  ? "border-2 border-accent bg-surface-container"
                  : "border border-outline-variant bg-surface-container-lowest hover:border-outline"
                }
              `}
            >
              <div className="font-semibold text-on-surface">Other grinder</div>
              <div className="text-xs text-on-surface-variant mt-1">Enter your grinder details manually</div>
            </button>
          </div>
        )}

        {/* Step: Custom grinder details */}
        {step === "custom" && (
          <div className="space-y-4">
            <button onClick={() => setStep("grinder")} className="text-sm text-secondary mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </button>
            <h2 className="text-lg font-bold text-on-surface">Your grinder details</h2>

            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant block mb-1.5">Grinder name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Hario Skerton Pro"
                className="w-full p-3 rounded-[1rem] bg-surface-container-highest text-on-surface placeholder-outline border-b-2 border-transparent focus:border-accent focus:outline-none transition-all"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant block mb-1.5">Min setting</label>
                <input
                  type="number"
                  value={customMin}
                  onChange={(e) => setCustomMin(Number(e.target.value))}
                  className="w-full p-3 rounded-[1rem] bg-surface-container-highest text-on-surface border-b-2 border-transparent focus:border-accent focus:outline-none transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant block mb-1.5">Max setting</label>
                <input
                  type="number"
                  value={customMax}
                  onChange={(e) => setCustomMax(Number(e.target.value))}
                  className="w-full p-3 rounded-[1rem] bg-surface-container-highest text-on-surface border-b-2 border-transparent focus:border-accent focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant block mb-1.5">Scale type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setCustomUnit("number")}
                  className={`flex-1 p-3 rounded-[1rem] text-sm font-medium transition-all ${
                    customUnit === "number"
                      ? "bg-primary text-accent border-2 border-accent"
                      : "bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                  }`}
                >
                  Numbers
                </button>
                <button
                  onClick={() => setCustomUnit("clicks")}
                  className={`flex-1 p-3 rounded-[1rem] text-sm font-medium transition-all ${
                    customUnit === "clicks"
                      ? "bg-primary text-accent border-2 border-accent"
                      : "bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                  }`}
                >
                  Clicks
                </button>
              </div>
            </div>

            <button
              onClick={handleCustomNext}
              disabled={!customName.trim() || customMax <= customMin}
              className="w-full p-4 rounded-full bg-accent text-primary font-bold disabled:opacity-40 transition-all text-[11px] uppercase tracking-widest"
            >
              Next
            </button>
          </div>
        )}

        {/* Step: Default brew method */}
        {step === "method" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep(selectedGrinder === "custom" ? "custom" : "grinder")}
              className="text-sm text-secondary mb-2 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </button>
            <h2 className="text-lg font-bold text-on-surface mb-4">Your go-to brew method?</h2>

            <div className="flex flex-wrap gap-2">
              {BREW_METHODS.filter((m) => m.id !== "other").map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  className={`
                    px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5
                    ${selectedMethod === m.id
                      ? "bg-primary text-accent"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-base">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full p-4 rounded-full bg-accent text-primary font-bold mt-4 transition-all hover:brightness-105 text-[11px] uppercase tracking-widest shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]"
            >
              Start brewing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
