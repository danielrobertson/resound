import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="size-5 rounded-md bg-primary" />
          resound
        </Link>

        <div className="ml-6 hidden items-center gap-1 text-sm sm:flex">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: 'text-foreground' }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: 'text-foreground' }}
          >
            About
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
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
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
