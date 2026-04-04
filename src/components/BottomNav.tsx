"use client";

type View = "scan" | "result" | "library";

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const isActive = (view: View) => {
    if (view === "scan") return activeView === "scan" || activeView === "result";
    return activeView === view;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-stone-50/90 backdrop-blur-xl rounded-t-[40px] py-4 px-6 shadow-[0_-16px_48px_-12px_rgba(43,22,17,0.08)]">
      <div className="max-w-lg mx-auto flex justify-around">
        <button
          onClick={() => onNavigate("scan")}
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive("scan") ? "text-accent" : "text-stone-400"
          }`}
        >
          <span className={`material-symbols-outlined text-2xl ${isActive("scan") ? "filled" : ""}`}>
            qr_code_scanner
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Scan</span>
        </button>
        <button
          onClick={() => onNavigate("library")}
          className={`flex flex-col items-center gap-1 transition-all ${
            isActive("library") ? "text-accent" : "text-stone-400"
          }`}
        >
          <span className={`material-symbols-outlined text-2xl ${isActive("library") ? "filled" : ""}`}>
            local_library
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Library</span>
        </button>
      </div>
    </nav>
  );
}
