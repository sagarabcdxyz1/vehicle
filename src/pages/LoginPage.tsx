import { ArrowRight, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured } from "../lib/env";

export const LoginPage = ({ onLogin }: { onLogin: () => Promise<void> }) => (
  <div className="flex min-h-screen items-center justify-center p-6">
    <div className="grid max-w-5xl gap-6 lg:grid-cols-[1.2fr_0.9fr]">
      <section className="rounded-[36px] bg-ink p-8 text-white shadow-panel lg:p-12">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">FleetFlow SaaS</p>
        <h1 className="mt-6 text-4xl font-semibold leading-tight lg:text-5xl">
          Optimize trips, vehicles, and dispatch decisions from one control tower.
        </h1>
        <p className="mt-6 max-w-xl text-base text-white/72">
          Build predictable trip slots from route timing, assign orders by deadline and capacity, and keep
          operators ahead of delays with realtime fleet visibility.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Trip automation", "Create planned slots from fixed route timings."],
            ["Priority allocation", "Use own fleet first, then agency, then on-call."],
            ["Realtime tracking", "Watch trips, vehicles, and alerts live."]
          ].map(([title, copy]) => (
            <div key={title} className="rounded-3xl bg-white/10 p-4">
              <h2 className="font-medium">{title}</h2>
              <p className="mt-2 text-sm text-white/70">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-white/50 bg-white/85 p-8 shadow-panel backdrop-blur lg:p-10">
        <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
          Protected dashboard
        </div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-900">Sign in to continue</h2>
        <p className="mt-3 text-sm text-slate-600">
          Use Google via Supabase Auth to access the fleet dashboard. When Supabase variables are missing, the
          app falls back to demo mode so the UI still works locally.
        </p>

        <button
          type="button"
          onClick={() => void onLogin()}
          className="mt-8 flex w-full items-center justify-between rounded-3xl bg-ink px-5 py-4 text-left text-white transition hover:bg-slate-800"
        >
          <span>
            <span className="block text-sm text-white/65">Authentication</span>
            <span className="mt-1 block font-medium">
              {isSupabaseConfigured ? "Continue with Google" : "Open demo dashboard"}
            </span>
          </span>
          <ArrowRight />
        </button>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <ShieldCheck size={16} className="text-accent" />
            Setup note
          </div>
          <p className="mt-2">
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable live auth, realtime sync, and persistence.
          </p>
        </div>
      </section>
    </div>
  </div>
);
