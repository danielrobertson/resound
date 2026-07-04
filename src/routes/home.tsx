import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { SignOut, WaveSine } from '@phosphor-icons/react/dist/ssr'
import { getSession } from '@/lib/session'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/home')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { user: session.user }
  },
  head: () => ({ meta: [{ title: 'Home · Resound' }] }),
  component: HomePage,
})

function HomePage() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    await navigate({ to: '/login' })
  }

  return (
    <main className="mx-auto min-h-[calc(100dvh-8rem)] max-w-6xl px-4 py-16 sm:px-6">
      <div className="rise-in flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your studio
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Signed in as {user.email}. This is your lesson home — new recordings
            will land here.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="group w-fit gap-2"
        >
          <SignOut weight="light" className="size-4" />
          Sign out
        </Button>
      </div>

      <div
        className="rise-in mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center"
        style={{ animationDelay: '80ms' }}
      >
        <WaveSine weight="light" className="size-8 text-muted-foreground" />
        <p className="mt-4 max-w-sm text-[15px] text-muted-foreground">
          No lessons yet. Once recording is wired up, every lesson you capture
          will resonate here.
        </p>
      </div>
    </main>
  )
}
