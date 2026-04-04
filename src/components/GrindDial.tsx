"use client";

interface GrindDialProps {
  value: number;
  range?: [number, number];
  min: number;
  max: number;
  unit: string;
  onChange?: (value: number) => void;
  interactive?: boolean;
}

export function GrindDial({ value, range, min, max, unit, onChange, interactive = false }: GrindDialProps) {
  const steps = max - min + 1;
  const showAll = steps <= 20;

  if (showAll) {
    return (
      <div className="flex flex-col gap-3">
        {/* Active value pill */}
        <div className="flex items-center justify-between">
          <span className="text-[8px] uppercase tracking-widest font-bold text-on-surface-variant">Fine</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-primary text-[10px] uppercase tracking-[0.1em] font-bold">
            DIAL {value}
          </span>
          <span className="text-[8px] uppercase tracking-widest font-bold text-on-surface-variant">Coarse</span>
        </div>

        {/* Horizontal track with dots */}
        <div className="flex items-center gap-1.5 justify-center flex-wrap">
          {Array.from({ length: steps }, (_, i) => min + i).map((step) => {
            const active = step === value;
            const inRange = range && step >= range[0] && step <= range[1];
            return (
              <button
                key={step}
                type="button"
                disabled={!interactive}
                onClick={() => interactive && onChange?.(step)}
                className={`
                  rounded-full flex items-center justify-center transition-all duration-300
                  ${active
                    ? "w-8 h-8 bg-accent text-primary text-xs font-black shadow-[0_4px_12px_rgba(255,186,56,0.3)]"
                    : inRange
                      ? "w-4 h-4 bg-surface-container"
                      : "w-3 h-3 bg-outline-variant"
                  }
                  ${interactive ? "cursor-pointer hover:scale-125" : "cursor-default"}
                `}
              >
                {active ? step : ""}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // For grinders with many steps - slider with gold accent
  return (
    <div className="flex flex-col gap-3">
      {/* Active value pill */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-primary text-[10px] uppercase tracking-[0.1em] font-bold">
          DIAL {value}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[8px] uppercase tracking-widest font-bold text-on-surface-variant w-10">Fine</span>
        <div className="flex-1 relative">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => interactive && onChange?.(Number(e.target.value))}
            disabled={!interactive}
            className="w-full accent-accent"
          />
          {range && (
            <div
              className="absolute top-0 h-full bg-surface-container rounded-full pointer-events-none opacity-60"
              style={{
                left: `${((range[0] - min) / (max - min)) * 100}%`,
                width: `${((range[1] - range[0]) / (max - min)) * 100}%`,
              }}
            />
          )}
        </div>
        <span className="text-[8px] uppercase tracking-widest font-bold text-on-surface-variant w-10 text-right">Coarse</span>
      </div>

      <div className="text-center">
        <span className="text-3xl font-black text-primary tracking-tight">{value}</span>
        <span className="text-xs text-on-surface-variant ml-1.5">{unit}</span>
      </div>
    </div>
  );
}
