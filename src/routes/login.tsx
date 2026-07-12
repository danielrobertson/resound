import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/lib/session'
import { AuthShell } from '@/components/auth/auth-shell'
import { AuthForm } from '@/components/auth/auth-form'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
  beforeLoad: async ({ search }) => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: (search.redirect ?? '/studio') as '/studio' })
    }
  },
  component: LoginPage,
  head: () => ({ meta: [{ title: 'Sign in · Resound' }] }),
})

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()
  return (
    <AuthShell>
      <AuthForm mode="login" redirectTo={redirectTo ?? '/studio'} />
    </AuthShell>
  )
}
