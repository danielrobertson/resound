import { createFileRoute } from '@tanstack/react-router'
import { VideoCamera } from '@phosphor-icons/react/dist/ssr'
import { WaveMark } from '@/components/WaveMark'

/**
 * Screenshot source for `public/og-image.png` (1200×630). Not linked from
 * anywhere — regenerate the PNG by pointing headless Chrome at /og-image.
 */
export const Route = createFileRoute('/og-image')({ component: OgImage })

// Same deterministic waveform as the landing hero (rounded so SSR matches).
const WAVE_BARS = Array.from({ length: 72 }, (_, i) => {
  const wob =
    Math.sin(i * 0.9) * 0.5 +
    Math.sin(i * 0.33 + 1.7) * 0.35 +
    Math.sin(i * 2.1 + 0.4) * 0.15
  return Math.round((16 + (wob * 0.5 + 0.5) * 76) * 10) / 10
})

const PLAYED_BARS = 46 // playhead position, in bars

const MOMENTS = [
  { label: 'Bow hold', left: '16%', top: '-12%' },
  { label: 'Vibrato', left: '42%', top: '-20%' },
  { label: 'Bar 12 · intonation', left: '64%', top: '-8%' },
]

function OgImage() {
  return (
    <div
      id="og-canvas"
      className="dark fixed inset-0 z-[100] grid place-items-center bg-black"
    >
      {/* keep the dev-only TanStack devtools trigger out of the screenshot */}
      <style>{`body > div:last-of-type:not(#og-canvas) { display: none !important; }`}</style>

      <div className="relative flex h-[630px] w-[1200px] shrink-0 flex-col overflow-hidden bg-background px-20 py-16 text-foreground">
        {/* emerald glow, echoing the hero */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(52rem 30rem at 78% -10%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%), radial-gradient(40rem 26rem at -8% 110%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)',
          }}
        />

        {/* wordmark */}
        <div className="relative flex items-center gap-3">
          <WaveMark className="size-9 text-primary" />
          <span className="font-heading text-3xl font-semibold tracking-tight">
            resound
          </span>
        </div>

        {/* headline */}
        <div className="relative mt-14 max-w-4xl">
          <h1 className="font-heading text-[76px] leading-[1.05] font-semibold tracking-tight text-balance">
            Lessons that continue to{' '}
            <span className="text-primary">resonate</span>
          </h1>
          <p className="mt-6 text-2xl leading-snug text-muted-foreground">
            Record video, audio, and notes from every music lesson —
            <br />
            then recall any moment in seconds.
          </p>
        </div>

        {/* waveform card */}
        <div className="relative mt-auto rounded-3xl border border-border/60 bg-card/80 px-10 pt-16 pb-8 shadow-sm">
          <div className="absolute top-5 left-10 flex items-center gap-2 text-base font-medium">
            <VideoCamera weight="light" className="size-5 text-primary" />
            Violin — Lesson 12
          </div>
          <div className="relative">
            <svg viewBox="0 0 720 96" className="h-24 w-full" aria-hidden>
              {WAVE_BARS.map((h, i) => (
                <rect
                  key={i}
                  x={i * 10 + 2}
                  y={48 - (h * 0.8) / 2}
                  width={5}
                  height={h * 0.8}
                  rx={2.5}
                  className={
                    i < PLAYED_BARS ? 'fill-primary' : 'fill-foreground/15'
                  }
                />
              ))}
              <line
                x1={PLAYED_BARS * 10}
                y1={-8}
                x2={PLAYED_BARS * 10}
                y2={96}
                className="stroke-primary"
                strokeWidth={2}
              />
            </svg>
            {MOMENTS.map((m) => (
              <span
                key={m.label}
                className="absolute flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-sm font-medium whitespace-nowrap shadow-sm"
                style={{ left: m.left, top: m.top }}
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
