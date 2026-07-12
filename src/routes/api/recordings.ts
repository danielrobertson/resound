import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { auth } from '@/lib/auth'
import { db, schema } from '@/lib/db'

// Cap uploads so a single request can't exhaust Worker memory. Bump once
// multipart/streaming uploads are wired for large lesson videos.
const MAX_BYTES = 100 * 1024 * 1024 // 100 MB

function kindFromType(contentType: string): 'video' | 'audio' | 'file' {
  if (contentType.startsWith('video/')) return 'video'
  if (contentType.startsWith('audio/')) return 'audio'
  return 'file'
}

// POST /api/recordings — accept a multipart file upload, store the bytes in R2
// (env.MEDIA) and persist a metadata row scoped to the signed-in user.
export const Route = createFileRoute('/api/recordings')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const form = await request.formData()
        const file = form.get('file')
        if (!(file instanceof File) || file.size === 0) {
          return Response.json({ error: 'No file provided' }, { status: 400 })
        }
        if (file.size > MAX_BYTES) {
          return Response.json(
            { error: 'File exceeds the 100 MB limit' },
            { status: 413 },
          )
        }

        const id = crypto.randomUUID()
        const contentType = file.type || 'application/octet-stream'
        const storageKey = `${session.user.id}/${id}`

        await env.MEDIA.put(storageKey, await file.arrayBuffer(), {
          httpMetadata: { contentType },
        })

        await db.insert(schema.recording).values({
          id,
          userId: session.user.id,
          kind: kindFromType(contentType),
          title: file.name || 'Untitled recording',
          contentType,
          size: file.size,
          storageKey,
        })

        return Response.json({ id }, { status: 201 })
      },
    },
  },
})
