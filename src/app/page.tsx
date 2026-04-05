import Link from "next/link";
import { LandingNav } from "@/components/LandingNav";

export default function LandingPage() {
  return (
    <div className="bg-[#fff8f6] text-[#2b1611]">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <span className="inline-block px-4 py-1 rounded-full bg-[#fadcd2] text-[#766057] text-xs font-bold tracking-widest uppercase mb-6">
                AI Coffee Advisor
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-[#271310] tracking-tighter leading-[0.9] mb-8">
                Precision<br />Dialing<br /><span className="text-[#ffba38]">with AI.</span>
              </h1>
              <p className="text-xl text-[#504442] max-w-md leading-relaxed mb-10">
                Stop wasting precious beans. Scan your coffee bag, tell us your grinder, and get the perfect extraction recipe in seconds.
              </p>
              <div className="flex gap-4">
                <Link href="/app" className="px-8 py-4 bg-[#271310] text-white rounded-full font-bold text-lg hover:bg-[#3e2723] transition-all">
                  Start Your Brew
                </Link>
                <a href="#how-it-works" className="px-8 py-4 flex items-center gap-2 text-[#271310] font-semibold hover:opacity-70">
                  <span className="material-symbols-outlined">play_circle</span>
                  See the Process
                </a>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#ffe2db] shadow-2xl transform rotate-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp1_4lJnNtb5HfUFiHOzThfvqyFvVeTjJn99bu_QHXZPW_8Hm6SirAlfqkdI51RKIvj7m6HqddAuCkAB_6Xf1n7rehTlLouk-aCVGnzfSe8I_QRZCny-e4Z3-q19Wu6oRQhv7Y0nCUkzwRKIcN98hMHxmHApqwTBtgTS-T3XBm_yKaZeJpEIgi93X0gcN1ozef3ycSOVtQmRNgZ4tpCfhR33Su-iRcnwq1zXi_506aJnsFlitidTtIco-EvJWITYzx-GmOBmDC2y0"
                  alt="Professional coffee brewing setup"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 p-8 backdrop-blur-xl bg-[#ffe9e4]/80 rounded-2xl shadow-xl max-w-xs border border-white/20 transform -rotate-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[#ffba38] filled">auto_awesome</span>
                  <span className="text-sm font-bold uppercase tracking-tighter">AI Dial-In</span>
                </div>
                <p className="text-2xl font-black tracking-tight text-[#271310]">Recipe Refined.</p>
                <p className="text-xs text-[#504442] mt-2">Adjusted grind setting to 4 for Ethiopia Yirgacheffe light roast on Fellow Ode 2.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 bg-[#fff0ed]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <label className="text-xs font-bold tracking-[0.2em] text-[#504442] uppercase mb-4 block">The Workflow</label>
                <h2 className="text-4xl md:text-5xl font-black text-[#271310] tracking-tight">Three steps to the perfect extraction.</h2>
              </div>
              <div className="w-20 h-1 bg-[#ffba38] mb-4" />
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                { num: "01", title: "Scan Your Bag", desc: "Snap a photo of your coffee package. Our AI identifies the roast, origin, process, and tasting notes instantly.", icon: "qr_code_scanner" },
                { num: "02", title: "Get Your Recipe", desc: "Tell us your grinder and brew method. Receive a tailored grind setting, temperature, ratio, and step-by-step technique.", icon: "tune" },
                { num: "03", title: "Dial It In", desc: "Brew it, taste it, give feedback. AI analyzes your notes to refine the recipe for your next cup.", icon: "trending_up" },
              ].map((step) => (
                <div key={step.num} className="group">
                  <div className="text-6xl font-black text-[#271310]/10 mb-4 group-hover:text-[#ffba38] transition-colors">{step.num}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-[#ffba38]">{step.icon}</span>
                    <h3 className="text-xl font-bold text-[#271310]">{step.title}</h3>
                  </div>
                  <p className="text-[#504442]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Bento */}
        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Feature 1 - large */}
              <div className="md:col-span-8 bg-gradient-to-br from-[#271310] to-[#3e2723] rounded-2xl p-10 flex flex-col justify-between relative overflow-hidden min-h-[400px]">
                <div className="z-10">
                  <span className="material-symbols-outlined text-[#ffba38] text-4xl mb-6">psychology</span>
                  <h3 className="text-3xl font-black text-white tracking-tight mb-4">AI Library &amp; History</h3>
                  <p className="text-[#ffdad2]/70 max-w-md text-lg">Every brew is a lesson. Build your personal coffee archive with extraction data and sensory notes.</p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="md:col-span-4 bg-[#fadcd2] rounded-2xl p-10">
                <span className="material-symbols-outlined text-[#271310] text-4xl mb-6">settings_input_component</span>
                <h3 className="text-2xl font-bold text-[#271310] mb-4">Any Grinder</h3>
                <p className="text-[#766057]">Fellow Ode 2, Comandante, 1Zpresso, Timemore, Baratza, or enter your own custom grinder.</p>
              </div>
              {/* Feature 3 */}
              <div className="md:col-span-4 bg-[#ffe2db] rounded-2xl p-10">
                <span className="material-symbols-outlined text-[#271310] text-4xl mb-6">science</span>
                <h3 className="text-2xl font-bold text-[#271310] mb-4">Step-by-Step Technique</h3>
                <p className="text-[#504442]">Not just a grind number. Full brewing instructions with preinfusion, pour timing, and method-specific tips.</p>
              </div>
              {/* Feature 4 - large */}
              <div className="md:col-span-8 bg-white rounded-2xl p-10 flex items-center gap-8 shadow-[0_4px_24px_rgba(43,22,17,0.04)]">
                <div className="hidden md:block w-1/3 aspect-square rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOe3EaxbfsEOXbFGCj6LeLZvPQ2ZckO-71nie_3bpzQn1_2_WiaXiznTx06O4N2SyO0cTFNohUO65uxJaJ0PQnhkqhiB9FOOSp6F4gN9NLR_7oyQ2Bt-DMRzwo8hlOxEHclHiYLEe3OvYkl-n36Sw6ISWaqWOEDb_HjHwz2a_gAaFZaowyBXnIG6l9oj4GL0VZTMK9ByE0eOt6VOfdMw2dqfO5FTxfEhQpjzNIEu93uIJAWdshGZGDB3_cpHPmCyNCKZpgBRO3zTY"
                    alt="Coffee pouring"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#271310] mb-4">The Sensory Feedback Loop</h3>
                  <p className="text-[#504442]">Our AI doesn&apos;t just calculate numbers. Describe how your coffee tasted and get actionable adjustments based on extraction science.</p>
                  <Link href="/app" className="mt-6 text-[#271310] font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
                    Try it now <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#271310] text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Ready to dial it in?</h2>
            <p className="text-[#ffdad2]/70 text-lg mb-10">Free to use. No credit card required.</p>
            <Link href="/app" className="inline-block px-10 py-5 bg-[#ffba38] text-[#281900] rounded-full font-bold text-lg shadow-lg hover:scale-[1.02] transition-all">
              Start Brewing Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-stone-200/15 bg-stone-100">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-8 gap-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffba38]">coffee</span>
            <span className="text-lg font-bold text-stone-800 tracking-tighter">Brewpilot</span>
          </div>
          <div className="flex gap-8 text-xs uppercase tracking-widest text-stone-500">
            <a className="hover:text-[#ffba38] transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#ffba38] transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-[#ffba38] transition-colors" href="#">Contact</a>
          </div>
          <div className="text-xs uppercase tracking-widest text-stone-500">
            &copy; 2025 Brewpilot. Roasted with precision.
          </div>
        </div>
      </footer>
    </div>
  );
}
