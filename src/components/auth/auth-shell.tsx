import type { ReactNode } from 'react'

/** Minimal, thin-stroke sound-wave mark for the resound wordmark. */
function WaveMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <line x1="4" y1="9.5" x2="4" y2="14.5" />
      <line x1="9" y1="4.5" x2="9" y2="19.5" />
      <line x1="14" y1="7.5" x2="14" y2="16.5" />
      <line x1="19" y1="2.5" x2="19" y2="21.5" />
    </svg>
  )
}

const FEATURES = ['Video & audio clips', 'AI-tagged recall', 'Notes & topics']

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[oklch(0.153_0.006_107.1)] p-14 text-white lg:flex lg:flex-col lg:justify-between xl:p-20">
      {/* Ambient wash + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.09),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-40 right-[-12%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_62%)] blur-2xl" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:30px_30px]" />
      </div>

      {/* Wordmark */}
      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <WaveMark className="h-5 w-5 text-white" />
        </span>
        <span className="text-lg font-semibold tracking-tight">resound</span>
      </div>

      {/* Editorial headline */}
      <div className="relative max-w-md">
        <span className="mb-7 inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-white/70">
          For student musicians
        </span>
        <h1 className="text-[2.75rem] font-semibold leading-[1.05] tracking-tight xl:text-5xl">
          Lessons that continue to resonate.
        </h1>
        <p className="mt-7 max-w-sm text-[15px] leading-7 text-white/55">
          Capture video, audio, and notes from every lesson — and let AI insight
          surface the moments that matter, right when you need them.
        </p>
      </div>

      {/* Feature pills */}
      <div className="relative flex flex-wrap gap-2">
        {FEATURES.map((f) => (
          <span
            key={f}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-white/65"
          >
            {f}
          </span>
        ))}
      </div>
    </aside>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden lg:grid lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <main className="relative flex min-h-[100dvh] items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          {/* Compact wordmark for viewports where the brand panel is hidden */}
          <div className="mb-9 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-border">
              <WaveMark className="h-4 w-4 text-primary" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              resound
            </span>
          </div>

          {/* Double-Bezel: machined outer tray + inner core */}
          <div className="rise-in rounded-[2rem] border bg-muted/40 p-2 shadow-sm">
            <div className="rounded-[calc(2rem-0.5rem)] border bg-card px-7 py-9 shadow-sm sm:px-9 sm:py-10">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
