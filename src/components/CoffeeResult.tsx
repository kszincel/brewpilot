"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GrindDial } from "./GrindDial";
import { BREW_METHODS, KNOWN_GRINDERS, type CoffeeProfile, type UserPreferences } from "@/lib/constants";
import { buildFeedbackPrompt } from "@/lib/prompts";

interface CoffeeResultProps {
  coffee: Partial<CoffeeProfile>;
  prefs: UserPreferences;
  onSave: (coffee: Partial<CoffeeProfile>) => void;
  onBack: () => void;
  onToggleFavorite?: (id: string, favorite: boolean) => void;
}

const FEEDBACK_PRESETS = [
  { icon: "sentiment_stressed", label: "Bitter/harsh", value: "Too bitter and harsh, over-extracted" },
  { icon: "sentiment_dissatisfied", label: "Sour/thin", value: "Too sour and thin, under-extracted" },
  { icon: "sentiment_neutral", label: "Flat/boring", value: "Flat and boring, lacking flavor" },
  { icon: "sentiment_very_satisfied", label: "Perfect!", value: "Perfect, great balance and flavor" },
];

function parseTimeToSeconds(timeStr: string): number {
  // Parse formats like "2:30", "3:00", "25-30s", "2:30-3:30", "4-6 min", "12-18h"
  const match = timeStr.match(/^(\d+):(\d+)/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  const secMatch = timeStr.match(/^(\d+)s/);
  if (secMatch) return parseInt(secMatch[1]);
  const minMatch = timeStr.match(/^(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  // Fallback: try to parse "X:XX-Y:YY" and use the first value
  const rangeMatch = timeStr.match(/(\d+):(\d+)/);
  if (rangeMatch) return parseInt(rangeMatch[1]) * 60 + parseInt(rangeMatch[2]);
  return 180; // default 3 minutes
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function CoffeeResult({ coffee, prefs, onSave, onBack, onToggleFavorite }: CoffeeResultProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [correction, setCorrection] = useState<{
    adjustment: number;
    new_grind: number;
    diagnosis: string;
    tip: string;
    updated_technique?: string;
  } | null>(null);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = parseTimeToSeconds(coffee.time_target || "3:00");

  const method = BREW_METHODS.find((m) => m.id === coffee.brew_method);
  const grinder = KNOWN_GRINDERS.find((g) => g.id === prefs.grinder_id);
  const gMin = grinder?.min ?? prefs.grinder_min ?? 0;
  const gMax = grinder?.max ?? prefs.grinder_max ?? 40;
  const gUnit = grinder?.unit ?? prefs.grinder_unit ?? "number";

  const startTimer = useCallback(() => {
    if (!timerActive) {
      setTimerActive(true);
      setTimerSeconds(totalSeconds);
    }
    setTimerRunning(true);
  }, [timerActive, totalSeconds]);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setTimerSeconds(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerSeconds]);

  async function handleFeedback(text: string) {
    setFeedbackLoading(true);

    const feedbackContext = `Coffee: ${coffee.name} by ${coffee.roaster}
Origin: ${coffee.origin}, Process: ${coffee.process}, Roast: ${coffee.roast}
Current grind: ${coffee.final_grind ?? coffee.grind} on scale ${gMin}-${gMax}
Current brew temp: ${coffee.brew_temp}°C
Dose: ${coffee.dose}g, Water: ${coffee.water}ml
Method: ${method?.label}

User feedback: ${text}`;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedbackContext,
          systemPrompt: buildFeedbackPrompt(coffee.brew_method || "v60", prefs),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCorrection(data);
    } catch {
      setCorrection(null);
    } finally {
      setFeedbackLoading(false);
    }
  }

  const displayGrind = correction?.new_grind ?? coffee.final_grind ?? coffee.grind ?? 0;

  // Parse technique into numbered steps
  const techniqueText = correction?.updated_technique || coffee.technique || "";
  const techniqueSteps = techniqueText
    .split(/\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="space-y-5">
      {/* Sticky header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-secondary">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Scan
        </button>
        <div className="flex items-center gap-3">
          {/* Favorite toggle */}
          {coffee.id && onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(coffee.id!, !coffee.favorite)}
              className="transition-all"
            >
              <span className={`material-symbols-outlined text-2xl ${coffee.favorite ? "filled text-accent" : "text-outline"}`}>
                favorite
              </span>
            </button>
          )}
          {/* User avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
          </div>
        </div>
      </div>

      {/* Hero section */}
      <div className="text-center py-2">
        <h2 className="text-3xl font-black text-primary tracking-tight">
          The Perfect <span className="text-accent">Ratio</span>
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">{coffee.name} by {coffee.roaster}</p>
      </div>

      {/* Coffee info card */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-5 space-y-5 shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
        <div className="flex items-start gap-4">
          {coffee.image_url && (
            <img src={coffee.image_url} alt="" className="w-16 h-16 rounded-[1rem] object-cover" />
          )}
          <div className="flex-1">
            <div className="flex gap-1.5 flex-wrap">
              {coffee.notes?.map((note) => (
                <span key={note} className="px-2.5 py-0.5 bg-surface-container text-on-surface text-xs rounded-full font-medium">
                  {note}
                </span>
              ))}
              {coffee.roast && (
                <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                  coffee.roast.toLowerCase().includes("light")
                    ? "bg-accent/20 text-primary"
                    : "bg-primary text-accent"
                }`}>
                  {coffee.roast}
                </span>
              )}
              {coffee.process && (
                <span className="px-2.5 py-0.5 bg-secondary-container text-secondary text-xs rounded-full font-medium">
                  {coffee.process}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats bento grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-container-low rounded-[1rem] p-3 shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
            <div className="flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-accent text-sm">thermostat</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Temp</span>
            </div>
            <div className="text-lg font-black text-on-surface tracking-tight">
              {coffee.brew_temp ? `${coffee.brew_temp}°` : "-"}
            </div>
          </div>
          <div className="bg-surface-container-low rounded-[1rem] p-3 shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
            <div className="flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-accent text-sm">scale</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Ratio</span>
            </div>
            <div className="text-lg font-black text-on-surface tracking-tight">
              {coffee.dose}:{coffee.water}
            </div>
          </div>
          <div className="bg-surface-container-low rounded-[1rem] p-3 shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
            <div className="flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-accent text-sm">timer</span>
              <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Time</span>
            </div>
            <div className="text-lg font-black text-on-surface tracking-tight">{coffee.time_target}</div>
          </div>
        </div>

        {/* Grind section */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant mb-3">Grind Texture</div>
          <GrindDial
            value={displayGrind}
            range={coffee.grind_range}
            min={gMin}
            max={gMax}
            unit={gUnit}
          />
        </div>

        {/* Technique steps */}
        {techniqueSteps.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant mb-3">Technique</div>
            <div className="space-y-3">
              {techniqueSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 text-xs font-black text-on-surface-variant group-hover:bg-accent group-hover:text-primary transition-all">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed pt-1.5">{step.replace(/^\d+[\.\)]\s*/, "")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning */}
        {coffee.reasoning && (
          <p className="text-sm text-on-surface-variant italic">{coffee.reasoning}</p>
        )}

        {/* Correction result */}
        {correction && (
          <div className={`rounded-[1rem] p-4 ${correction.adjustment === 0 ? "bg-surface-container" : "bg-tertiary-fixed"}`}>
            <div className="text-sm font-semibold text-on-surface mb-1">
              {correction.adjustment === 0 ? "No change needed" : `Adjustment: ${correction.adjustment > 0 ? "+" : ""}${correction.adjustment}`}
            </div>
            <p className="text-sm text-on-surface-variant">{correction.diagnosis}</p>
            {correction.tip && <p className="text-sm text-primary mt-2 font-medium">{correction.tip}</p>}
          </div>
        )}
      </div>

      {/* Brew Timer */}
      {!timerActive ? (
        <button
          onClick={startTimer}
          className="w-full p-4 rounded-full bg-accent text-primary font-bold transition-all hover:brightness-105 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-lg">timer</span>
          Start Brew Timer
        </button>
      ) : (
        <div className="bg-surface-container-lowest rounded-[2rem] p-6 text-center shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
          <div className={`text-5xl font-black text-primary tracking-tight mb-4 ${timerRunning ? "animate-pulse-glow" : ""}`}
               style={timerRunning ? { display: "inline-block" } : undefined}>
            {formatTimer(timerSeconds)}
          </div>
          {timerSeconds === 0 && (
            <p className="text-sm text-accent font-bold mb-3">Time is up!</p>
          )}
          <div className="flex gap-3 justify-center">
            {timerRunning ? (
              <button
                onClick={pauseTimer}
                className="px-6 py-2.5 rounded-full bg-surface-container-high text-on-surface font-bold text-[11px] uppercase tracking-widest flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-lg">pause</span>
                Pause
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="px-6 py-2.5 rounded-full bg-accent text-primary font-bold text-[11px] uppercase tracking-widest flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-lg">play_arrow</span>
                {timerSeconds === 0 ? "Restart" : "Resume"}
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-6 py-2.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-[11px] uppercase tracking-widest flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-lg">restart_alt</span>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Feedback section */}
      {!showFeedback ? (
        <div className="flex gap-3">
          <button
            onClick={() => setShowFeedback(true)}
            className="flex-1 p-3 rounded-full border border-outline-variant bg-surface-container-lowest text-sm font-medium text-on-surface-variant hover:border-outline transition-all"
          >
            How did it taste?
          </button>
          <button
            onClick={() => onSave({
              ...coffee,
              final_grind: displayGrind,
              technique: correction?.updated_technique || coffee.technique,
            })}
            className="flex-1 p-3 rounded-full bg-accent text-primary text-sm font-bold transition-all hover:brightness-105"
          >
            Save to library
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant p-5 space-y-3 shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
          <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">How was the brew?</h3>
          <div className="grid grid-cols-2 gap-2">
            {FEEDBACK_PRESETS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFeedback(f.value)}
                disabled={feedbackLoading}
                className="p-3 rounded-[1rem] border border-outline-variant text-center hover:border-accent transition-all disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-2xl text-accent">{f.icon}</span>
                <div className="text-xs text-on-surface-variant mt-1">{f.label}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Or describe in your own words..."
              className="flex-1 p-3 rounded-[1rem] bg-surface-container-highest text-sm text-on-surface placeholder-outline border-b-2 border-transparent focus:border-accent focus:outline-none transition-all"
            />
            <button
              onClick={() => feedbackText && handleFeedback(feedbackText)}
              disabled={!feedbackText || feedbackLoading}
              className="px-4 py-3 rounded-[1rem] bg-accent text-primary text-sm font-bold disabled:opacity-40"
            >
              {feedbackLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
