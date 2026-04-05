"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detect mobile + auto-start camera if permission already granted
  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    if (mobile && navigator.permissions) {
      navigator.permissions.query({ name: "camera" as PermissionName }).then((status) => {
        if (status.state === "granted") {
          requestCamera();
        }
      }).catch(() => {
        // permissions.query not supported for camera (Safari) - don't auto-start
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach stream to video element when camera becomes active and video ref is available
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().then(() => setCameraReady(true));
      };
    }
  }, [cameraActive]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const compressImage = useCallback((source: File | HTMLCanvasElement): Promise<string> => {
    if (source instanceof HTMLCanvasElement) {
      return Promise.resolve(source.toDataURL("image/jpeg", 0.85));
    }
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
      reader.readAsDataURL(source);
    });
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const compressed = await Promise.all(
      Array.from(files).slice(0, 4).map((f) => compressImage(f))
    );
    setImages((prev) => [...prev, ...compressed].slice(0, 4));
  }

  async function requestCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      setCameraReady(false);
      setCameraActive(true);
    } catch {
      // Camera denied or unavailable - stay on upload mode
      setCameraActive(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setCameraReady(false);
  }

  async function capturePhoto() {
    if (!videoRef.current || !cameraReady) return;
    const video = videoRef.current;

    // Flash effect
    setFlashVisible(true);
    setTimeout(() => setFlashVisible(false), 150);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = await compressImage(canvas);

    setImages((prev) => {
      const updated = [...prev, dataUrl].slice(0, 4);
      if (updated.length >= 4) stopCamera();
      return updated;
    });
  }

  async function handleAnalyze() {
    if (images.length === 0) return;
    stopCamera();
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

      {/* Camera viewfinder (mobile) */}
      {cameraActive && (
        <div className="relative rounded-[2rem] overflow-hidden bg-[#271310]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[3/4] object-cover"
          />

          {/* Flash overlay */}
          {flashVisible && (
            <div className="absolute inset-0 bg-white z-20 pointer-events-none" />
          )}

          {/* Viewfinder frame */}
          <div className="absolute inset-8 border-2 border-dashed border-[#ffba38]/40 rounded-xl pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#ffba38] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#ffba38] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#ffba38] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#ffba38] rounded-br-lg" />
          </div>

          {/* Photo thumbnails strip */}
          {images.length > 0 && (
            <div className="absolute top-4 left-4 right-4 flex gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-12 h-12 object-cover rounded-lg border-2 border-white/30" />
                  <button
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#ba1a1a] text-white rounded-full text-[8px] flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 10 }}>close</span>
                  </button>
                </div>
              ))}
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold">
                {images.length}/4
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
            <button
              onClick={() => { stopCamera(); }}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <button
              onClick={capturePhoto}
              disabled={!cameraReady || images.length >= 4}
              className="w-16 h-16 rounded-full bg-[#ffba38] flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-40"
            >
              <div className="w-14 h-14 rounded-full border-2 border-[#271310]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#271310] text-3xl">photo_camera</span>
              </div>
            </button>
            <button
              onClick={() => { stopCamera(); fileRef.current?.click(); }}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined">photo_library</span>
            </button>
          </div>

          {/* Done button when photos taken */}
          {images.length > 0 && (
            <div className="absolute bottom-24 left-0 right-0 flex justify-center">
              <button
                onClick={stopCamera}
                className="px-6 py-2 rounded-full bg-[#ffba38] text-[#271310] font-bold text-sm shadow-lg"
              >
                Done ({images.length} photo{images.length > 1 ? "s" : ""})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload area (desktop, or mobile when camera off) */}
      {!cameraActive && (
        <div className="relative rounded-[2rem] p-1 transition-all group">
          <div className="border-2 border-dashed border-accent rounded-[1.75rem] p-8 text-center bg-surface-container-lowest relative overflow-hidden">
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent rounded-br-lg" />

            {images.length > 0 ? (
              <div>
                <div className="flex gap-3 justify-center flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} alt="" className="w-20 h-20 object-cover rounded-[1rem]" />
                      <button
                        onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <div className="flex gap-2">
                      {isMobile && (
                        <button
                          onClick={() => requestCamera()}
                          className="w-20 h-20 rounded-[1rem] border-2 border-dashed border-accent/50 flex flex-col items-center justify-center text-accent gap-1"
                        >
                          <span className="material-symbols-outlined text-xl">photo_camera</span>
                          <span className="text-[9px] font-bold uppercase">Camera</span>
                        </button>
                      )}
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-[1rem] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline gap-1"
                      >
                        <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                        <span className="text-[9px] font-bold uppercase">Upload</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4">
                <span className="material-symbols-outlined text-4xl text-accent mb-3 block">photo_camera</span>
                <p className="text-sm text-on-surface font-medium mb-4">Snap your coffee bag</p>
                <p className="text-xs text-on-surface-variant mb-5">Front label, back label, or any details. 1-4 photos.</p>
                <div className="flex gap-3 justify-center">
                  {isMobile && (
                    <button
                      onClick={() => requestCamera()}
                      className="px-5 py-2.5 rounded-full bg-accent text-[#271310] font-bold text-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">photo_camera</span>
                      Open Camera
                    </button>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 ${
                      isMobile
                        ? "border border-outline-variant text-on-surface-variant"
                        : "bg-accent text-[#271310]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                    {isMobile ? "Choose File" : "Upload Photos"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
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
