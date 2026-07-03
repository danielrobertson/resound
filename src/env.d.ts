// Augments the Wrangler-generated Cloudflare.Env (worker-configuration.d.ts).
// Kept separate so `wrangler types` regeneration never clobbers these.
declare namespace Cloudflare {
  interface Env {
    /** Auth signing secret. Set in .dev.vars locally; a Worker secret in prod. */
    BETTER_AUTH_SECRET: string;
    /** Public base URL of the app, e.g. http://localhost:3000 */
    BETTER_AUTH_URL: string;
  }
}
