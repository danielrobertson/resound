import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Sparkle, VideoCamera } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { useSession } from '@/lib/auth-client'
import { WaveMark } from '@/components/WaveMark'

export const Route = createFileRoute('/')({ component: Home })

/* ------------------------------- waveform data --------------------------- */

// Deterministic bar heights (module scope) so SSR and client markup match.
const WAVE_BARS = Array.from({ length: 56 }, (_, i) => {
  const wob =
    Math.sin(i * 0.9) * 0.5 +
    Math.sin(i * 0.33 + 1.7) * 0.35 +
    Math.sin(i * 2.1 + 0.4) * 0.15
  return 16 + (wob * 0.5 + 0.5) * 76
})

// Chip delay = sweep duration (9s, see styles.css) × horizontal position, so
// each tag pops exactly as the playhead passes it.
const MOMENTS = [
  { label: 'Bow hold', left: '18%', top: '8%', delay: '1.62s' },
  { label: 'Vibrato', left: '46%', top: '0%', delay: '4.14s' },
  { label: 'Bar 12 · intonation', left: '74%', top: '12%', delay: '6.66s' },
]

/* --------------------------------- helpers ------------------------------- */

/** Fades a block up once it scrolls into view. Content is visible immediately
 *  for reduced-motion users (see styles.css). */
function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -48px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('reveal', shown && 'is-shown', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

/** Signed-in state aware CTA pair, shared by the hero and the closing band. */
function Ctas() {
  const { data: session, isPending } = useSession()
  const signedIn = !!session

  if (isPending) return null

  return signedIn ? (
    <Link
      to="/studio"
      className={cn(buttonVariants({ size: 'lg' }), 'group gap-2')}
    >
      Open your studio
      <ArrowRight
        weight="light"
        className="size-4 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  ) : (
    <>
      <Link
        to="/signup"
        className={cn(buttonVariants({ size: 'lg' }), 'group gap-2')}
      >
        Get started
        <ArrowRight
          weight="light"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
      <Link
        to="/login"
        className={buttonVariants({ variant: 'outline', size: 'lg' })}
      >
        Sign in
      </Link>
    </>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </span>
  )
}

/* ---------------------------- lesson timeline ---------------------------- */

function WaveformBars({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 120" className={className} aria-hidden>
      {WAVE_BARS.map((h, i) => (
        <rect
          key={i}
          x={i * 10 + 2}
          y={60 - h / 2}
          width={5}
          height={h}
          rx={2.5}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}

/** The signature: a recorded lesson's waveform with a playhead sweeping at
 *  playback speed, AI tags popping in as it passes each taught moment. */
function LessonTimeline() {
  return (
    <div className="rounded-[2rem] border border-border/60 bg-muted/30 p-2 shadow-sm">
      <div className="rounded-[calc(2rem-0.5rem)] border bg-card px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] sm:px-7 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <VideoCamera weight="light" className="size-4 shrink-0 text-primary" />
            <span className="truncate">Violin — Lesson 12</span>
          </span>
          <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            This week
          </span>
        </div>

        <div className="relative mt-6">
          {/* Unplayed waveform */}
          <WaveformBars className="w-full text-foreground/15" />
          {/* Played portion, revealed in sync with the playhead */}
          <div className="wave-active pointer-events-none absolute inset-0 text-primary" aria-hidden>
            <WaveformBars className="h-full w-full" />
          </div>
          {/* Playhead */}
          <div className="wave-playhead pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-y-0 right-0 w-px bg-primary" />
            <div className="absolute -top-1.5 right-0 size-2.5 translate-x-1/2 rounded-full bg-primary" />
          </div>
          {/* AI moment tags */}
          {MOMENTS.map((m) => (
            <div
              key={m.label}
              className="pointer-events-none absolute -translate-x-1/2"
              style={{ left: m.left, top: m.top }}
            >
              <span
                className="wave-chip flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-[11px] font-medium whitespace-nowrap shadow-sm"
                style={{ animationDelay: m.delay }}
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkle weight="light" className="size-3.5 text-primary" />
            3 moments tagged by AI insight
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">24:36</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------- feature illustrations ------------------------- */
/* Static state shows the faint outline; hovering the card draws the primary
   strokes and settles the nodes (see .illo-* rules in styles.css). */

function CaptureIllo() {
  return (
    <svg viewBox="0 0 220 96" className="h-24 w-full" aria-hidden>
      {/* Microphone */}
      <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" fill="none">
        <rect x={101} y={20} width={18} height={30} rx={9} />
        <path d="M 94 44 a 16 16 0 0 0 32 0" />
        <line x1={110} y1={60} x2={110} y2={68} />
        <line x1={100} y1={68} x2={120} y2={68} />
      </g>
      {/* Faint resting arcs */}
      <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.2}>
        <path d="M 132 30 a 22 22 0 0 1 0 28" />
        <path d="M 140 24 a 32 32 0 0 1 0 40" />
        <path d="M 88 30 a 22 22 0 0 0 0 28" />
        <path d="M 80 24 a 32 32 0 0 0 0 40" />
      </g>
      {/* Sound arcs draw outward on hover */}
      <g className="text-primary" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" fill="none">
        <path className="illo-draw" style={{ '--illo-len': 34 } as React.CSSProperties} d="M 132 30 a 22 22 0 0 1 0 28" />
        <path className="illo-draw" style={{ '--illo-len': 48, transitionDelay: '90ms' } as React.CSSProperties} d="M 140 24 a 32 32 0 0 1 0 40" />
        <path className="illo-draw" style={{ '--illo-len': 34 } as React.CSSProperties} d="M 88 30 a 22 22 0 0 0 0 28" />
        <path className="illo-draw" style={{ '--illo-len': 48, transitionDelay: '90ms' } as React.CSSProperties} d="M 80 24 a 32 32 0 0 0 0 40" />
      </g>
      {/* Recording light blinks on */}
      <circle className="illo-node fill-destructive" cx={126} cy={16} r={3.5} />
    </svg>
  )
}

const RECALL_BARS = Array.from({ length: 17 }, (_, i) => {
  return 10 + (Math.sin(i * 1.3 + 0.6) * 0.5 + 0.5) * 34
})
const RECALL_FOUND = new Set([11, 12, 13])

function RecallIllo() {
  return (
    <svg viewBox="0 0 220 96" className="h-24 w-full" aria-hidden>
      {RECALL_BARS.map((h, i) => (
        <rect
          key={i}
          x={22 + i * 11}
          y={48 - h / 2}
          width={5}
          height={h}
          rx={2.5}
          className={RECALL_FOUND.has(i) ? 'fill-[var(--primary)]' : 'fill-current opacity-30'}
        />
      ))}
      {/* Search window slides onto the found moment on hover */}
      <rect
        className="illo-window text-primary"
        style={{ '--illo-shift': '116px' } as React.CSSProperties}
        x={16}
        y={14}
        width={48}
        height={68}
        rx={14}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      />
    </svg>
  )
}

function InsightIllo() {
  return (
    <svg viewBox="0 0 220 96" className="h-24 w-full" aria-hidden>
      {/* Faint resting connections */}
      <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.2}>
        <path d="M 52 60 Q 78 34 100 30" />
        <path d="M 120 32 Q 150 40 168 54" />
      </g>
      {/* Connections draw between topics on hover */}
      <g className="text-primary" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" fill="none">
        <path className="illo-draw" style={{ '--illo-len': 62 } as React.CSSProperties} d="M 52 60 Q 78 34 100 30" />
        <path className="illo-draw" style={{ '--illo-len': 62, transitionDelay: '150ms' } as React.CSSProperties} d="M 120 32 Q 150 40 168 54" />
      </g>
      {/* Topic nodes settle in */}
      <g stroke="currentColor" strokeWidth={1.6} fill="none">
        <circle className="illo-node" cx={44} cy={66} r={9} />
        <circle className="illo-node text-primary" style={{ transitionDelay: '80ms' }} cx={110} cy={26} r={11} />
        <circle className="illo-node" style={{ transitionDelay: '160ms' }} cx={176} cy={60} r={9} />
      </g>
      <g fill="currentColor">
        <circle className="illo-node" cx={44} cy={66} r={2.5} />
        <circle className="illo-node text-primary" style={{ transitionDelay: '80ms' }} cx={110} cy={26} r={2.5} />
        <circle className="illo-node" style={{ transitionDelay: '160ms' }} cx={176} cy={60} r={2.5} />
      </g>
      {/* Spark */}
      <path
        className="illo-node fill-[var(--primary)]"
        style={{ transitionDelay: '240ms' }}
        d="M 140 6 l 2.5 5.5 L 148 14 l -5.5 2.5 L 140 22 l -2.5 -5.5 L 132 14 l 5.5 -2.5 Z"
      />
    </svg>
  )
}

function FeatureCard({
  illustration,
  title,
  description,
  delay,
}: {
  illustration: ReactNode
  title: string
  description: string
  delay: number
}) {
  return (
    <Reveal delay={delay} className="h-full">
      {/* Asymmetric hover timing: a gentle 280ms ease-out lift in (motion
          spread across the full duration, no jump), and a slower 420ms
          ease-in-out settle on the way back. */}
      <div className="group h-full rounded-[1.75rem] border border-border/60 bg-muted/30 p-1.5 transition-[translate,border-color,box-shadow] duration-[420ms] ease-[cubic-bezier(0.37,0,0.63,1)] hover:-translate-y-1 hover:border-border hover:shadow-[0_22px_45px_-28px_rgba(0,0,0,0.35)] hover:duration-[280ms] hover:ease-[cubic-bezier(0.215,0.61,0.355,1)]">
        <div className="flex h-full flex-col rounded-[calc(1.75rem-0.375rem)] bg-card p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="text-foreground/70">{illustration}</div>
          <h3 className="mt-6 font-heading text-lg font-semibold tracking-tight">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </Reveal>
  )
}

/* ---------------------------------- page --------------------------------- */

function Home() {
  return (
    <main id="main" className="relative">
      <div aria-hidden className="hero-wash pointer-events-none absolute inset-x-0 top-0 h-[36rem]" />

      {/* Hero */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-24 pb-24 text-center sm:px-6 sm:pt-32">
        <div className="rise-in">
          <Eyebrow>For the practicing musician</Eyebrow>
        </div>

        <h1 className="rise-in mt-6 max-w-4xl font-heading text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
          Lessons that continue to resonate.
        </h1>

        <p className="rise-in mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
          Record video, audio, and notes from every music lesson — then recall
          any moment in seconds. Resound tags each lesson by topic, time, and
          related themes with AI insight, so nothing your teacher taught you
          gets lost.
        </p>

        {/* min-h reserves the row while the session resolves, so the CTAs
            neither flash the wrong state nor shift the layout. */}
        <div
          className="rise-in mt-9 flex min-h-9 flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: '80ms' }}
        >
          <Ctas />
        </div>

        <div
          className="rise-in mt-20 w-full max-w-3xl"
          style={{ animationDelay: '160ms' }}
        >
          <LessonTimeline />
        </div>
      </section>

      {/* Features — carries the old /about message */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>The practice companion</Eyebrow>
          <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Practice with perfect recall.
          </h2>
          <p className="mt-4 text-lg leading-8 text-pretty text-muted-foreground">
            Resound turns each week's lesson into a searchable library — so you
            can revisit exactly what your teacher said the moment you need it,
            long after the lesson ends.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          <FeatureCard
            illustration={<CaptureIllo />}
            title="Capture the lesson"
            description="Video, audio clips, and written notes from every lesson land together in one place."
            delay={0}
          />
          <FeatureCard
            illustration={<RecallIllo />}
            title="Recall any moment"
            description="Search by name, tag, or time and jump straight back to the exact bar your teacher marked."
            delay={90}
          />
          <FeatureCard
            illustration={<InsightIllo />}
            title="Connect the themes"
            description="AI insight tags each recording and links related topics across your lessons."
            delay={180}
          />
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-5xl px-4 pb-28 sm:px-6">
        <Reveal>
          <div className="rounded-[2.25rem] border border-border/60 bg-muted/30 p-2 shadow-sm">
            <div className="relative overflow-hidden rounded-[calc(2.25rem-0.5rem)] border bg-card px-6 py-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] sm:py-20 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <WaveMark
                aria-hidden
                className="pointer-events-none absolute -right-8 -bottom-12 size-56 text-primary/[0.07]"
              />
              <h2 className="relative mx-auto max-w-lg font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Your teacher said it once. Keep it for good.
              </h2>
              <p className="relative mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
                Set up your studio in a minute — your first recording can be
                this week's lesson.
              </p>
              <div className="relative mt-8 flex min-h-9 flex-col items-center justify-center gap-3 sm:flex-row">
                <Ctas />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  )
}
