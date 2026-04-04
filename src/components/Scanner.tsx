"use client";

import { useState, useRef, useCallback } from "react";
import { BREW_METHODS, type UserPreferences, type CoffeeProfile } from "@/lib/constants";
import { buildScanPrompt } from "@/lib/prompts";

interface ScannerProps {
  prefs: UserPreferences;
  onResult: (coffee: Partial<CoffeeProfile>) => void;
}

export function Scanner({ prefs, onResult }: ScannerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [brewMethod, setBrewMethod] = useState(prefs.default_brew_method);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1536;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w *= ratio;
            h *= ratio;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const compressed = await Promise.all(
      Array.from(files).slice(0, 3).map(compressImage)
    );
    setImages((prev) => [...prev, ...compressed].slice(0, 3));
  }

  async function handleAnalyze() {
    if (images.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          brewMethod,
          systemPrompt: buildScanPrompt(brewMethod, prefs),
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      onResult({
        ...data,
        brew_method: brewMethod,
        grinder_id: prefs.grinder_id,
        image_url: images[0],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Brew method pills */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant mb-3">Brew method</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {BREW_METHODS.filter((m) => m.id !== "other").map((m) => (
            <button
              key={m.id}
              onClick={() => setBrewMethod(m.id)}
              className={`
                flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5
                ${brewMethod === m.id
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
      </div>

      {/* Upload area - viewfinder style */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="relative rounded-[2rem] p-1 cursor-pointer transition-all group"
      >
        <div className="border-2 border-dashed border-accent rounded-[1.75rem] p-8 text-center bg-surface-container-lowest relative overflow-hidden">
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent rounded-br-lg" />

          {images.length > 0 ? (
            <div className="flex gap-3 justify-center">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-20 h-20 object-cover rounded-[1rem]" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImages((prev) => prev.filter((_, j) => j !== i));
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <div className="w-20 h-20 rounded-[1rem] border-2 border-dashed border-outline-variant flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined">add</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <span className="material-symbols-outlined text-4xl text-accent mb-3 block">qr_code_scanner</span>
              <p className="text-sm text-on-surface font-medium">Align label within frame</p>
              <p className="text-xs text-on-surface-variant mt-1">Up to 3 photos of your coffee package</p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Bento action cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container-lowest rounded-[1rem] p-4 shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
          <span className="material-symbols-outlined text-accent text-2xl mb-2 block">tune</span>
          <div className="text-sm font-bold text-on-surface">Smart Grind</div>
          <div className="text-xs text-on-surface-variant mt-0.5">AI-powered settings</div>
        </div>
        <div className="bg-surface-container-lowest rounded-[1rem] p-4 shadow-[0_32px_64px_-12px_rgba(43,22,17,0.06)]">
          <span className="material-symbols-outlined text-accent text-2xl mb-2 block">thermostat</span>
          <div className="text-sm font-bold text-on-surface">Temp Guide</div>
          <div className="text-xs text-on-surface-variant mt-0.5">Optimal temperature</div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-error text-center bg-error-container p-3 rounded-[1rem]">{error}</p>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={images.length === 0 || loading}
        className="w-full p-4 rounded-full bg-accent text-primary font-bold disabled:opacity-40 transition-all hover:brightness-105 text-[11px] uppercase tracking-widest"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Analyzing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">search</span>
            Analyze coffee
          </span>
        )}
      </button>
    </div>
  );
}
