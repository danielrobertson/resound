import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { signOut, useSession } from '@/lib/auth-client'
import { WaveMark } from '@/components/WaveMark'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()
  const signedIn = !!session

  async function handleSignOut() {
    await signOut()
    await navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md font-heading text-sm font-semibold tracking-tight focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <WaveMark className="size-3.5" />
          </span>
          resound
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {/* Hide auth actions until the session resolves to avoid a flash of
              the wrong state on first paint. */}
          {!isPending &&
            (signedIn ? (
              <>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'hidden sm:inline-flex',
                  )}
                >
                  Sign out
                </button>
                <Link
                  to="/studio"
                  className={buttonVariants({ variant: 'default', size: 'sm' })}
                >
                  Studio
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'hidden sm:inline-flex',
                  )}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className={buttonVariants({ variant: 'default', size: 'sm' })}
                >
                  Get started
                </Link>
              </>
            ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
