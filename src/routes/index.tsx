import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-6xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <span className="rise-in inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        For the practicing musician
      </span>

      <h1 className="rise-in mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        Lessons that continue to resonate.
      </h1>

      <p className="rise-in mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
        Record video, audio, and notes from every music lesson — then recall any
        moment in seconds. Resound tags each lesson by topic, time, and related
        themes with AI insight, so nothing your teacher taught you gets lost.
      </p>

      <div
        className="rise-in mt-9 flex flex-col items-center gap-3 sm:flex-row"
        style={{ animationDelay: '80ms' }}
      >
        <Link
          to="/signup"
          className={cn(buttonVariants({ size: 'lg' }), 'group gap-2')}
        >
          Get started
          <ArrowRight
            strokeWidth={1.75}
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
        <Link
          to="/login"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          Sign in
        </Link>
      </div>
    </main>
  )
}
