import { useRef, useState, type ComponentType } from 'react'
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import {
  ArrowUpRight,
  File,
  Microphone,
  Plus,
  SignOut,
  SpinnerGap,
  UploadSimple,
  VideoCamera,
  WaveSine,
} from '@phosphor-icons/react/dist/ssr'
import { getSession } from '@/lib/session'
import { listRecordings, type Recording } from '@/lib/recordings'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/studio')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user: session.user }
  },
  loader: async () => ({ recordings: await listRecordings() }),
  head: () => ({ meta: [{ title: 'Studio · Resound' }] }),
  component: StudioPage,
})

// Slow, weighty easing borrowed from the design system's rise-in — every
// interaction settles rather than snaps.
const EASE = 'ease-[cubic-bezier(0.32,0.72,0,1)]'

const KIND_ICON: Record<string, ComponentType<{ weight?: any; className?: string }>> = {
  video: VideoCamera,
  audio: WaveSine,
  file: File,
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function StudioPage() {
  const { user } = Route.useRouteContext()
  const { recordings } = Route.useLoaderData()
  const navigate = useNavigate()
  const router = useRouter()

  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function pickFile() {
    inputRef.current?.click()
  }

  async function onFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // let the same file be re-selected later
    if (!file) return

    setError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/recordings', { method: 'POST', body })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Upload failed')
      }
      await router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    await navigate({ to: '/login' })
  }

  const isEmpty = recordings.length === 0

  return (
    <main
      id="main"
      className="mx-auto min-h-[calc(100dvh-8rem)] max-w-6xl px-4 py-16 sm:px-6"
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*,image/*,.pdf"
        className="hidden"
        onChange={onFileChosen}
      />

      <div className="rise-in flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your studio
          </span>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {isEmpty
              ? 'Capture your first lesson moment — it will resonate here.'
              : `${recordings.length} lesson ${recordings.length === 1 ? 'moment' : 'moments'} captured.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEmpty && (
            <Button
              onClick={pickFile}
              disabled={uploading}
              className="group/add w-fit gap-2"
            >
              {uploading ? (
                <SpinnerGap weight="light" className="size-4 animate-spin" />
              ) : (
                <Plus weight="light" className="size-4" />
              )}
              {uploading ? 'Uploading…' : 'Add recording'}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="group w-fit gap-2"
          >
            <SignOut weight="light" className="size-4" />
            Sign out
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rise-in mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {isEmpty ? (
        <EmptyState
          onUpload={pickFile}
          uploading={uploading}
        />
      ) : (
        <section
          className="rise-in mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          style={{ animationDelay: '80ms' }}
        >
          {recordings.map((rec) => (
            <RecordingCard key={rec.id} recording={rec} />
          ))}
        </section>
      )}
    </main>
  )
}

function EmptyState({
  onUpload,
  uploading,
}: {
  onUpload: () => void
  uploading: boolean
}) {
  return (
    <section
      className="rise-in mt-12 grid grid-cols-1 gap-5 md:grid-cols-3"
      style={{ animationDelay: '80ms' }}
    >
      <ActionCard
        icon={UploadSimple}
        title="Upload a file"
        description="Drop in video, audio, or notes you already have from a lesson."
        cta={uploading ? 'Uploading…' : 'Choose a file'}
        onClick={onUpload}
        busy={uploading}
        accent
        delay={0}
      />
      <ActionCard
        icon={VideoCamera}
        title="Open camera"
        description="Record a lesson moment on video, straight from your device."
        cta="Open camera"
        soon
        delay={70}
      />
      <ActionCard
        icon={Microphone}
        title="Record audio"
        description="Capture a passage or spoken note as a quick audio clip."
        cta="Open microphone"
        soon
        delay={140}
      />
    </section>
  )
}

function ActionCard({
  icon: Icon,
  title,
  description,
  cta,
  onClick,
  busy = false,
  accent = false,
  soon = false,
  delay,
}: {
  icon: ComponentType<{ weight?: any; className?: string }>
  title: string
  description: string
  cta: string
  onClick?: () => void
  busy?: boolean
  accent?: boolean
  soon?: boolean
  delay: number
}) {
  const disabled = soon || busy

  return (
    <div
      className="rise-in group"
      style={{ animationDelay: `${120 + delay}ms` }}
    >
      {/* Outer shell of the double-bezel — a machined tray the card sits in. */}
      <div
        className={cn(
          'h-full rounded-[1.75rem] border border-border/60 bg-muted/30 p-1.5 transition-[transform,border-color,box-shadow] duration-500',
          EASE,
          'group-hover:-translate-y-1 group-hover:border-border group-hover:shadow-[0_22px_45px_-28px_rgba(0,0,0,0.35)]',
        )}
      >
        {/* Inner core with its own top highlight for concentric depth. */}
        <div className="relative flex h-full flex-col rounded-[calc(1.75rem-0.375rem)] bg-card p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {soon && (
            <span className="absolute right-5 top-5 rounded-full border border-border/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Soon
            </span>
          )}

          <span
            className={cn(
              'flex size-11 items-center justify-center rounded-2xl transition-transform duration-500',
              EASE,
              accent
                ? 'bg-primary/10 text-primary group-hover:scale-105'
                : 'bg-muted text-foreground/70 group-hover:scale-105',
            )}
          >
            <Icon weight="light" className="size-5" />
          </span>

          <h2 className="mt-5 text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>

          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={soon ? `${title} — coming soon` : cta}
            className={cn(
              'group/cta mt-7 inline-flex w-fit items-center gap-2 rounded-full py-1.5 pr-1.5 pl-4 text-sm font-medium transition-[transform,background-color] duration-500',
              EASE,
              'active:scale-[0.98] disabled:cursor-not-allowed',
              'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              accent
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70'
                : 'bg-muted text-foreground/80 hover:bg-muted/70 disabled:opacity-100',
            )}
          >
            {busy ? (
              <SpinnerGap weight="light" className="size-4 animate-spin" />
            ) : null}
            {cta}
            {/* Button-in-button: the trailing glyph lives in its own circle. */}
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full transition-transform duration-500',
                EASE,
                accent ? 'bg-primary-foreground/15' : 'bg-foreground/5',
                !disabled &&
                  'group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5',
              )}
            >
              <ArrowUpRight weight="light" className="size-3.5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function RecordingCard({ recording }: { recording: Recording }) {
  const Icon = KIND_ICON[recording.kind] ?? File

  return (
    <article
      className={cn(
        'group rounded-[1.5rem] border border-border/60 bg-muted/30 p-1.5 transition-[transform,border-color,box-shadow] duration-500',
        EASE,
        'hover:-translate-y-0.5 hover:border-border hover:shadow-[0_18px_38px_-26px_rgba(0,0,0,0.35)]',
      )}
    >
      <div className="flex h-full flex-col rounded-[calc(1.5rem-0.375rem)] bg-card p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground/70">
          <Icon weight="light" className="size-5" />
        </span>
        <h2 className="mt-4 truncate text-sm font-semibold tracking-tight">
          {recording.title}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="capitalize">{recording.kind}</span> ·{' '}
          {formatSize(recording.size)} · {formatDate(recording.createdAt)}
        </p>
      </div>
    </article>
  )
}
