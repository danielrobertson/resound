import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'

/**
 * Server-only: resolve the Better Auth session from the incoming request's
 * cookies. Returns `null` when the visitor is not signed in.
 *
 * Call this from a route's `beforeLoad` to guard it — see `routes/studio.tsx`.
 * (Distinct from the browser-side `getSession` in `auth-client.ts`.)
 */
export const getSession = createServerFn({ method: 'GET' }).handler(() =>
  auth.api.getSession({ headers: getRequestHeaders() }),
)
