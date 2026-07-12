import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { signIn, signUp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'login' | 'signup'

const COPY = {
  login: {
    eyebrow: 'Members',
    title: 'Welcome back',
    subtitle: 'Sign in to return to your lessons and pick up right where you left off.',
    action: 'Sign in',
    pending: 'Signing in',
    altText: 'New to resound?',
    altLink: 'Create an account',
    altTo: '/signup',
  },
  signup: {
    eyebrow: 'Get started',
    title: 'Create your account',
    subtitle: 'Start capturing lessons and building your practice library in minutes.',
    action: 'Create account',
    pending: 'Creating account',
    altText: 'Already have an account?',
    altLink: 'Sign in',
    altTo: '/login',
  },
} as const

const FIELD_CLASS = 'h-11 text-[15px]'

export function AuthForm({
  mode,
  redirectTo = '/studio',
}: {
  mode: Mode
  redirectTo?: string
}) {
  const c = COPY[mode]
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const result =
      mode === 'signup'
        ? await signUp.email({ name, email, password })
        : await signIn.email({ email, password })

    if (result.error) {
      setLoading(false)
      setError(result.error.message ?? 'Something went wrong. Please try again.')
      return
    }

    navigate({ to: redirectTo as '/studio' })
  }

  // Staggered entrance: each field animates up slightly after the previous.
  let step = 0
  const rise = (): CSSProperties => ({ animationDelay: `${90 + step++ * 70}ms` })

  return (
    <div>
      <span className="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {c.eyebrow}
      </span>
      <h1 className="mt-5 font-heading text-[2rem] font-semibold leading-tight tracking-tight">
        {c.title}
      </h1>
      <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
        {c.subtitle}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === 'signup' && (
          <Field style={rise()}>
            <Label htmlFor="name" className="text-[13px] text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={FIELD_CLASS}
            />
          </Field>
        )}

        <Field style={rise()}>
          <Label htmlFor="email" className="text-[13px] text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@studio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={FIELD_CLASS}
          />
        </Field>

        <Field style={rise()}>
          <Label htmlFor="password" className="text-[13px] text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            aria-describedby={mode === 'signup' ? 'password-hint' : undefined}
            className={FIELD_CLASS}
          />
          {mode === 'signup' && (
            <p id="password-hint" className="text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          )}
        </Field>

        {error && (
          <div
            role="alert"
            className="rise-in rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] leading-5 text-destructive"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          style={rise()}
          className="group rise-in mt-2 h-11 w-full justify-between pr-2 pl-5 text-[15px]"
        >
          <span className="flex-1 text-center">
            {loading ? `${c.pending}…` : c.action}
          </span>
          <span className="flex size-7 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
            <ArrowRight weight="light" className="size-4" />
          </span>
        </Button>
      </form>

      <p className="mt-7 text-center text-[14px] text-muted-foreground">
        {c.altText}{' '}
        <Link
          to={c.altTo}
          className="rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {c.altLink}
        </Link>
      </p>
    </div>
  )
}

function Field({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="rise-in space-y-2" style={style}>
      {children}
    </div>
  )
}
