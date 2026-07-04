import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/session'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'

export const Route = createFileRoute('/signup')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
  beforeLoad: async ({ search }) => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: (search.redirect ?? '/home') as '/home' })
    }
  },
  component: SignupPage,
  head: () => ({ meta: [{ title: 'Create your account · Resound' }] }),
})

function SignupPage() {
  const { redirect: redirectTo } = Route.useSearch()
  return (
    <AuthShell>
      <AuthForm mode="signup" redirectTo={redirectTo ?? '/home'} />
    </AuthShell>
  )
}
