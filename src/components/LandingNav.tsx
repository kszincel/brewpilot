"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export function LandingNav() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffba38]">coffee</span>
          <span className="text-xl font-black text-[#271310] tracking-tighter">Brewpilot</span>
        </div>
        <div className="hidden md:flex gap-8 items-center text-sm tracking-tight">
          <a className="text-stone-600 hover:text-[#ffba38] transition-colors" href="#how-it-works">How it works</a>
          <a className="text-stone-600 hover:text-[#ffba38] transition-colors" href="#features">Features</a>
        </div>
        <div className="flex items-center gap-4">
          {loggedIn ? (
            <Link href="/app" className="px-6 py-2 bg-[#ffba38] text-[#281900] rounded-full font-bold shadow-sm hover:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">dashboard</span>
              Open App
            </Link>
          ) : (
            <>
              <Link href="/app" className="px-6 py-2 rounded-full font-medium text-[#271310] hover:opacity-80 transition-all hidden sm:block">
                Sign In
              </Link>
              <Link href="/app" className="px-6 py-2 bg-[#ffba38] text-[#281900] rounded-full font-bold shadow-sm hover:scale-95 transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
