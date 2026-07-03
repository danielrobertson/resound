import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        About
      </span>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Practice with perfect recall.
      </h1>
      <p className="mt-5 text-lg leading-8 text-pretty text-muted-foreground">
        Resound helps student musicians capture every lesson — video, audio clips,
        and notes — and turn them into a searchable library. AI insight extracts
        tags, topics, and related themes, so you can revisit exactly what your
        teacher said the moment you need it, whether that's by name, tag, time, or
        subject. Lessons that continue to resonate, long after the lesson ends.
      </p>
    </main>
  )
}
