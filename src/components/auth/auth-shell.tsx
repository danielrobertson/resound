import type { ReactNode } from 'react'
import { WaveMark } from '@/components/WaveMark'

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[oklch(0.153_0.006_107.1)] p-14 text-white lg:flex lg:flex-col lg:justify-between xl:p-20">
      {/* Single soft wash for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07),transparent_65%)] blur-2xl"
      />

      {/* Wordmark */}
      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <WaveMark className="h-5 w-5 text-white" />
        </span>
        <span className="text-lg font-semibold tracking-tight">resound</span>
      </div>

      {/* Editorial headline — the one thing this panel says. Not the page
          heading: the form's title is the h1, and this panel is hidden on
          smaller viewports. */}
      <p className="relative max-w-md font-heading text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-balance xl:text-5xl">
        Lessons that continue to resonate.
      </p>
    </aside>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden lg:grid lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <main
        id="main"
        className="relative flex min-h-[100dvh] items-center justify-center px-4 py-14 sm:px-8"
      >
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
