import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { desc, eq } from 'drizzle-orm'
import { auth } from './auth'
import { db, schema } from './db'

export type Recording = {
  id: string
  kind: string
  title: string
  contentType: string
  size: number
  createdAt: Date
}

/**
 * Server-only: list the signed-in user's recordings, newest first. Returns an
 * empty array when unauthenticated — the route guard in `routes/studio.tsx` is
 * what actually redirects; this just stays safe if called without a session.
 */
export const listRecordings = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Recording[]> => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) return []

    return db
      .select({
        id: schema.recording.id,
        kind: schema.recording.kind,
        title: schema.recording.title,
        contentType: schema.recording.contentType,
        size: schema.recording.size,
        createdAt: schema.recording.createdAt,
      })
      .from(schema.recording)
      .where(eq(schema.recording.userId, session.user.id))
      .orderBy(desc(schema.recording.createdAt))
  },
)
